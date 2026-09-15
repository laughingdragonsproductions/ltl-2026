import {
  HANGMAN_RUN_SIZE,
  HANGMAN_TIERS,
  HANGMAN_WORDS,
  type HangmanWord,
} from "./hangman-words";

const DIFF_KEY = "ltl26-hangman-difficulty";
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const PART_ORDER = ["head", "body", "arm-l", "arm-r", "leg-l", "leg-r"];

const HANGMAN_SPRITES: Record<(typeof PART_ORDER)[number], string> = {
  head: "/games/ltl26/hangman/head.png",
  body: "/games/ltl26/hangman/body.png",
  "arm-l": "/games/ltl26/hangman/arm-l.png",
  "arm-r": "/games/ltl26/hangman/arm-r.png",
  "leg-l": "/games/ltl26/hangman/leg-l.png",
  "leg-r": "/games/ltl26/hangman/leg-r.png",
};

function hangmanStageHtml() {
  const parts = PART_ORDER.map(
    (part) =>
      `<img class="hl-part hl-sprite hl-${part}" data-part="${part}" src="${HANGMAN_SPRITES[part]}" alt="" />`
  ).join("");
  return `
    <div class="ltl-hangman-gallows" aria-hidden="true">
      <svg viewBox="0 0 120 160" class="ltl-hangman-frame">
        <line x1="20" y1="150" x2="100" y2="150" stroke="#39ff14" stroke-width="4" />
        <line x1="36" y1="150" x2="36" y2="18" stroke="#39ff14" stroke-width="4" />
        <line x1="36" y1="18" x2="78" y2="18" stroke="#39ff14" stroke-width="4" />
        <line x1="78" y1="18" x2="78" y2="36" stroke="#39ff14" stroke-width="3" />
      </svg>
      <div class="ltl-hangman-sprites">${parts}</div>
    </div>`;
}

