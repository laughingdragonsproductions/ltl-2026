import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b border-[var(--ld-purple-dim)]/30 px-4 py-4 text-center">
        <Link
          href="/"
          className="text-sm font-black tracking-widest text-[var(--ld-neon-green)] hover:opacity-90"
        >
          LTL26
        </Link>
      </header>
      {children}
    </>
  );
}
