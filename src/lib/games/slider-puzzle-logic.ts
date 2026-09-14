export type SliderImage = { id: string; label: string; src: string };

export const SLIDER_IMAGES: SliderImage[] = [
  {
    id: "poster",
    label: "Festival poster",
    src: "/games/ltl26/puzzle-poster.jpg",
  },
  {
    id: "booth",
    label: "Expo booth",
    src: "/games/ltl26/puzzle-booth.jpg",
  },
  {
    id: "map",
    label: "Official amenity map",
    src: "/maps/ltl-2026-official-amenity-map.png",
  },
];

export const SLIDER_DIFFICULTIES = {
  easy: { label: "Easy", size: 3 },
  med: { label: "Med", size: 4 },
  hard: { label: "Hard", size: 5 },
} as const;

export const SLIDER_WIN_MESSAGES: Record<
  string,
  { title: string; body: string }[]
> = {
  poster: [
    { title: "Poster restored!", body: "See you in the pit — LTL 2026." },
    { title: "Festival ready.", body: "Every tile back where it belongs." },
  ],
  booth: [
    { title: "Booth complete!", body: "Highland grounds, assembled." },
    { title: "Expo win.", body: "Map the grounds before gates open." },
  ],
  map: [
    { title: "Map restored!", body: "You won't get lost between stages." },
    { title: "Grounds locked in.", body: "Official amenity map — solved." },
  ],
};

export function sliderEmptyTile(size: number) {
  return size * size - 1;
}

export function sliderSolvedState(size: number) {
  return Array.from({ length: size * size }, (_, i) => i);
}

export function sliderIndexToRowCol(index: number, size: number) {
  return { row: Math.floor(index / size), col: index % size };
}

export function sliderCanSlideToward(
  clickIdx: number,
  emptyIdx: number,
  size: number
) {
  if (clickIdx === emptyIdx) return false;
  const click = sliderIndexToRowCol(clickIdx, size);
  const empty = sliderIndexToRowCol(emptyIdx, size);
  return click.row === empty.row || click.col === empty.col;
}

export function sliderSlideToward(
  state: number[],
  clickIdx: number,
  size: number
): { state: number[]; tilesMoved: number } | null {
  const empty = sliderEmptyTile(size);
  const emptyIdx = state.indexOf(empty);
  if (!sliderCanSlideToward(clickIdx, emptyIdx, size)) return null;

  const sameRow = Math.floor(clickIdx / size) === Math.floor(emptyIdx / size);
  const step = sameRow
    ? clickIdx < emptyIdx
      ? 1
      : -1
    : clickIdx < emptyIdx
      ? size
      : -size;

  let tilesMoved = 0;
  let i = clickIdx;
  while (i !== emptyIdx) {
    tilesMoved += 1;
    i += step;
  }

  const next = state.slice();
  if (sameRow) {
    if (clickIdx < emptyIdx) {
      for (let j = emptyIdx; j > clickIdx; j -= 1) next[j] = next[j - 1];
      next[clickIdx] = empty;
    } else {
      for (let j = emptyIdx; j < clickIdx; j += 1) next[j] = next[j + 1];
      next[clickIdx] = empty;
    }
  } else if (clickIdx < emptyIdx) {
    for (let j = emptyIdx; j > clickIdx; j -= size) next[j] = next[j - size];
    next[clickIdx] = empty;
  } else {
    for (let j = emptyIdx; j < clickIdx; j += size) next[j] = next[j + size];
    next[clickIdx] = empty;
  }

  return { state: next, tilesMoved };
}

export function sliderIsWin(state: number[], size: number) {
  return state.every((v, i) => v === i);
}

export function sliderTileBackgroundStyle(
  tileIndex: number,
  size: number,
  imageSrc: string
) {
  const { row, col } = sliderIndexToRowCol(tileIndex, size);
  const pct = 100 / size;
  return {
    backgroundImage: `url(${imageSrc})`,
    backgroundSize: `${size * 100}% ${size * 100}%`,
    backgroundPosition: `${col * pct}% ${row * pct}%`,
  };
}

export function sliderCreateRng(seed?: string | null) {
  if (seed == null || seed === "") return Math.random;
  let s = Number(seed) >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function sliderShuffleBoard(size: number, rng: () => number = Math.random) {
  const state = sliderSolvedState(size);
  const empty = sliderEmptyTile(size);
  let emptyIdx = state.indexOf(empty);
  const scrambleMoves = size * size * 40;

  for (let i = 0; i < scrambleMoves; i += 1) {
    const neighbors: number[] = [];
    const { row, col } = sliderIndexToRowCol(emptyIdx, size);
    if (row > 0) neighbors.push(emptyIdx - size);
    if (row < size - 1) neighbors.push(emptyIdx + size);
    if (col > 0) neighbors.push(emptyIdx - 1);
    if (col < size - 1) neighbors.push(emptyIdx + 1);
    const pick = neighbors[Math.floor(rng() * neighbors.length)];
    const result = sliderSlideToward(state, pick, size);
    if (result) {
      state.splice(0, state.length, ...result.state);
      emptyIdx = state.indexOf(empty);
    }
  }
  return state;
}

export function sliderResolveImage(
  images: SliderImage[],
  id: string | null
): SliderImage {
  return images.find((img) => img.id === id) ?? images[0];
}

export function sliderParseOptions(search: string) {
  const params = new URLSearchParams(search);
  const diff = params.get("diff");
  const difficulties = SLIDER_DIFFICULTIES as Record<
    string,
    { label: string; size: number }
  >;
  const image = params.get("image");
  const seed = params.get("seed");
  return {
    difficulty: diff && difficulties[diff] ? diff : null,
    image: sliderResolveImage(SLIDER_IMAGES, image),
    seed: seed != null && seed !== "" ? seed : null,
  };
}

export function sliderPickWinMessage(
  imageId: string,
  rng: () => number = Math.random
) {
  const list = SLIDER_WIN_MESSAGES[imageId] ?? SLIDER_WIN_MESSAGES.poster;
  return list[Math.floor(rng() * list.length)];
}

export function sliderPickRandomImage(
  rng: () => number = Math.random,
  excludeId?: string | null
) {
  const pool = excludeId
    ? SLIDER_IMAGES.filter((img) => img.id !== excludeId)
    : SLIDER_IMAGES;
  const list = pool.length ? pool : SLIDER_IMAGES;
  return list[Math.floor(rng() * list.length)];
}