export function initHangman(root: HTMLElement) {
  type Tier = keyof typeof HANGMAN_TIERS;
  const state = {
    mode: "menu" as "menu" | "play" | "win",
    tier: "normal" as Tier,
    sessionMode: "run" as "run" | "free",
    wordsSolved: 0,
    runWords: [] as HangmanWord[],
    wordIndex: 0,
    text: "",
    category: "",
    revealed: [] as boolean[],
    guessed: new Set<string>(),
    wrongCount: 0,
    maxMisses: 6,
    hintShown: false,
    limp: false,
    usedWordIds: new Set<string>(),
  };

  root.innerHTML = `
    <div class="ltl-hangman-menu" id="hl-menu">
      <p class="ltl-game-eyebrow">LOUDERTHANLIFE2026</p>
      <h2 class="ltl-game-title">Hangman</h2>
      <p>Guess festival words before the skull goes limp.</p>
      <fieldset class="ltl-hangman-diff">
        <legend>Difficulty</legend>
        <label><input type="radio" name="hl-diff" value="easy" /> Easy</label>
        <label><input type="radio" name="hl-diff" value="normal" checked /> Normal</label>
        <label><input type="radio" name="hl-diff" value="hard" /> Hard</label>
      </fieldset>
      <div class="ltl-hangman-actions">
        <button type="button" class="ltl-btn ltl-btn-primary" id="hl-start-run">Start Word Run</button>
        <button type="button" class="ltl-btn" id="hl-start-free">Free Play</button>
      </div>
    </div>
    <div class="ltl-hangman-play" id="hl-play" hidden>
      <div class="ltl-hangman-hud">
        <p id="hl-progress">Words: <strong>0</strong> / <strong>${HANGMAN_RUN_SIZE}</strong></p>
        <p id="hl-misses">Misses left: <strong>6</strong></p>
        <p id="hl-category"></p>
        <button type="button" class="ltl-btn" id="hl-quit">Menu</button>
      </div>
      <div class="ltl-hangman-stage">
        <div id="hl-gallows">${hangmanStageHtml()}</div>
        <div class="ltl-hangman-word-panel">
          <div class="ltl-hangman-word" id="hl-word"></div>
          <p id="hl-feedback"></p>
          <p id="hl-guessed"></p>
        </div>
      </div>
      <div class="ltl-hangman-keys" id="hl-keys"></div>
    </div>
    <div class="ltl-hangman-win" id="hl-win" hidden>
      <h2>Word wizard!</h2>
      <p>You cleared ${HANGMAN_RUN_SIZE} LTL words. See you in the pit.</p>
      <button type="button" class="ltl-btn ltl-btn-primary" id="hl-play-again">Play again</button>
    </div>
  `;

  const menu = root.querySelector<HTMLElement>("#hl-menu")!;
  const play = root.querySelector<HTMLElement>("#hl-play")!;
  const win = root.querySelector<HTMLElement>("#hl-win")!;
  const gallows = root.querySelector<HTMLElement>("#hl-gallows")!;
  const wordEl = root.querySelector<HTMLElement>("#hl-word")!;
  const feedback = root.querySelector<HTMLElement>("#hl-feedback")!;
  const guessedEl = root.querySelector<HTMLElement>("#hl-guessed")!;
  const keys = root.querySelector<HTMLElement>("#hl-keys")!;
  const progress = root.querySelector<HTMLElement>("#hl-progress")!;
  const misses = root.querySelector<HTMLElement>("#hl-misses")!;
  const categoryEl = root.querySelector<HTMLElement>("#hl-category")!;

  function loadTier(): Tier {
    try {
      const v = localStorage.getItem(DIFF_KEY);
      if (v === "easy" || v === "normal" || v === "hard") return v;
    } catch {
      /* ignore */
    }
    return "normal";
  }

  function saveTier(tier: Tier) {
    try {
      localStorage.setItem(DIFF_KEY, tier);
    } catch {
      /* ignore */
    }
  }

  function shuffle<T>(arr: T[]) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function tierConfig() {
    return HANGMAN_TIERS[state.tier];
  }

  function wordPool() {
    return HANGMAN_WORDS.filter((w) => w.tiers.includes(state.tier));
  }

  function pickRunWords() {
    return shuffle(wordPool()).slice(0, HANGMAN_RUN_SIZE);
  }

  function pickRandomWord(): HangmanWord {
    const pool = wordPool();
    const candidates = pool.filter(
      (w) => w.text !== state.text && !state.usedWordIds.has(w.id)
    );
    const pick = shuffle(candidates.length ? candidates : pool)[0];
    return pick ?? { id: "pit", text: "PIT", category: "Festival", tiers: ["easy"] };
  }

  function renderParts() {
    const visible = Math.min(state.wrongCount, PART_ORDER.length);
    gallows.querySelectorAll<HTMLElement>(".hl-part").forEach((el, i) => {
      el.classList.toggle("is-shown", i < visible);
    });
  }

  function renderWord() {
    wordEl.innerHTML = state.text
      .split("")
      .map((ch, i) =>
        state.revealed[i]
          ? `<span class="ltl-hangman-letter">${ch}</span>`
          : `<span class="ltl-hangman-blank">_</span>`
      )
      .join("");
  }

  function renderGuessed() {
    guessedEl.textContent = state.guessed.size
      ? `Guessed: ${[...state.guessed].sort().join(" ")}`
      : "";
  }

  function renderHud() {
    progress.innerHTML = `Words: <strong>${state.wordsSolved}</strong> / <strong>${HANGMAN_RUN_SIZE}</strong>`;
    misses.innerHTML = `Misses left: <strong>${Math.max(0, state.maxMisses - state.wrongCount)}</strong>`;
    categoryEl.textContent = tierConfig().showCategory && state.category ? state.category : "";
  }

  function beginWord(entry: HangmanWord) {
    const cfg = tierConfig();
    state.text = entry.text.toUpperCase();
    state.category = entry.category;
    state.usedWordIds.add(entry.id);
    state.revealed = state.text.split("").map(() => false);
    state.guessed = new Set();
    state.wrongCount = 0;
    state.maxMisses = cfg.misses;
    state.hintShown = false;
    state.limp = false;
    gallows.classList.remove("is-limp");
    gallows.querySelectorAll(".hl-part").forEach((p) => p.classList.remove("is-shown"));
    keys.querySelectorAll<HTMLButtonElement>(".ltl-hangman-key").forEach((btn) => {
      btn.disabled = false;
      btn.classList.remove("is-correct", "is-wrong");
    });
    feedback.textContent = "";
    renderHud();
    renderWord();
    renderGuessed();
    renderParts();
  }

  function onWordSolved() {
    feedback.textContent = `You got it — ${state.text}!`;
    state.wordsSolved += 1;
    renderHud();
    if (state.sessionMode === "free") {
      window.setTimeout(() => beginWord(pickRandomWord()), 900);
      return;
    }
    if (state.wordsSolved >= HANGMAN_RUN_SIZE) {
      window.setTimeout(() => {
        win.hidden = false;
        state.mode = "win";
      }, 700);
      return;
    }
    state.wordIndex += 1;
    window.setTimeout(() => beginWord(state.runWords[state.wordIndex]), 900);
  }

  function onWordFailed() {
    state.limp = true;
    gallows.classList.add("is-limp");
    feedback.textContent = `The word was ${state.text}. Next word…`;
    window.setTimeout(() => beginWord(pickRandomWord()), 1400);
  }

  function guessLetter(letter: string) {
    if (state.mode !== "play" || state.limp) return;
    if (state.guessed.has(letter)) return;
    state.guessed.add(letter);
    const btn = keys.querySelector<HTMLButtonElement>(`[data-letter="${letter}"]`);
    if (btn) btn.disabled = true;

    if (state.text.includes(letter)) {
      btn?.classList.add("is-correct");
      state.text.split("").forEach((ch, i) => {
        if (ch === letter) state.revealed[i] = true;
      });
      feedback.textContent = `${letter} is in the word!`;
      renderWord();
      renderGuessed();
      if (state.revealed.every(Boolean)) onWordSolved();
      return;
    }

    btn?.classList.add("is-wrong");
    state.wrongCount += 1;
    feedback.textContent = "Not in this word.";
    renderHud();
    renderGuessed();
    renderParts();

    const cfg = tierConfig();
    if (
      cfg.hintAfterWrong &&
      state.wrongCount >= cfg.hintAfterWrong &&
      !state.hintShown &&
      !state.revealed[0]
    ) {
      state.hintShown = true;
      state.revealed[0] = true;
      feedback.textContent = "First letter hint!";
      renderWord();
      if (state.revealed.every(Boolean)) onWordSolved();
      return;
    }

    if (state.wrongCount >= state.maxMisses) onWordFailed();
  }

  function showMenu() {
    state.mode = "menu";
    menu.hidden = false;
    play.hidden = true;
    win.hidden = true;
    state.tier = loadTier();
    root.querySelectorAll<HTMLInputElement>('input[name="hl-diff"]').forEach((input) => {
      input.checked = input.value === state.tier;
    });
  }

  function startSession(mode: "run" | "free") {
    state.mode = "play";
    state.sessionMode = mode;
    state.tier = loadTier();
    state.wordsSolved = 0;
    state.wordIndex = 0;
    state.usedWordIds = new Set();
    state.runWords = mode === "run" ? pickRunWords() : [];
    menu.hidden = true;
    play.hidden = false;
    win.hidden = true;
    beginWord(state.runWords[0] ?? pickRandomWord());
  }

  LETTERS.forEach((letter) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ltl-hangman-key";
    btn.textContent = letter;
    btn.dataset.letter = letter;
    btn.addEventListener("click", () => guessLetter(letter));
    keys.appendChild(btn);
  });

  root.querySelector("#hl-start-run")?.addEventListener("click", () => startSession("run"));
  root.querySelector("#hl-start-free")?.addEventListener("click", () => startSession("free"));
  root.querySelector("#hl-quit")?.addEventListener("click", showMenu);
  root.querySelector("#hl-play-again")?.addEventListener("click", showMenu);
  root.querySelectorAll<HTMLInputElement>('input[name="hl-diff"]').forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        state.tier = input.value as Tier;
        saveTier(state.tier);
      }
    });
  });

  const onKey = (e: KeyboardEvent) => {
    if (state.mode !== "play" || !win.hidden) return;
    const key = e.key.toUpperCase();
    if (key.length === 1 && key >= "A" && key <= "Z") {
      e.preventDefault();
      guessLetter(key);
    }
  };
  window.addEventListener("keydown", onKey);
  showMenu();

  return () => window.removeEventListener("keydown", onKey);
}
