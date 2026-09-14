"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PROMO_ADS } from "@/lib/promo-ads";
import {
  getRewardVideoSource,
  REWARD_VIDEO_MIN_SECONDS,
} from "@/lib/reward-video";
import { useSession } from "@/lib/session-context";

type YtPlayer = {
  destroy: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement | string,
        config: {
          videoId: string;
          playerVars?: Record<string, string | number>;
          events?: { onStateChange?: (e: { data: number }) => void };
        }
      ) => YtPlayer;
      PlayerState: { ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  return new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
  });
}

function useCountdownTimer(
  active: boolean,
  seconds: number,
  onComplete: () => void
) {
  const [secondsLeft, setSecondsLeft] = useState(seconds);

  useEffect(() => {
    if (!active) return;
    setSecondsLeft(seconds);
    const tick = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(tick);
          onComplete();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [active, seconds, onComplete]);

  return secondsLeft;
}

export function RewardVideoModal() {
  const { showVideoModal, closeVideoModal, completeVideoReward, unlocked } =
    useSession();
  const source = useMemo(() => getRewardVideoSource(), []);
  const ytHostRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<YtPlayer | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [promoIndex, setPromoIndex] = useState(0);
  const [needsPlayTap, setNeedsPlayTap] = useState(false);

  const finish = useCallback(() => {
    completeVideoReward();
  }, [completeVideoReward]);

  const iframeSeconds =
    source.type === "iframe" ? source.minSeconds : REWARD_VIDEO_MIN_SECONDS;
  const promoSeconds =
    source.type === "promo" ? source.minSeconds : REWARD_VIDEO_MIN_SECONDS;

  const iframeSecondsLeft = useCountdownTimer(
    showVideoModal && !unlocked && source.type === "iframe",
    iframeSeconds,
    finish
  );
  const promoSecondsLeft = useCountdownTimer(
    showVideoModal && !unlocked && source.type === "promo",
    promoSeconds,
    finish
  );

  useEffect(() => {
    if (!showVideoModal || unlocked) return;

    if (source.type === "youtube" && ytHostRef.current) {
      let cancelled = false;
      loadYouTubeApi().then(() => {
        if (cancelled || !ytHostRef.current || !window.YT) return;
        ytPlayerRef.current?.destroy();
        ytPlayerRef.current = new window.YT.Player(ytHostRef.current, {
          videoId: source.id,
          playerVars: { autoplay: 1, playsinline: 1, rel: 0, modestbranding: 1 },
          events: {
            onStateChange: (e) => {
              if (e.data === window.YT!.PlayerState.ENDED) finish();
            },
          },
        });
      });
      return () => {
        cancelled = true;
        ytPlayerRef.current?.destroy();
        ytPlayerRef.current = null;
      };
    }

    if (source.type === "mp4" && videoRef.current) {
      const el = videoRef.current;
      const onEnded = () => finish();
      el.addEventListener("ended", onEnded);
      void el.play().catch(() => setNeedsPlayTap(true));
      return () => el.removeEventListener("ended", onEnded);
    }

    if (source.type === "promo") {
      const rotate = window.setInterval(() => {
        setPromoIndex((i) => (i + 1) % PROMO_ADS.length);
      }, 5000);
      return () => clearInterval(rotate);
    }
  }, [showVideoModal, unlocked, source, finish]);

  if (!showVideoModal || unlocked) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/85 p-4 sm:items-center">
      <div
        className="ld-glow-purple w-full max-w-lg rounded-2xl border border-[var(--ld-purple)]/60 bg-[var(--ld-black)] p-4 shadow-2xl sm:p-6"
        role="dialog"
        aria-labelledby="reward-video-title"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--ld-purple)]">
          Promo video
        </p>
        <h2 id="reward-video-title" className="mt-2 text-lg font-black text-[var(--ld-neon-green)]">
          Watch to unlock +10 minutes
        </h2>
        <p className="mt-2 text-sm text-[var(--ld-muted)]">
          Finish the video for another free overlay session. Or{" "}
          <strong className="text-white">$5</strong> unlocks everything forever.
        </p>

        <div className="mt-4 overflow-hidden rounded-xl border border-[var(--ld-purple-dim)]/40 bg-black">
          {source.type === "youtube" && (
            <div className="aspect-video w-full">
              <div ref={ytHostRef} className="h-full w-full" />
            </div>
          )}
          {source.type === "mp4" && (
            <video
              ref={videoRef}
              src={source.url}
              className="aspect-video w-full"
              controls
              playsInline
            />
          )}
          {source.type === "iframe" && (
            <div className="relative aspect-video w-full">
              <iframe
                src={source.url}
                title="Promo video"
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
          {source.type === "promo" && (
            <div className="flex aspect-video flex-col justify-between p-4">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--ld-muted)]">
                  Sponsored
                </span>
                <p className="mt-2 text-xl font-black text-[var(--ld-neon-green)]">
                  {PROMO_ADS[promoIndex].title}
                </p>
                <p className="mt-2 text-sm text-[var(--ld-text)]">
                  {PROMO_ADS[promoIndex].tagline}
                </p>
              </div>
              <p className="text-center text-sm font-bold text-[var(--ld-purple)]">
                {promoSecondsLeft}s remaining
              </p>
            </div>
          )}
        </div>

        {source.type === "iframe" && (
          <p className="mt-2 text-center text-sm font-bold text-[var(--ld-purple)]">
            {iframeSecondsLeft}s remaining
          </p>
        )}

        {source.type === "mp4" && needsPlayTap && (
          <p className="mt-2 text-center text-xs text-[var(--ld-muted)]">
            Tap play if the video did not start automatically.
          </p>
        )}

        <button
          type="button"
          onClick={closeVideoModal}
          className="mt-4 w-full py-2 text-sm text-[var(--ld-muted)] hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
