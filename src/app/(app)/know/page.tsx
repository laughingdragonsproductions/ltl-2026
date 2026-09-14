import { data } from "@/lib/data";

export default function KnowPage() {
  return (
    <div>
      <h1 className="text-3xl font-black text-[var(--ld-neon-green)]">Know Before You Go</h1>
      <p className="mt-2 text-[var(--ld-muted)]">
        Quick reference — confirm on{" "}
        <a
          href={data.festival.links.official}
          className="text-[var(--ld-neon-green)] underline"
          target="_blank"
          rel="noreferrer"
        >
          louderthanlife.com
        </a>
        .
      </p>
      <section className="mt-6 space-y-4 text-sm text-[var(--ld-text)]">
        <div className="rounded-lg border border-[var(--ld-purple-dim)]/40 p-4">
          <h2 className="font-bold text-[var(--ld-neon-green)]">Allowed in bags</h2>
          <ul className="mt-2 list-inside list-disc text-[var(--ld-muted)]">
            {data.bagPolicy.allowed.slice(0, 6).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-[var(--ld-purple-dim)]/40 p-4">
          <h2 className="font-bold text-[var(--ld-neon-green)]">Sources</h2>
          <ul className="mt-2 space-y-1 text-[var(--ld-muted)]">
            {data.sources.sources.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noreferrer" className="underline">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
