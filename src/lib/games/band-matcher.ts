import {
  BAND_MATCHER_BANDS,
  BAND_MATCHER_DIFFICULTIES,
  bandMatcherBuildDeck,
  bandMatcherCreateRng,
  bandMatcherGridColumns,
  bandMatcherPickRandomBands,
  bandMatcherShuffle,
  type Band,
  type BandMatcherDifficulty,
} from "./band-matcher-logic";

export function initBandMatcher(mount: HTMLElement) {
  if (BAND_MATCHER_BANDS.length < 4) {
    mount.innerHTML = `
      <p class="ltl-band-empty">Band logos are still uploading — check back soon.</p>
    `;
    return () => {};
  }

  mount.innerHTML = `
    <section class="ltl-band-matcher" aria-label="Band Matcher memory game">
      <div class="ltl-slider-toolbar">
        <div class="ltl-slider-difficulty" role="group" aria-label="Difficulty">
          ${Object.entries(BAND_MATCHER_DIFFICULTIES)
            .map(
              ([key, { label }]) =>
                `<button type="button" class="ltl-btn ltl-btn-soft ltl-diff-btn" data-diff="${key}">${label}</button>`
            )
            .join("")}
        </div>
        <button type="button" class="ltl-btn ltl-btn-primary" id="ltl-bm-shuffle">New game</button>
      </div>
      <div class="ltl-band-controls">
        <div class="ltl-slider-image-picker">
          <label for="ltl-bm-band">Band set</label>
          <select id="ltl-bm-band" class="ltl-slider-select">
            <option value="random">Random bands</option>
            ${BAND_MATCHER_BANDS.map(
              (band) => `<option value="${band.id}">${band.name}</option>`
            ).join("")}
          </select>
        </div>
        <p class="ltl-band-stats"><span id="ltl-bm-moves">0</span> flips · <span id="ltl-bm-pairs">0</span> / <span id="ltl-bm-total">0</span> pairs</p>
      </div>
      <div id="ltl-bm-board" class="ltl-band-board" role="grid"></div>
      <div id="ltl-bm-win" class="ltl-band-win" hidden>
        <p class="ltl-slider-win-title">All pairs matched!</p>
        <p id="ltl-bm-win-body"></p>
        <button type="button" class="ltl-btn ltl-btn-primary" id="ltl-bm-play-again">Play again</button>
      </div>
      <p class="ltl-slider-hint">Flip two tiles — match band logo pairs. Fewer flips wins bragging rights.</p>
    </section>
  `;

  const boardEl = mount.querySelector<HTMLElement>("#ltl-bm-board")!;
  const movesEl = mount.querySelector("#ltl-bm-moves")!;
  const pairsEl = mount.querySelector("#ltl-bm-pairs")!;
  const totalEl = mount.querySelector("#ltl-bm-total")!;
  const winEl = mount.querySelector<HTMLElement>("#ltl-bm-win")!;
  const winBodyEl = mount.querySelector("#ltl-bm-win-body")!;
  const bandSelectEl = mount.querySelector<HTMLSelectElement>("#ltl-bm-band")!;
  const diffBtns = mount.querySelectorAll<HTMLButtonElement>(".ltl-diff-btn");
  const shuffleBtn = mount.querySelector<HTMLButtonElement>("#ltl-bm-shuffle")!;
  const playAgainBtn = mount.querySelector<HTMLButtonElement>("#ltl-bm-play-again")!;

  let difficulty: BandMatcherDifficulty = "easy";
  let rng = bandMatcherCreateRng();
  let activeBands: Band[] = [];
  let deck: { bandId: string; key: string }[] = [];
  let flipped: string[] = [];
  let matched = new Set<string>();
  let moves = 0;
  let lockBoard = false;

  function bandById(id: string) {
    return BAND_MATCHER_BANDS.find((b) => b.id === id);
  }

  function setDifficulty(key: BandMatcherDifficulty) {
    difficulty = key;
    diffBtns.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.diff === key);
    });
  }

  function pickBands(): Band[] {
    const pairCount = BAND_MATCHER_DIFFICULTIES[difficulty].pairs;
    const choice = bandSelectEl.value;
    if (choice === "random") {
      return bandMatcherPickRandomBands(BAND_MATCHER_BANDS, pairCount, rng);
    }
    const anchor = bandById(choice);
    if (!anchor) {
      return bandMatcherPickRandomBands(BAND_MATCHER_BANDS, pairCount, rng);
    }
    const rest = BAND_MATCHER_BANDS.filter((b) => b.id !== anchor.id);
    const others = bandMatcherPickRandomBands(rest, pairCount - 1, rng);
    return bandMatcherShuffle([anchor, ...others], rng);
  }

  function renderBoard() {
    const cols = bandMatcherGridColumns(activeBands.length);
    boardEl.style.setProperty("--ltl-cols", String(cols));
    boardEl.innerHTML = deck
      .map((card) => {
        const band = bandById(card.bandId)!;
        const isMatched = matched.has(card.bandId);
        const isFlipped = flipped.includes(card.key) || isMatched;
        return `
          <button
            type="button"
            class="ltl-band-card${isFlipped ? " is-flipped" : ""}${isMatched ? " is-matched" : ""}"
            data-key="${card.key}"
            data-band="${card.bandId}"
            aria-label="${isFlipped ? band.name : "Hidden tile"}"
            ${isMatched || lockBoard ? "disabled" : ""}
          >
            <span class="ltl-band-card-back" aria-hidden="true">LTL</span>
            <span class="ltl-band-card-front">
              <img src="${band.src}" alt="" width="96" height="96" loading="lazy" />
            </span>
          </button>
        `;
      })
      .join("");
  }

  function updateStats() {
    movesEl.textContent = String(moves);
    pairsEl.textContent = String(matched.size);
    totalEl.textContent = String(activeBands.length);
  }

  function checkWin() {
    if (matched.size < activeBands.length) return;
    winBodyEl.textContent = `Matched all ${activeBands.length} pairs in ${moves} flips.`;
    winEl.hidden = false;
    boardEl.hidden = true;
  }

  function resetGame() {
    rng = bandMatcherCreateRng();
    activeBands = pickBands();
    deck = bandMatcherShuffle(bandMatcherBuildDeck(activeBands), rng);
    flipped = [];
    matched = new Set();
    moves = 0;
    lockBoard = false;
    winEl.hidden = true;
    boardEl.hidden = false;
    renderBoard();
    updateStats();
  }

  function onCardClick(e: Event) {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(".ltl-band-card");
    if (!btn || lockBoard || btn.disabled) return;
    const key = btn.dataset.key!;
    const bandId = btn.dataset.band!;
    if (flipped.includes(key) || matched.has(bandId)) return;

    flipped.push(key);
    btn.classList.add("is-flipped");

    if (flipped.length < 2) return;

    moves += 1;
    updateStats();
    lockBoard = true;

    const [a, b] = flipped;
    const bandA = deck.find((c) => c.key === a)!.bandId;
    const bandB = deck.find((c) => c.key === b)!.bandId;

    if (bandA === bandB) {
      matched.add(bandA);
      flipped = [];
      lockBoard = false;
      renderBoard();
      checkWin();
      return;
    }

    window.setTimeout(() => {
      flipped = [];
      lockBoard = false;
      renderBoard();
    }, 700);
  }

  boardEl.addEventListener("click", onCardClick);
  shuffleBtn.addEventListener("click", resetGame);
  playAgainBtn.addEventListener("click", resetGame);
  bandSelectEl.addEventListener("change", resetGame);
  diffBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      setDifficulty(btn.dataset.diff as BandMatcherDifficulty);
      resetGame();
    });
  });

  setDifficulty("easy");
  resetGame();

  return () => {
    boardEl.removeEventListener("click", onCardClick);
  };
}
