const $ = id => document.getElementById(id);
const starsCanvas = $("stars");
const ctx = starsCanvas.getContext("2d");

let width = 0;
let height = 0;
let stars = [];

let animationStarted = false;
let chapterTwoReady = false;
let chapterComplete = false;

let tapCount = 0;
let phraseDeck = [];
let phraseIndex = 0;
let currentQuestion = 0;
let quizLocked = false;

let selectedQuestion = null;
let matchedPairs = 0;
let matchLocked = false;
let toastTimer = null;

let starsPaused = false;
let lastFrameTime = 0;
let finaleStarted = false;

const phrases = [
  "Я тебя люблю 😘",
  "Ты самая лучшая ❤️",
  "Ты у меня одна такая 💝",
  "Ты не должна быть идеальной 🌹",
  "Ты такая какая есть 🫠",
  "Ты принцесса 👸",
  "Ты лучик солнца 🌄",
  "Ты для меня все 🫶",
  "Кроме тебя нет никого лучше ❗",
  "Ты умничка ✨",
  "Ты справишься 💪",
  "У тебя все получится ✊",
  "Иы добьёшься всего 🫦",
  "Я всегда рядом 🥹",
  "Мы есть друг у друга ❤️‍🩹",
  "Ты самое главное для меня 💝",
  "Что бы не говорила люблю тебя 👅",
  "Солнце светит ярко но твоя улыбка ярче 💖",
  "Кошки милые а ты милее 🥰",
  "Ти и есть мой котёнок 🐱",
  "Люблю когда ты мной командуешь 🫦",
  "Люблю тебя обнимать 😽",
  "Люблю тебя целовать 💋",
  "Люблю твои глазки 💚",
  "Люблю твои губки 🛐",
  "Целую тебя ❣️",
  "Обнимаю крепка 💘",
  "Год пролетел так быстро..",
  "Ты шо ваще такой красивой быть 🥹",
  "А я тебя люблю))",
  "Утютюююю💝",
  "Утютюю? 😳",
  "А я люблю тебя больше 👅💖",
  "А люблю тебя на х2 раза больше всегда",
  "Нить ти какашка 🤭",
  "Скора вместе 😳",
  "Навсегда навсегда вместе 🤍🩷",
  "Твой любимый цвет.. Розовый!",
  "Нет твой любимый цвет белый?",
  "Хихи тебе так интересно что я для тебя создал ❤️‍🩹",
  "⭐ Звезды не бесконечны..",
  "Второй фрагмент нашей истории может появиться в любой момент 🕘",
  "Все проведённые время вместе это счастье!",
  "Все ты читаешь я думал сам 💪🫦",
  "Ти не грусти 🥺",
  "Самая лучшая девушка на свете 💥💗",
  "Моя пуська сладкая ❤️",
  "Ах ти лапочка укусить тебя ))",
  "Поцеловать надя"
];

const quizQuestions = [
  {
    question: "Кто самая лучшая девушка на свете?",
    answers: [
      { text: "Женечка 💗", correct: true },
      { text: "Кто-то 😳", message: "Кто? 🤨" },
      { text: "Конечно Егор", message: "Не, я буду потом) 😏" }
    ],
    success: ""
  },
  {
    question: "Кого любит Егор?",
    answers: [
      { text: "Маму", message: "Маму, это само собой 😌" },
      { text: "Себя", message: "Есть такое 😎" },
      { text: "Женечку ❤️", correct: true }
    ],
    success: "Конечно тебя, моя лапочка 💘"
  },
  {
    question: "Куда мы ходили при первой нашей встрече?",
    answers: [
      { text: "Ко мне домой", message: "Это потом 🤭" },
      { text: "Алые паруса", message: "Было бы интересно 😳" },
      { text: "Дельфин", correct: true }
    ],
    success: "Правильно, хорошо покупались! 💗"
  }
];

