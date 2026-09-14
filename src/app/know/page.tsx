import { data } from "@/lib/data";

export default function KnowPage() {
  const { bagPolicy, festival, sources } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black">Know Before You Go</h1>
        <p className="mt-2 text-zinc-400">Rules, policies, and practical festival info.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 p-5">
          <h2 className="font-bold text-orange-400">Gates & Re-entry</h2>
          <p className="mt-2 text-sm text-zinc-300">
            Gates open {festival.gatesOpen} daily. Re-entry is{" "}
            {festival.reEntry.allowed ? "allowed" : "NOT allowed"} except for:{" "}
            {festival.reEntry.exceptions.join(", ")}.
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 p-5">
          <h2 className="font-bold text-orange-400">Venue</h2>
          <p className="mt-2 text-sm text-zinc-300">{festival.venue.name}</p>
          <p className="text-sm text-zinc-400">{festival.venue.address}</p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold">Allowed Items</h2>
        <ul className="mt-3 grid gap-1 text-sm text-zinc-400 sm:grid-cols-2">
          {bagPolicy.allowed.map((item) => (
            <li key={item}>✓ {item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-bold">Prohibited Items</h2>
        <ul className="mt-3 grid gap-1 text-sm text-zinc-400 sm:grid-cols-2">
          {bagPolicy.prohibited.map((item) => (
            <li key={item}>✗ {item}</li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-zinc-500">{bagPolicy.security}</p>
      </section>

      <section>
        <h2 className="text-lg font-bold">Cashless & Payment</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Inside venue: {bagPolicy.cashless.insideVenue.join(", ")}. Parking still accepts cash.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold">Data Sources</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {sources.sources.map((s) => (
            <li key={s.id}>
              <a
                href={s.url === "user-provided" ? "#" : s.url}
                className="text-orange-400 underline"
                target="_blank"
                rel="noreferrer"
              >
                {s.title}
              </a>
              <span className="ml-2 text-zinc-600">({s.type})</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
