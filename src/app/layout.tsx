import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
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
  title: "LTL26 — Louder Than Life 2026 Interactive Map",
  description:
    "Interactive Louder Than Life 2026 festival map and companion — coming soon from Laughing Dragons Productions.",
  openGraph: {
    title: "LTL26 — Louder Than Life 2026 Map",
    description: "Interactive festival map coming soon. Sept 17–20, Louisville.",
    url: "https://ltl26.com",
    siteName: "LTL26",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LTL26 — Louder Than Life 2026 Map",
    description: "Interactive festival map coming soon.",
  },
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
        <meta name="theme-color" content="#0a0a0f" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="canonical" href="https://ltl26.com" />
      </head>
      <body className="flex min-h-full flex-col bg-[var(--ld-black)] text-[var(--ld-text)]">
        <TierProvider>
          <main className="mx-auto w-full flex-1">{children}</main>
          <SiteFooter />
        </TierProvider>
      </body>
    </html>
  );
}
