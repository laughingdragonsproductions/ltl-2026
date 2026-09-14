"use client";

import dynamic from "next/dynamic";

const WalkthroughExperience = dynamic(
  () =>
    import("./WalkthroughExperience").then((m) => m.WalkthroughExperience),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[480px] items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-400">
        Loading 3D walkthrough…
      </div>
    ),
  }
);

export function WalkthroughLoader() {
  return <WalkthroughExperience />;
}
