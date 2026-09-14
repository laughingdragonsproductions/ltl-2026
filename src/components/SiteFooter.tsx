export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--ld-purple-dim)]/40 bg-black/40 px-4 py-6 text-center text-xs text-[var(--ld-muted)]">
      <p>
        Unofficial fan project · Not affiliated with Danny Wimmer Presents or Louder Than
        Life
      </p>
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
      <p className="mt-1 text-[10px] opacity-70">© {new Date().getFullYear()} ltl26.com</p>
    </footer>
  );
}
