import type { Metadata } from "next";
import { FESTIVAL_MAP_SRC } from "@/lib/festival-map";

export const metadata: Metadata = {
  title: "Festival Map — LTL26",
  description:
    "Interactive Louder Than Life 2026 tap map with stages, entrances, and VIP zones.",
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <head>
        <link rel="preload" href={FESTIVAL_MAP_SRC} as="image" type="image/jpeg" />
      </head>
      {children}
    </>
  );
}
