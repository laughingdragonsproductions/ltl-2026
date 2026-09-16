import { setUnlockedUntil, UNLOCK_DEADLINE } from "../unlock-state";

const SPRITES = {
  skull: "/games/ltl26/flappy/skull.png",
  glasses: "/games/ltl26/flappy/glasses.png",
  headphones: "/games/ltl26/flappy/headphones.png",
};

const STORAGE = { best: "ltl26-flappy-best" };

/** Alpha testers: auto-pilot to this score unlocks full site (same as $5 unlock). */
export const FLAPPY_ALPHA_UNLOCK_SCORE = 75;

const WORLD = { width: 400, height: 600, groundH: 48, ceilingPad: 8 };
const BASE = {
  gravity: 0.42,
  flap: -7.8,
  pipeGap: 178,
  pipeWidth: 56,
  pipeSpacing: 210,
  scrollSpeed: 2.4,
  skullSize: 48,
  skullX: 88,
};

const DEV_CHEAT = {
  tapWindowMs: 1000,
  holdMs: 450,
  unlockTestScore: FLAPPY_ALPHA_UNLOCK_SCORE,
};

type Screen = "menu" | "howto" | "ready" | "playing" | "over";

export type FlappySkullOptions = {
  onPremiumUnlock?: () => void;
};

