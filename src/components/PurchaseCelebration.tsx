"use client";

import { useEffect, useRef, useState } from "react";

const CONFETTI_SRC = "/videos/unlock-confetti.mp4";

export function PurchaseCelebration({ active }: { active: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [show, setShow] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!active) return;
    setShow(true);
    setFading(false);
  }, [active]);

  // Play after the <video> is mounted (ref is null on the same tick active flips true).
  useEffect(() => {
    if (!show || fading) return;

    const video = videoRef.current;
    if (!video) return;

    const play = () => {
      video.currentTime = 0;
      void video.play().catch(() => {
        window.setTimeout(() => setFading(true), 3200);
      });
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) play();
    else video.addEventListener("loadeddata", play, { once: true });

    const onEnded = () => setFading(true);
    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("loadeddata", play);
      video.removeEventListener("ended", onEnded);
    };
  }, [show, fading]);

  useEffect(() => {
    if (!fading) return;
    const timer = window.setTimeout(() => setShow(false), 800);
    return () => clearTimeout(timer);
  }, [fading]);

  if (!show) return null;

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-[9999] overflow-hidden transition-opacity duration-700 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-cover [filter:brightness(1.15)_contrast(1.05)]"
        src={CONFETTI_SRC}
        muted
        playsInline
        autoPlay
        preload="auto"
      />
    </div>
  );
}
