import guestArticle from "../../data/guest-article-litprintz.json";

export function KnowGuestArticle() {
  const article = guestArticle;

  return (
    <article className="rounded-xl border border-[var(--ld-border-green)] bg-[var(--ld-surface)]/80 p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-[var(--ld-purple)]">
        Guest article
      </p>
      <h2 className="mt-2 text-xl font-black text-[var(--ld-neon-green)]">{article.title}</h2>
      <p className="mt-1 text-sm text-[var(--ld-muted)]">
        <a
          href={article.authorUrl}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-[var(--ld-purple)] underline"
        >
          {article.byline}
        </a>
      </p>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--ld-text)]">
        {article.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 48)}>{paragraph}</p>
        ))}
      </div>
      <a
        href={article.cta.href}
        target="_blank"
        rel="noreferrer"
        className="mt-5 inline-block rounded-full bg-[var(--ld-neon-green)] px-5 py-2.5 text-sm font-black text-black"
      >
        {article.cta.label}
      </a>
    </article>
  );
}
