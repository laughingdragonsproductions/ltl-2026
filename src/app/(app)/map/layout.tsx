import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Festival Map — LTL26",
  description:
    "Interactive Louder Than Life 2026 tap map with stages, entrances, and VIP zones.",
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return children;
}