// Удалён только пример «Какой год? — 2027».
// Остальные шесть пар для игры с колдуном сохранены.
const pairs = [
  {
    id: "meeting",
    question: "Наша первая встреча?",
    answer: "09.06.2025"
  },
  {
    id: "confession",
    question: "Наше честное признание?",
    answer: "На Новый год!"
  },
  {
    id: "love",
    question: "Как сильно я тебя люблю?",
    answer: "Очень сильно"
  },
  {
    id: "name",
    question: "Люблю тебя я...",
    answer: "Женечкааа ❤️"
  },
  {
    id: "kisses",
    question: "Сколько бы ты хотела поцелуев от меня?",
    answer: "Много"
  },
  {
    id: "flowers",
    question: "Когда будет денюшка, я куплю тебе цветочки?",
    answer: "Канешна 🥰"
  }
];

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function shuffle(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function showScene(scene) {
  [
    "loading",
    "chapterTwo",
    "chapterThree",
    "quizScreen",
    "wizardScreen",
    "thirdFragmentScreen",
    "chapterFour"
  ].forEach(id => {
    const item = $(id);

    if (!item) return;

    const active = item === scene;

    item.classList.toggle("active", active);
    item.setAttribute("aria-hidden", String(!active));
  });
}

function showToast(message, duration = 2000) {
  const toast = $("toast");

  clearTimeout(toastTimer);
  toast.classList.remove("show");

  void toast.offsetWidth;

  toast.textContent = message;
  toast.classList.add("show");

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

/* Постоянный звёздный фон.
   Звёзды продолжают существовать между главами. */

function resizeStars() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  width = window.innerWidth;
  height = window.innerHeight;

  starsCanvas.width = Math.round(width * dpr);
  starsCanvas.height = Math.round(height * dpr);

  starsCanvas.style.width = `${width}px`;
  starsCanvas.style.height = `${height}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.min(
    240,
    Math.max(90, Math.floor(width * height / 5500))
  );

  stars = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.35 + 0.2,
    alpha: Math.random() * 0.55 + 0.18,
    speed: Math.random() * 0.22 + 0.035,
    phase: Math.random() * Math.PI * 2,
    tint: Math.random(),
    drift: (Math.random() - 0.5) * 0.09
  }));
}

function drawStars(time = 0) {
  const dt = lastFrameTime
    ? Math.min(40, time - lastFrameTime)
    : 16;

  lastFrameTime = time;

  ctx.clearRect(0, 0, width, height);

  for (const star of stars) {
    if (!starsPaused) {
      star.y += star.speed * (dt / 16);
      star.x += star.drift * (dt / 16);

      if (star.y > height + 3) {
        star.y = -3;
        star.x = Math.random() * width;
      }

      if (star.x < -3) star.x = width + 3;
      if (star.x > width + 3) star.x = -3;
    }

    const twinkle = starsPaused
      ? 0.9
      : 0.72 + Math.sin(time * 0.0012 + star.phase) * 0.28;

    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);

    const rgb = star.tint > 0.8
      ? "255,183,231"
      : star.tint > 0.57
        ? "213,181,255"
        : "255,250,255";

    ctx.fillStyle = `rgba(${rgb},${star.alpha * twinkle})`;
    ctx.fill();
  }

  requestAnimationFrame(drawStars);
}

function typeText(element, text, speed = 75) {
  return new Promise(resolve => {
    element.textContent = "";
    element.classList.add("visible", "typing");

    let index = 0;

    function typeNext() {
      if (index < text.length) {
        element.textContent += text[index++];

        const character = text[index - 1];
        let delay = speed;

        if (/[,.…]/.test(character)) delay = speed * 3;
        if (/[!?]/.test(character)) delay = speed * 2.5;

        setTimeout(typeNext, delay);
      } else {
        element.classList.remove("typing");
        resolve();
      }
    }

    typeNext();
  });
}

/* Глава 1 */

async function startIntro() {
  if (animationStarted) return;

  animationStarted = true;

  await wait(1000);

  await typeText(
    $("lineOne"),
    "Так где-то здесь затерялась частичка...",
    78
  );

  await wait(1200);

  await typeText(
    $("lineTwo"),
    "нашей истории..",
    100
  );

  await wait(2000);

  $("lineOne").classList.add("fade-line");
  $("lineTwo").classList.add("fade-line");
  $("fragment").classList.add("fly-in");

  await wait(3400);

  $("fragment").classList.add("revealed");

  await wait(3500);

  $("loadingStatus").classList.add("hidden");
  $("loading").classList.add("fade-out");

  await wait(1000);

  showScene($("chapterTwo"));
  await startChapterTwo();
}

function assembleText(element, text, startDelay = 0) {
  element.replaceChildren();

  let letterIndex = 0;

  for (const character of text) {
    if (character === " ") {
      element.appendChild(document.createTextNode(" "));
      continue;
    }

    const letter = document.createElement("span");
    letter.className = "flying-letter";
    letter.textContent = character;

    const side = Math.floor(Math.random() * 4);

    let startX;
    let startY;

    if (side === 0) {
      startX = -60 - Math.random() * 120;
      startY = -35 - Math.random() * 100;
    } else if (side === 1) {
      startX = 60 + Math.random() * 120;
      startY = -35 - Math.random() * 100;
    } else if (side === 2) {
      startX = -45 - Math.random() * 100;
      startY = 40 + Math.random() * 100;
    } else {
      startX = 45 + Math.random() * 100;
      startY = 40 + Math.random() * 100;
    }

    letter.style.setProperty("--start-x", `${startX}px`);
    letter.style.setProperty("--start-y", `${startY}px`);
    letter.style.setProperty(
      "--rotation",
      `${Math.random() * 50 - 25}deg`
    );
    letter.style.setProperty(
      "--delay",
      `${startDelay + letterIndex * 30 + Math.random() * 90}ms`
    );

    element.appendChild(letter);
    letterIndex++;
  }

  return startDelay + letterIndex * 30 + 1000;
}

async function startChapterTwo() {
  const first = assembleText(
    $("chapterTitle"),
    "И так ты попала на вторую главу..",
    500
  );

  await wait(first + 500);

  const second = assembleText(
    $("chapterSubtitle"),
    "Где-то здеессь из всех этих звезд спрятан второй фрагмент нашей истории..",
    0
  );

  await wait(second + 1800);

  $("tapHint").classList.add("visible");
  $("tapCounter").classList.add("visible");

  await wait(700);

  chapterTwoReady = true;
}

function shufflePhrases() {
  phraseDeck = shuffle(phrases);
  phraseIndex = 0;
}

function getRandomPhrase() {
  if (phraseIndex >= phraseDeck.length) {
    shufflePhrases();
  }

  return phraseDeck[phraseIndex++];
}

function createBurst(x, y, powerful = false) {
  const layer = $("effectsLayer");

  const core = document.createElement("div");
  core.className = "tap-burst";
  core.style.left = `${x}px`;
  core.style.top = `${y}px`;
  layer.appendChild(core);

  const ring = document.createElement("div");
  ring.className = "burst-ring";
  ring.style.left = `${x}px`;
  ring.style.top = `${y}px`;
  layer.appendChild(ring);

  const count = powerful ? 25 : 8;

  for (let i = 0; i < count; i++) {
    const ray = document.createElement("div");

    ray.className = "burst-ray";
    ray.style.left = `${x}px`;
    ray.style.top = `${y}px`;

    ray.style.setProperty(
      "--angle",
      `${(360 / count) * i + Math.random() * 8}deg`
    );

    ray.style.setProperty(
      "--length",
      `${powerful ? 22 + Math.random() * 45 : 8 + Math.random() * 18}px`
    );

    layer.appendChild(ray);

    setTimeout(() => ray.remove(), 600);
  }

  setTimeout(() => {
    core.remove();
    ring.remove();
  }, 600);
}

function showPhrase(text, x, y) {
  const message = document.createElement("div");

  message.className = "tap-message";
  message.textContent = text;

  message.style.left = `${Math.max(110, Math.min(width - 110, x))}px`;
  message.style.top = `${Math.max(95, Math.min(height - 95, y))}px`;

  message.style.setProperty(
    "--tilt",
    `${Math.random() * 10 - 5}deg`
  );

  $("effectsLayer").appendChild(message);

  setTimeout(() => message.remove(), 2100);
}

function findSecondFragment(x, y) {
  if (chapterComplete) return;

  chapterComplete = true;
  chapterTwoReady = false;

  $("tapHint").classList.remove("visible");
  $("chapterTwo").classList.add("complete");

  createBurst(x, y, true);

  for (let i = 0; i < 6; i++) {
    setTimeout(() => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 20 + Math.random() * 70;

      createBurst(
        Math.max(10, Math.min(width - 10, x + Math.cos(angle) * distance)),
        Math.max(10, Math.min(height - 10, y + Math.sin(angle) * distance)),
        i === 5
      );
    }, i * 65);
  }

  setTimeout(() => {
    $("secondFragment").classList.add("found");
  }, 250);

  setTimeout(() => {
    showScene($("chapterThree"));
  }, 250 + 1150 + 3000);
}

$("chapterTwo").addEventListener("pointerdown", event => {
  if (!chapterTwoReady || chapterComplete) return;

  event.preventDefault();

  const x = event.clientX;
  const y = event.clientY;

  tapCount++;

  $("tapCounter").querySelector("span").textContent = tapCount;

  if (tapCount <= 49) {
    createBurst(x, y, false);
    showPhrase(getRandomPhrase(), x, y);
  } else {
    findSecondFragment(x, y);
  }
});

/* Карта и викторина */

$("pathOne").addEventListener("click", () => {
  showScene($("quizScreen"));

  currentQuestion = 0;
  quizLocked = false;

  renderQuestion();
});

function renderQuestion() {
  const data = quizQuestions[currentQuestion];

  $("questionNumber").textContent = `ВОПРОС ${currentQuestion + 1}`;
  $("questionText").textContent = data.question;

  $("quizProgress").style.width =
    `${((currentQuestion + 1) / 3) * 100}%`;

  $("quizFeedback").textContent = "";

  const list = $("answerList");
  list.replaceChildren();

  shuffle(data.answers).forEach(answer => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "answer-option";
    button.textContent = answer.text;

    button.addEventListener("click", () => chooseAnswer(answer));

    list.appendChild(button);
  });
}

async function chooseAnswer(answer) {
  if (quizLocked) return;

  if (!answer.correct) {
    showToast(answer.message, 2000);
    return;
  }

  quizLocked = true;

  const data = quizQuestions[currentQuestion];

  $("quizFeedback").textContent = data.success || "";

  $("answerList").querySelectorAll("button").forEach(button => {
    button.disabled = true;
  });

  await wait(1600);

  if (currentQuestion < 2) {
    currentQuestion++;
    quizLocked = false;
    renderQuestion();
    return;
  }

  showScene($("chapterThree"));

  $("pathTwo").disabled = false;
  $("pathTwo").classList.remove("path-locked");
  $("pathTwo").classList.add("path-open");

  $("pathTwo").querySelector(".path-state").textContent = "ОТКРЫТ ✧";

  showToast("Второй путь открыт! ✨", 2000);
}

$("pathTwo").addEventListener("click", () => {
  if ($("pathTwo").disabled) return;

  showScene($("wizardScreen"));
  startWizardGame();
});

/* Игра с колдуном: ровно шесть пар */

async function typeWizardIntro() {
  await typeText(
    $("wizardIntro"),
    "Ах! Как ты смогла пройти первый путь? Ах, да! Егор не умеет задавать вопросы! Ну ничего страшного, мой путь ты точно не пройдёшь, вухахаха!",
    35
  );
}

function startWizardGame() {
  selectedQuestion = null;
  matchedPairs = 0;
  matchLocked = false;

  $("matchProgress").textContent =
    `Найдено пар: 0 / ${pairs.length}`;

  $("matchFeedback").textContent = "Выбери вопрос, а затем ответ";
  $("wizardIntro").textContent = "";

  renderMatchCards();
  typeWizardIntro();
}

function renderMatchCards() {
  const qc = $("questionColumn");
  const ac = $("answerColumn");

  qc.replaceChildren();
  ac.replaceChildren();

  for (const [column, title] of [
    [qc, "ВОПРОСЫ"],
    [ac, "ОТВЕТЫ"]
  ]) {
    const label = document.createElement("span");

    label.className = "column-title";
    label.textContent = title;

    column.appendChild(label);
  }

  shuffle(pairs).forEach(pair => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "match-card question-card";
    button.textContent = pair.question;
    button.dataset.pairId = pair.id;

    button.addEventListener("click", () => selectQuestion(button));

    qc.appendChild(button);
  });

  shuffle(pairs).forEach(pair => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "match-card answer-card";
    button.textContent = pair.answer;
    button.dataset.pairId = pair.id;

    button.addEventListener("click", () => selectAnswer(button));

    ac.appendChild(button);
  });
}

function selectQuestion(button) {
  if (matchLocked || button.disabled) return;

  document.querySelectorAll(".question-card.selected").forEach(item => {
    item.classList.remove("selected");
  });

  selectedQuestion = button;
  button.classList.add("selected");

  $("matchFeedback").textContent = "Теперь выбери ответ справа";
}

async function selectAnswer(answerButton) {
  if (matchLocked || answerButton.disabled) return;

  if (!selectedQuestion) {
    $("matchFeedback").textContent = "Сначала выбери вопрос слева";
    return;
  }

  const questionButton = selectedQuestion;
  const correct =
    questionButton.dataset.pairId === answerButton.dataset.pairId;

  if (correct) {
    questionButton.classList.remove("selected");
    questionButton.classList.add("matched");
    answerButton.classList.add("matched");

    questionButton.disabled = true;
    answerButton.disabled = true;

    questionButton.textContent = `✓ ${questionButton.textContent}`;
    answerButton.textContent = `✓ ${answerButton.textContent}`;

    selectedQuestion = null;
    matchedPairs++;

    $("matchProgress").textContent =
      `Найдено пар: ${matchedPairs} / ${pairs.length}`;

    $("matchFeedback").textContent = "Верно! ✨";

    if (matchedPairs === pairs.length) {
      matchLocked = true;
      await wait(1000);
      await wizardDefeated();
    }
  } else {
    questionButton.classList.remove("selected");
    questionButton.classList.add("wrong");

    answerButton.classList.add("wrong");

    $("matchFeedback").textContent = "Не получается!";

    selectedQuestion = null;

    await wait(450);

    questionButton.classList.remove("wrong");
    answerButton.classList.remove("wrong");
  }
}

/* Реплики колдуна появляются по одной */

async function wizardDefeated() {
  const wizard = document.querySelector(".wizard-character");
  const speech = document.querySelector(".wizard-speech");

  $("wizardIntro").textContent = "";

  await typeText($("wizardIntro"), "Вот чёрт! Как?!", 95);
  await wait(1500);

  $("wizardIntro").textContent = "";

  await typeText(
    $("wizardIntro"),
    "А-а-а, нет… Это невозможно! Да ты мастер!",
    68
  );

  await wait(1700);

  $("wizardIntro").textContent = "";

  await typeText(
    $("wizardIntro"),
    "Я ещё до тебя доберусь…",
    78
  );

  await wait(1600);

  const burst = $("wizardBurst");
  burst.replaceChildren();

  for (let i = 0; i < 38; i++) {
    const particle = document.createElement("i");

    particle.className = "wizard-particle";

    particle.style.setProperty(
      "--dx",
      `${Math.cos(i / 38 * Math.PI * 2) * (45 + Math.random() * 150)}px`
    );

    particle.style.setProperty(
      "--dy",
      `${Math.sin(i / 38 * Math.PI * 2) * (45 + Math.random() * 150)}px`
    );

    particle.style.setProperty("--delay", `${Math.random() * 0.15}s`);

    burst.appendChild(particle);
  }

  wizard.style.transition = "transform .65s ease, opacity .65s ease";
  speech.style.transition = "transform .65s ease, opacity .65s ease";

  wizard.style.transform = "scale(1.5) rotate(20deg)";
  wizard.style.opacity = "0";

  speech.style.transform = "translateY(-12px) scale(.96)";
  speech.style.opacity = "0";

  await wait(550);

  showScene($("thirdFragmentScreen"));

  await wait(4300);

  showScene($("chapterFour"));
  await startFinale();
}

/* Глава 4: вступление, остановка звёзд, сердце и послание */

async function startFinale() {
  if (finaleStarted) return;

  finaleStarted = true;

  const intro = $("fourIntro");
  const stage = $("heartStage");
  const heart = $("finalHeart");
  const message = $("finalMessage");
  const footer = $("finalFooter");

  intro.classList.add("show");

  await wait(100);
  await wait(4300);

  intro.classList.remove("show");
  intro.classList.add("leave");

  await wait(1150);

  intro.style.display = "none";

  // Звёзды замирают перед появлением сердца.
  starsPaused = true;

  stage.classList.add("show");

  createHeartParticles(58, false);
  heart.classList.add("form");

  await wait(1450);

  heart.classList.remove("form");
  heart.classList.add("beat");

  await wait(2500);

  heart.classList.remove("beat");
  heart.classList.add("explode");

  // После нескольких ударов сердца частицы разлетаются.
  createHeartParticles(150, true);

  await wait(300);

  // Послание появляется резко после взрыва сердца.
  message.classList.add("show");

  await wait(550);

  footer.classList.add("show");
}

function createHeartParticles(count, burst) {
  const holder = $("heartParticles");

  const palette = [
    "#fff7ff",
    "#ffc0e8",
    "#e6b5ff",
    "#ff8ed4",
    "#b991ff"
  ];

  for (let i = 0; i < count; i++) {
    const particle = document.createElement("i");

    particle.className = "heart-particle";

    if (!burst) {
      // Частицы располагаются по контуру сердца.
      const t = (i / count) * Math.PI * 2;

      const hx = 16 * Math.pow(Math.sin(t), 3);

      const hy = -(
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t)
      );

      particle.classList.add("heart-particle-gathered");

      particle.style.left = `calc(50% + ${hx * 5.2}px)`;
      particle.style.top = `calc(50% + ${hy * 5.2}px)`;

      particle.style.setProperty(
        "--delay",
        `${Math.random() * 0.9}s`
      );

      particle.style.setProperty(
        "--duration",
        `${1.2 + Math.random() * 0.8}s`
      );
    } else {
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * Math.max(width, height) * 0.55;

      particle.style.setProperty(
        "--dx",
        `${Math.cos(angle) * distance}px`
      );

      particle.style.setProperty(
        "--dy",
        `${Math.sin(angle) * distance}px`
      );

      particle.style.setProperty(
        "--delay",
        `${Math.random() * 0.18}s`
      );

      particle.style.setProperty(
        "--duration",
        `${0.8 + Math.random() * 1.2}s`
      );
    }

    particle.style.setProperty(
      "--size",
      `${burst ? 2 + Math.random() * 5 : 2 + Math.random() * 3}px`
    );

    particle.style.setProperty(
      "--particle-color",
      palette[Math.floor(Math.random() * palette.length)]
    );

    holder.appendChild(particle);
  }

  if (burst) {
    setTimeout(() => {
      holder.replaceChildren();
    }, 2200);
  }
}

/* Запуск */

shufflePhrases();
resizeStars();
requestAnimationFrame(drawStars);

window.addEventListener("resize", resizeStars);

window.addEventListener("load", () => {
  showScene($("loading"));
  startIntro();
});