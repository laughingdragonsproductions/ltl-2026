export const REWARD_VIDEO_MIN_SECONDS = 15;

export type RewardVideoSource =
  | { type: "youtube"; id: string }
  | { type: "mp4"; url: string }
  | { type: "iframe"; url: string; minSeconds: number }
  | { type: "promo"; minSeconds: number };

/** Pull `src` from a pasted iframe embed snippet, or return input as-is. */
export function extractEmbedUrl(raw: string): string {
  const trimmed = raw.trim();
  const iframeMatch = trimmed.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframeMatch) return iframeMatch[1];
  return trimmed;
}

export function parseYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1).split("/")[0] || null;
    }
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtube-nocookie.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const embed = u.pathname.match(/\/embed\/([^/?]+)/);
      if (embed) return embed[1];
    }
  } catch {
    if (/^[\w-]{11}$/.test(url)) return url;
  }
  return null;
}

function rewardVideoSeconds(): number {
  const raw = process.env.NEXT_PUBLIC_REWARD_VIDEO_SECONDS?.trim();
  const n = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : REWARD_VIDEO_MIN_SECONDS;
}

export function getRewardVideoSource(): RewardVideoSource {
  const raw = process.env.NEXT_PUBLIC_REWARD_VIDEO_URL?.trim();
  if (!raw) {
    return { type: "promo", minSeconds: REWARD_VIDEO_MIN_SECONDS };
  }

  const url = extractEmbedUrl(raw);
  const yt = parseYouTubeId(url);
  if (yt) return { type: "youtube", id: yt };

  if (/\.(mp4|webm)(\?|$)/i.test(url)) {
    return { type: "mp4", url };
  }

  if (/^https?:\/\//i.test(url)) {
    return { type: "iframe", url, minSeconds: rewardVideoSeconds() };
  }

  return { type: "promo", minSeconds: REWARD_VIDEO_MIN_SECONDS };
}