export async function initFlappySkull(
  root: HTMLElement,
  options: FlappySkullOptions = {}
): Promise<() => void> {
  root.innerHTML = `
    <div class="ltl-flappy">
      <div class="ltl-flappy-stage">
        <div class="ltl-flappy-playfield">
          <canvas id="ltl-flappy-canvas" width="400" height="600"></canvas>
          <div class="ltl-flappy-hud" id="ltl-flappy-hud" hidden><p id="ltl-flappy-score">0</p></div>
          <div class="ltl-flappy-overlay" id="ltl-flappy-menu">
            <p class="ltl-game-eyebrow">LOUDERTHANLIFE2026</p>
            <h2 class="ltl-game-title">Flappy Skull</h2>
            <p>Tap to fly. Dodge the stage trusses. Glasses @ 5 · Headphones @ 10.</p>
            <p>Best: <strong id="ltl-flappy-best">0</strong></p>
            <fieldset>
              <legend>Difficulty</legend>
              <label><input type="radio" name="ltl-flap-diff" value="easy" /> Easy</label>
              <label><input type="radio" name="ltl-flap-diff" value="hard" checked /> Hard</label>
            </fieldset>
            <button type="button" class="ltl-btn ltl-btn-primary" id="ltl-flap-play">Play</button>
            <button type="button" class="ltl-btn" id="ltl-flap-howto">How to Play</button>
          </div>
          <div class="ltl-flappy-overlay" id="ltl-flappy-howto" hidden>
            <h3>How to Play</h3>
            <ol>
              <li>Tap, click, or Space to flap.</li>
              <li>Fly through gaps — each gap scores 1.</li>
              <li>Score 5 → sunglasses. Score 10 → headphones.</li>
              <li>Alpha test: triple-tap + hold before the first pipe → auto-pilot runs to score ${FLAPPY_ALPHA_UNLOCK_SCORE} and unlocks the full site.</li>
            </ol>
            <button type="button" class="ltl-btn ltl-btn-primary" id="ltl-flap-howto-back">Back</button>
          </div>
          <div class="ltl-flappy-overlay ltl-flappy-overlay--compact" id="ltl-flappy-ready" hidden><p>Tap to start</p></div>
          <div class="ltl-flappy-overlay" id="ltl-flappy-over" hidden>
            <h3>Game Over</h3>
            <p>Score: <strong id="ltl-flappy-over-score">0</strong></p>
            <p id="ltl-flappy-over-best" hidden>New best!</p>
            <p id="ltl-flappy-unlock-toast" hidden></p>
            <button type="button" class="ltl-btn ltl-btn-primary" id="ltl-flap-retry">Try Again</button>
            <button type="button" class="ltl-btn" id="ltl-flap-menu">Menu</button>
          </div>
        </div>
      </div>
    </div>`;

  const canvas = root.querySelector<HTMLCanvasElement>("#ltl-flappy-canvas")!;
  const ctx = canvas.getContext("2d")!;
  const els = {
    hud: root.querySelector<HTMLElement>("#ltl-flappy-hud")!,
    score: root.querySelector<HTMLElement>("#ltl-flappy-score")!,
    menu: root.querySelector<HTMLElement>("#ltl-flappy-menu")!,
    howto: root.querySelector<HTMLElement>("#ltl-flappy-howto")!,
    ready: root.querySelector<HTMLElement>("#ltl-flappy-ready")!,
    over: root.querySelector<HTMLElement>("#ltl-flappy-over")!,
    best: root.querySelector<HTMLElement>("#ltl-flappy-best")!,
    overScore: root.querySelector<HTMLElement>("#ltl-flappy-over-score")!,
    overBest: root.querySelector<HTMLElement>("#ltl-flappy-over-best")!,
    unlockToast: root.querySelector<HTMLElement>("#ltl-flappy-unlock-toast")!,
    playfield: root.querySelector<HTMLElement>(".ltl-flappy-playfield")!,
  };

  let screen: Screen = "menu";
  let rafId = 0;
  let lastTs = 0;
  const sprites: {
    skull: HTMLImageElement | null;
    glasses: HTMLImageElement | null;
    headphones: HTMLImageElement | null;
  } = { skull: null, glasses: null, headphones: null };
  let mode: "easy" | "hard" = "hard";

  const cheat = {
    taps: [] as number[],
    armedHold: false,
    holdSince: 0,
    autoPilot: false,
    pointerDown: false,
    keyDown: false,
  };

  const state = {
    score: 0,
    best: Number(localStorage.getItem(STORAGE.best) || 0),
    y: WORLD.height * 0.42,
    vy: 0,
    rot: 0,
    pipes: [] as { x: number; topH: number; gap: number; scored: boolean }[],
    bgOffset: 0,
    pipeTimer: BASE.pipeSpacing * 0.55,
    runUnlocks: [] as string[],
  };

  const loadSprites = () =>
    Promise.all(
      (Object.entries(SPRITES) as [keyof typeof sprites, string][]).map(
        ([key, src]) =>
          new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              sprites[key] = img;
              resolve();
            };
            img.onerror = reject;
            img.src = src;
          })
      )
    );

  const physicsScale = () => (mode === "easy" ? 0.85 : 1);
  const gravity = () => BASE.gravity * physicsScale();
  const flap = () => BASE.flap * physicsScale();

  function getDifficulty() {
    const s = state.score;
    return {
      scrollSpeed: BASE.scrollSpeed + Math.min(s * 0.06, 3.6),
      pipeGap: Math.max(BASE.pipeGap - Math.floor(s / 5) * 3, 128),
      pipeSpacing: Math.max(BASE.pipeSpacing - Math.floor(s / 6) * 6, 168),
    };
  }

  function setScreen(next: Screen) {
    screen = next;
    els.menu.hidden = next !== "menu";
    els.howto.hidden = next !== "howto";
    els.ready.hidden = next !== "ready";
    els.over.hidden = next !== "over";
    els.hud.hidden = next !== "playing" && next !== "ready";
  }

  function resetCheat() {
    cheat.taps = [];
    cheat.armedHold = false;
    cheat.autoPilot = false;
    cheat.pointerDown = false;
    cheat.keyDown = false;
  }

  function noteCheatTap() {
    if (screen !== "playing" || state.score !== 0 || cheat.autoPilot) {
      cheat.taps = [];
      return;
    }
    const now = performance.now();
    cheat.taps = cheat.taps.filter((t) => now - t <= DEV_CHEAT.tapWindowMs);
    cheat.taps.push(now);
    if (cheat.taps.length >= 3) {
      cheat.armedHold = true;
      cheat.holdSince = now;
      cheat.taps = [];
    }
  }

  function updateCheatHold() {
    if (!cheat.armedHold || cheat.autoPilot || !(cheat.pointerDown || cheat.keyDown)) return;
    if (performance.now() - cheat.holdSince >= DEV_CHEAT.holdMs) cheat.autoPilot = true;
  }

  function getAutoPilotY() {
    const cx = BASE.skullX + BASE.skullSize / 2;
    for (const pipe of state.pipes) {
      if (pipe.x <= cx && pipe.x + BASE.pipeWidth >= cx) {
        return pipe.topH + pipe.gap / 2 - BASE.skullSize / 2;
      }
    }
    return WORLD.height * 0.42;
  }

  function drawImageFit(
    img: HTMLImageElement,
    maxW: number,
    maxH: number,
    offsetX = 0,
    offsetY = 0
  ) {
    const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.drawImage(img, offsetX - w / 2, offsetY - h / 2, w, h);
  }

  function drawSkull() {
    const size = BASE.skullSize;
    const cx = BASE.skullX + size / 2;
    const cy = state.y + size / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(state.rot);
    if (sprites.skull) {
      // Preserve PNG aspect — full skull visible (no square stretch / top crop).
      drawImageFit(sprites.skull, size * 1.08, size * 1.12, 0, size * 0.04);
      if (state.score >= 5 && sprites.glasses) {
        drawImageFit(sprites.glasses, size * 0.82, size * 0.34, 0, -size * 0.06);
      }
      if (state.score >= 10 && sprites.headphones) {
        drawImageFit(sprites.headphones, size * 1.02, size * 0.58, 0, -size * 0.1);
      }
    } else {
      ctx.fillStyle = "#e8e8f0";
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawFrame() {
    ctx.clearRect(0, 0, WORLD.width, WORLD.height);
    const grad = ctx.createLinearGradient(0, 0, 0, WORLD.height);
    grad.addColorStop(0, "#1a0a2e");
    grad.addColorStop(1, "#0a0a0f");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);

    for (const pipe of state.pipes) {
      const bottomY = pipe.topH + pipe.gap;
      ctx.fillStyle = "#4a5868";
      ctx.fillRect(pipe.x, 0, BASE.pipeWidth, pipe.topH);
      ctx.fillRect(pipe.x, bottomY, BASE.pipeWidth, WORLD.height - WORLD.groundH - bottomY);
      ctx.fillStyle = "#39ff14";
      ctx.fillRect(pipe.x - 2, pipe.topH - 10, BASE.pipeWidth + 4, 10);
      ctx.fillRect(pipe.x - 2, bottomY, BASE.pipeWidth + 4, 10);
    }

    const gy = WORLD.height - WORLD.groundH;
    ctx.fillStyle = "#3d2e24";
    ctx.fillRect(0, gy, WORLD.width, WORLD.groundH);
    ctx.fillStyle = "#39ff14";
    ctx.fillRect(0, gy, WORLD.width, 6);
    drawSkull();
  }

  function checkCollision() {
    if (cheat.autoPilot) return false;
    const pad = 6;
    const box = {
      x: BASE.skullX + pad,
      y: state.y + pad,
      w: BASE.skullSize - pad * 2,
      h: BASE.skullSize - pad * 2,
    };
    if (box.y <= WORLD.ceilingPad || box.y + box.h >= WORLD.height - WORLD.groundH) return true;
    for (const pipe of state.pipes) {
      const top = { x: pipe.x, y: 0, w: BASE.pipeWidth, h: pipe.topH };
      const bottomY = pipe.topH + pipe.gap;
      const bottom = {
        x: pipe.x,
        y: bottomY,
        w: BASE.pipeWidth,
        h: WORLD.height - WORLD.groundH - bottomY,
      };
      const hit = (a: typeof box, b: typeof top) =>
        a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
      if (hit(box, top) || hit(box, bottom)) return true;
    }
    return false;
  }

  function endRun() {
    cancelAnimationFrame(rafId);
    const prev = state.best;
    const unlocks: string[] = [];
    if (state.score >= 5) unlocks.push("Sunglasses");
    if (state.score >= 10) unlocks.push("Headphones");
    const alphaUnlock =
      cheat.autoPilot && state.score >= DEV_CHEAT.unlockTestScore;
    if (alphaUnlock) {
      setUnlockedUntil(UNLOCK_DEADLINE);
      options.onPremiumUnlock?.();
      unlocks.push("Full site access (alpha test)");
    }
    if (state.score > state.best) {
      state.best = state.score;
      localStorage.setItem(STORAGE.best, String(state.best));
    }
    els.overScore.textContent = String(state.score);
    els.overBest.hidden = state.score <= prev || state.score === 0;
    if (unlocks.length) {
      els.unlockToast.textContent = `Unlocked: ${unlocks.join(" + ")}`;
      els.unlockToast.hidden = false;
    } else els.unlockToast.hidden = true;
    els.best.textContent = String(state.best);
    setScreen("over");
  }

  function tick(ts: number) {
    if (screen !== "playing" && screen !== "ready") return;
    const dt = Math.min((ts - lastTs) / 16.67, 2.5);
    lastTs = ts;
    const diff = getDifficulty();

    if (screen === "ready") {
      drawFrame();
      rafId = requestAnimationFrame(tick);
      return;
    }

    updateCheatHold();
    if (cheat.autoPilot) {
      state.y += (getAutoPilotY() - state.y) * 0.42;
      state.vy = 0;
      state.rot = 0;
    } else {
      state.vy += gravity() * dt;
      state.y += state.vy * dt;
      state.rot = Math.max(-0.45, Math.min(state.vy * 0.06, 0.85));
    }

    state.pipeTimer += diff.scrollSpeed * dt;
    if (state.pipeTimer >= diff.pipeSpacing) {
      const minTop = WORLD.ceilingPad + 40;
      const maxTop = WORLD.height - WORLD.groundH - diff.pipeGap - 40;
      const topH = minTop + Math.random() * Math.max(maxTop - minTop, 1);
      state.pipes.push({ x: WORLD.width + 20, topH, gap: diff.pipeGap, scored: false });
      state.pipeTimer = 0;
    }

    for (const pipe of state.pipes) {
      pipe.x -= diff.scrollSpeed * dt;
      if (!pipe.scored && pipe.x + BASE.pipeWidth < BASE.skullX) {
        pipe.scored = true;
        state.score += 1;
        els.score.textContent = String(state.score);
      }
    }
    state.pipes = state.pipes.filter((p) => p.x + BASE.pipeWidth > -20);

    if (cheat.autoPilot && state.score >= DEV_CHEAT.unlockTestScore) {
      endRun();
      return;
    }
    if (checkCollision()) {
      endRun();
      return;
    }
    drawFrame();
    rafId = requestAnimationFrame(tick);
  }

  function beginRun() {
    resetCheat();
    state.score = 0;
    state.y = WORLD.height * 0.42;
    state.vy = 0;
    state.pipes = [];
    state.pipeTimer = BASE.pipeSpacing * 0.55;
    els.score.textContent = "0";
    els.overBest.hidden = true;
    els.unlockToast.hidden = true;
    setScreen("ready");
    lastTs = performance.now();
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(tick);
  }

  function doFlap(e?: Event) {
    if (e && (e as KeyboardEvent).repeat) return;
    if (screen === "ready") {
      setScreen("playing");
      state.vy = flap();
      noteCheatTap();
      return;
    }
    if (screen !== "playing") return;
    noteCheatTap();
    state.vy = flap();
  }

  function resizeCanvas() {
    const rect = els.playfield.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = WORLD.width * dpr;
    canvas.height = WORLD.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (screen === "menu" || screen === "howto" || screen === "over") drawFrame();
  }

  const onPointerDown = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    cheat.pointerDown = true;
    doFlap(e);
  };
  const onPointerUp = () => {
    cheat.pointerDown = false;
    if (!cheat.autoPilot) cheat.armedHold = false;
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (![" ", "ArrowUp"].includes(e.key)) return;
    e.preventDefault();
    cheat.keyDown = true;
    doFlap(e);
  };
  const onKeyUp = (e: KeyboardEvent) => {
    if (![" ", "ArrowUp"].includes(e.key)) return;
    cheat.keyDown = false;
    if (!cheat.autoPilot) cheat.armedHold = false;
  };

  root.querySelector("#ltl-flap-play")?.addEventListener("click", (e) => {
    e.stopPropagation();
    beginRun();
  });
  root.querySelector("#ltl-flap-howto")?.addEventListener("click", (e) => {
    e.stopPropagation();
    setScreen("howto");
  });
  root.querySelector("#ltl-flap-howto-back")?.addEventListener("click", (e) => {
    e.stopPropagation();
    setScreen("menu");
  });
  root.querySelector("#ltl-flap-retry")?.addEventListener("click", (e) => {
    e.stopPropagation();
    beginRun();
  });
  root.querySelector("#ltl-flap-menu")?.addEventListener("click", (e) => {
    e.stopPropagation();
    cancelAnimationFrame(rafId);
    setScreen("menu");
    drawFrame();
  });

  root.querySelectorAll<HTMLInputElement>('input[name="ltl-flap-diff"]').forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) mode = input.value as "easy" | "hard";
    });
  });

  els.playfield.addEventListener("pointerdown", onPointerDown);
  els.playfield.addEventListener("pointerup", onPointerUp);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("resize", resizeCanvas);

  try {
    await loadSprites();
  } catch {
    /* fallback circle skull */
  }

  els.best.textContent = String(state.best);
  setScreen("menu");
  resizeCanvas();
  drawFrame();

  return () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("resize", resizeCanvas);
  };
}
