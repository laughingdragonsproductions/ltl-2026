"use client";

import { useCallback, useRef } from "react";
import type { WalkthroughTouchInput } from "@/lib/walkthrough-input";

const JOY_RADIUS = 52;
const KNOB_MAX = 44;
const LOOK_SENS = 0.004;

type Props = {
  inputRef: React.MutableRefObject<WalkthroughTouchInput>;
  disabled?: boolean;
  onInteract?: () => void;
};

export function WalkthroughMobileControls({ inputRef, disabled, onInteract }: Props) {
  const joyOrigin = useRef<{ x: number; y: number } | null>(null);
  const joyPointerId = useRef<number | null>(null);
  const lookPointerId = useRef<number | null>(null);
  const lookLast = useRef<{ x: number; y: number } | null>(null);
  const knobRef = useRef<HTMLDivElement>(null);

  const resetJoystick = useCallback(() => {
    joyOrigin.current = null;
    joyPointerId.current = null;
    inputRef.current.forward = 0;
    inputRef.current.strafe = 0;
    if (knobRef.current) {
      knobRef.current.style.transform = "translate(-50%, -50%)";
    }
  }, [inputRef]);

  const onJoyPointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    onInteract?.();
    e.currentTarget.setPointerCapture(e.pointerId);
    joyPointerId.current = e.pointerId;
    const rect = e.currentTarget.getBoundingClientRect();
    joyOrigin.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    updateJoy(e.clientX, e.clientY);
  };

  const updateJoy = (clientX: number, clientY: number) => {
    const origin = joyOrigin.current;
    if (!origin) return;
    let dx = clientX - origin.x;
    let dy = clientY - origin.y;
    const dist = Math.hypot(dx, dy);
    if (dist > JOY_RADIUS) {
      dx = (dx / dist) * JOY_RADIUS;
      dy = (dy / dist) * JOY_RADIUS;
    }
    inputRef.current.strafe = dx / JOY_RADIUS;
    inputRef.current.forward = -dy / JOY_RADIUS;
    if (knobRef.current) {
      knobRef.current.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    }
  };

  const onJoyPointerMove = (e: React.PointerEvent) => {
    if (joyPointerId.current !== e.pointerId) return;
    updateJoy(e.clientX, e.clientY);
  };

  const onJoyPointerUp = (e: React.PointerEvent) => {
    if (joyPointerId.current !== e.pointerId) return;
    resetJoystick();
  };

  const onLookPointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    onInteract?.();
    e.currentTarget.setPointerCapture(e.pointerId);
    lookPointerId.current = e.pointerId;
    lookLast.current = { x: e.clientX, y: e.clientY };
  };

  const onLookPointerMove = (e: React.PointerEvent) => {
    if (lookPointerId.current !== e.pointerId || !lookLast.current) return;
    const dx = e.clientX - lookLast.current.x;
    const dy = e.clientY - lookLast.current.y;
    lookLast.current = { x: e.clientX, y: e.clientY };
    inputRef.current.lookYaw -= dx * LOOK_SENS;
    inputRef.current.lookPitch -= dy * LOOK_SENS;
  };

  const onLookPointerUp = (e: React.PointerEvent) => {
    if (lookPointerId.current !== e.pointerId) return;
    lookPointerId.current = null;
    lookLast.current = null;
  };

  return (
    <>
      {/* Drag right side to look — below top HUD buttons */}
      <div
        className="absolute bottom-0 right-0 top-16 z-20 w-[58%] touch-none"
        style={{ touchAction: "none" }}
        onPointerDown={onLookPointerDown}
        onPointerMove={onLookPointerMove}
        onPointerUp={onLookPointerUp}
        onPointerCancel={onLookPointerUp}
        aria-hidden
      />

      {/* Virtual joystick */}
      <div
        className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] z-30 touch-none"
        style={{ touchAction: "none" }}
      >
        <div
          className="relative h-[128px] w-[128px] rounded-full border-2 border-[var(--ld-neon-green)]/50 bg-black/60 backdrop-blur-sm"
          onPointerDown={onJoyPointerDown}
          onPointerMove={onJoyPointerMove}
          onPointerUp={onJoyPointerUp}
          onPointerCancel={onJoyPointerUp}
          role="img"
          aria-label="Move joystick"
        >
          <div
            ref={knobRef}
            className="absolute left-1/2 top-1/2 h-14 w-14 rounded-full bg-[var(--ld-neon-green)]/90 shadow-lg"
            style={{
              transform: "translate(-50%, -50%)",
              maxWidth: KNOB_MAX * 2,
              maxHeight: KNOB_MAX * 2,
            }}
          />
        </div>
        <p className="mt-1 text-center text-[9px] font-bold uppercase tracking-wider text-[var(--ld-muted)]">
          Move
        </p>
      </div>

      <div className="pointer-events-none absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-30 rounded-lg border border-zinc-700/80 bg-black/70 px-3 py-2 text-center backdrop-blur-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--ld-neon-green)]">
          Drag to look
        </p>
        <p className="mt-0.5 text-[9px] text-zinc-400">Right side of screen</p>
      </div>
    </>
  );
}
