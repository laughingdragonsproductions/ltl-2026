import {
  SLIDER_DIFFICULTIES,
  SLIDER_IMAGES,
  sliderCreateRng,
  sliderEmptyTile,
  sliderIndexToRowCol,
  sliderIsWin,
  sliderParseOptions,
  sliderPickRandomImage,
  sliderPickWinMessage,
  sliderShuffleBoard,
  sliderSlideToward,
  sliderTileBackgroundStyle,
  type SliderImage,
} from "./slider-puzzle-logic";

export function initSliderPuzzle(mount: HTMLElement) {
  const queryOpts = sliderParseOptions(window.location.search);

  mount.innerHTML = `
    <section class="ltl-slider" aria-label="LTL Slider puzzle">
      <div class="ltl-slider-toolbar">
        <div class="ltl-slider-difficulty" role="group" aria-label="Difficulty">
          ${Object.entries(SLIDER_DIFFICULTIES)
            .map(
              ([key, { label }]) =>
                `<button type="button" class="ltl-btn ltl-btn-soft ltl-diff-btn" data-diff="${key}">${label}</button>`
            )
            .join("")}
        </div>
        <button type="button" class="ltl-btn ltl-btn-primary" id="ltl-ss-shuffle">Shuffle</button>
      </div>
      <div class="ltl-slider-meta">
        <p class="ltl-slider-stats"><span id="ltl-ss-moves">0</span> moves</p>
        <p id="ltl-ss-art-label"></p>
        <figure class="ltl-slider-ref">
          <img id="ltl-ss-ref-img" src="" alt="Reference puzzle" width="192" height="108" loading="lazy" />
          <figcaption>Reference</figcaption>
        </figure>
      </div>
      <div class="ltl-slider-board-wrap">
        <div id="ltl-ss-board" class="ltl-slider-board" role="grid"></div>
        <div id="ltl-ss-win" class="ltl-slider-win" hidden>
          <p class="ltl-slider-win-title" id="ltl-ss-win-title"></p>
          <p id="ltl-ss-win-body"></p>
          <button type="button" class="ltl-btn ltl-btn-primary" id="ltl-ss-play-again">Play again</button>
        </div>
      </div>
      <p class="ltl-slider-hint">Tap tiles in the same row or column as the empty square. Arrow keys move one tile.</p>
    </section>
  `;

  const boardEl = mount.querySelector<HTMLElement>("#ltl-ss-board")!;
  const movesEl = mount.querySelector("#ltl-ss-moves")!;
  const winEl = mount.querySelector<HTMLElement>("#ltl-ss-win")!;
  const winTitleEl = mount.querySelector("#ltl-ss-win-title")!;
  const winBodyEl = mount.querySelector("#ltl-ss-win-body")!;
  const artLabelEl = mount.querySelector("#ltl-ss-art-label")!;
  const refImgEl = mount.querySelector<HTMLImageElement>("#ltl-ss-ref-img")!;
  const diffBtns = mount.querySelectorAll<HTMLButtonElement>(".ltl-diff-btn");

  type DiffKey = keyof typeof SLIDER_DIFFICULTIES;
  let size: number = SLIDER_DIFFICULTIES.easy.size;
  let difficulty: DiffKey = (queryOpts.difficulty as DiffKey) || "easy";
  let currentImage: SliderImage = queryOpts.image || SLIDER_IMAGES[0];
  let rng = sliderCreateRng(queryOpts.seed);
  let state: number[] = [];
  let moves = 0;
  let solved = false;

  const emptyTile = () => sliderEmptyTile(size);

  function resetStats() {
    moves = 0;
    solved = false;
    movesEl.textContent = "0";
    winEl.hidden = true;
  }

  function updateImageUI() {
    artLabelEl.textContent = `Art: ${currentImage.label}`;
    refImgEl.src = currentImage.src;
    refImgEl.alt = `Reference: ${currentImage.label}`;
  }

  function pickNextImage(randomize = false) {
    if (queryOpts.image && queryOpts.image.id) {
      currentImage = queryOpts.image;
      return;
    }
    if (randomize) {
      currentImage = sliderPickRandomImage(rng, currentImage?.id);
    }
  }

  function renderBoard() {
    boardEl.style.setProperty("--ltl-size", String(size));
    boardEl.innerHTML = "";
    state.forEach((tile, position) => {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "ltl-tile";
      if (tile === emptyTile()) {
        cell.classList.add("ltl-tile-empty");
        cell.disabled = true;
      } else {
        const style = sliderTileBackgroundStyle(tile, size, currentImage.src);
        cell.style.backgroundImage = style.backgroundImage;
        cell.style.backgroundSize = style.backgroundSize;
        cell.style.backgroundPosition = style.backgroundPosition;
        cell.addEventListener("click", () => applySlide(position));
      }
      boardEl.appendChild(cell);
    });
  }

  function showWin() {
    solved = true;
    const winCopy = sliderPickWinMessage(currentImage.id, rng);
    winTitleEl.textContent = winCopy.title;
    winBodyEl.textContent = winCopy.body;
    winEl.hidden = false;
  }

  function applySlide(position: number) {
    if (solved) return;
    const result = sliderSlideToward(state, position, size);
    if (!result) return;
    state = result.state;
    moves += result.tilesMoved;
    movesEl.textContent = String(moves);
    renderBoard();
    if (sliderIsWin(state, size)) showWin();
  }

  function tryMoveFromKey(direction: string) {
    const emptyIdx = state.indexOf(emptyTile());
    const { row, col } = sliderIndexToRowCol(emptyIdx, size);
    let target = -1;
    if (direction === "up" && row < size - 1) target = emptyIdx + size;
    if (direction === "down" && row > 0) target = emptyIdx - size;
    if (direction === "left" && col < size - 1) target = emptyIdx + 1;
    if (direction === "right" && col > 0) target = emptyIdx - 1;
    if (target >= 0) applySlide(target);
  }

  function newGame(nextDiff?: DiffKey, randomizeImage = false) {
    if (nextDiff) difficulty = nextDiff;
    size = SLIDER_DIFFICULTIES[difficulty].size;
    pickNextImage(randomizeImage);
    updateImageUI();
    resetStats();
    state = sliderShuffleBoard(size, rng);
    diffBtns.forEach((btn) => {
      const active = btn.dataset.diff === difficulty;
      btn.classList.toggle("is-active", active);
    });
    renderBoard();
  }

  diffBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = btn.dataset.diff as DiffKey | undefined;
      if (next && next !== difficulty) newGame(next);
    });
  });

  mount.querySelector("#ltl-ss-shuffle")?.addEventListener("click", () =>
    newGame(undefined, !queryOpts.image)
  );
  mount.querySelector("#ltl-ss-play-again")?.addEventListener("click", () =>
    newGame(undefined, !queryOpts.image)
  );

  const onKey = (event: KeyboardEvent) => {
    const keyMap: Record<string, string> = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
    };
    const dir = keyMap[event.key];
    if (!dir) return;
    event.preventDefault();
    tryMoveFromKey(dir);
  };
  window.addEventListener("keydown", onKey);

  newGame(difficulty, !queryOpts.image);

  return () => window.removeEventListener("keydown", onKey);
}
