const SOUND_SRC = "/sounds/set-alert.wav";

let audio: HTMLAudioElement | null = null;
let unlocked = false;

export function isAlertSoundUnlocked(): boolean {
  return unlocked;
}

/** Call on user gesture (star tap, enable sound) to satisfy autoplay policy. */
export async function unlockAlertSound(): Promise<void> {
  if (typeof window === "undefined" || unlocked) return;
  try {
    if (!audio) {
      audio = new Audio(SOUND_SRC);
      audio.volume = 0.85;
    }
    audio.currentTime = 0;
    await audio.play();
    audio.pause();
    audio.currentTime = 0;
    unlocked = true;
  } catch {
    playWebAudioBeep();
    unlocked = true;
  }
}

export function playSetAlertSound(): void {
  if (typeof window === "undefined") return;
  if (!unlocked) return;

  if (audio) {
    audio.currentTime = 0;
    void audio.play().catch(() => playWebAudioBeep());
    return;
  }
  playWebAudioBeep();
}

function playWebAudioBeep(): void {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
    void ctx.close();
  } catch {
    /* silent fallback */
  }
}
