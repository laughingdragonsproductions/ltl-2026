import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GlobalSessionUI } from "@/components/GlobalSessionUI";
import { SiteFooter } from "@/components/SiteFooter";
import { SessionProvider } from "@/lib/session-context";
import { TierProvider } from "@/lib/tier-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ltl26.com"),
  title: "LTL26 — Louder Than Life 2026 Live Map & Schedule",
  description:
    "Interactive Louder Than Life 2026 festival map, set times, and VIP guide — unofficial fan tool from Laughing Dragons Productions.",
  openGraph: {
    title: "LTL 2026 Live Map & Schedule",
    description:
      "Interactive festival map, set times, VIP guide — unofficial fan tool",
    url: "https://ltl26.com/map",
    siteName: "LTL26",
    type: "website",

  },
  twitter: {
    card: "summary_large_image",
    title: "LTL 2026 Live Map & Schedule",
    description:
      "Interactive festival map, set times, VIP guide — unofficial fan tool",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
        <link rel="canonical" href="https://ltl26.com/map" />
      </head>
      <body className="flex min-h-full flex-col bg-[var(--ld-black)] text-[var(--ld-text)]">
        <TierProvider>
          <SessionProvider>
            <GlobalSessionUI />
            <main className="mx-auto w-full flex-1">{children}</main>
            <SiteFooter />
          </SessionProvider>
        </TierProvider>
      </body>
    </html>
  );
}
