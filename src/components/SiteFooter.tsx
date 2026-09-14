const STRIPE_LINK = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;
const KOFI_URL = process.env.NEXT_PUBLIC_KOFI_URL;

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--ld-purple-dim)]/40 bg-black/40 px-4 py-6 text-center text-xs text-[var(--ld-muted)]">
      <p>
        Unofficial fan project · Not affiliated with Danny Wimmer Presents or Louder Than
        Life
      </p>
      <p className="mt-1">Support keeps servers running</p>
      {STRIPE_LINK && (
        <p className="mt-2">
          <a
            href={STRIPE_LINK}
            className="font-semibold text-[var(--ld-neon-green)] hover:underline"
          >
            Unlock map ($5)
          </a>
        </p>
      )}
      {KOFI_URL && (
        <p className="mt-1">
          <a
            href={KOFI_URL}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--ld-muted)] underline hover:text-white"
          >
            Ko-fi tips (optional)
          </a>
        </p>
      )}
      <p className="mt-2">
        Created by{" "}
        <a
          href="https://brandonsparks.com"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-[var(--ld-neon-green)] hover:underline"
        >
          Laughing Dragons Productions
        </a>
      </p>
      <p className="mt-1 text-[10px] opacity-70">© 2026 ltl26.com</p>
    </footer>
  );
}
