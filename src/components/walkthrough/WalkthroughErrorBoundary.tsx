"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import Link from "next/link";

type Props = { children: ReactNode };

type State = { error: Error | null };

export class WalkthroughErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[walkthrough]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-[min(72dvh,640px)] min-h-[420px] flex-col items-center justify-center gap-3 rounded-xl border border-red-900/50 bg-zinc-900 p-6 text-center">
          <p className="text-sm font-bold text-red-400">3D view failed to start</p>
          <p className="max-w-sm text-xs text-zinc-400">
            {this.state.error.message || "WebGL or script load error — try refreshing."}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="rounded-full bg-zinc-700 px-4 py-2 text-xs font-bold text-white"
          >
            Try again
          </button>
          <Link href="/map" className="text-xs text-[var(--ld-muted)] underline">
            Back to free map
          </Link>
        </div>
      );
    }

    return this.props.children;
  }
}
