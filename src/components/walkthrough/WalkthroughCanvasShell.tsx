"use client";

/** Shared loading shell while WebGL bundle mounts on the client. */
export function WalkthroughCanvasShell({ detail }: { detail?: string }) {
  return (
    <div className="flex h-[min(72dvh,640px)] min-h-[420px] flex-col items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-400">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--ld-neon-green)] border-t-transparent"
        aria-hidden
      />
      <p className="text-sm">Loading 3D walkthrough…</p>
      {detail && <p className="max-w-xs px-4 text-center text-[10px] text-zinc-500">{detail}</p>}
    </div>
  );
}
