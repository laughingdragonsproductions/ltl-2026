import { data } from "@/lib/data";

export function CredentialsGuide() {
  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-6">
        <h2 className="text-xl font-black text-orange-500">The Two &quot;Bands&quot;</h2>
        <p className="mt-2 text-zinc-300">
          People confuse the RFID wristband with the VIP laminate. You need both for VIP entry —
          they do different jobs.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {data.credentials.items.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-zinc-700 bg-black/40 p-4"
            >
              <h3 className="font-bold text-white">{item.name}</h3>
              {item.requiredForEntry && (
                <span className="mt-1 inline-block rounded bg-red-900/50 px-2 py-0.5 text-xs text-red-300">
                  Required for entry
                </span>
              )}
              <p className="mt-2 text-sm text-zinc-400">{item.description}</p>
              <ul className="mt-3 space-y-1 text-sm text-zinc-300">
                {item.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold">How you get them</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-zinc-800 p-4">
            <h3 className="font-semibold text-green-400">Shipped to you</h3>
            <p className="mt-2 text-sm text-zinc-400">
              {data.credentials.fulfillment.shipping.timeline}. Tracking from{" "}
              {data.credentials.fulfillment.shipping.trackingEmail}.
            </p>
          </div>
          <div className="rounded-lg border border-zinc-800 p-4">
            <h3 className="font-semibold text-yellow-400">Will Call pickup</h3>
            <p className="mt-2 text-sm text-zinc-400">
              {data.credentials.fulfillment.willCall.location}. Bring:{" "}
              {data.credentials.fulfillment.willCall.required.join(" + ")}.
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              Proxy allowed with purchaser ID copy + written consent.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold">VIP vs Top Shelf access</h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900 text-zinc-400">
              <tr>
                <th className="px-4 py-2">Perk</th>
                <th className="px-4 py-2">VIP</th>
                <th className="px-4 py-2">Top Shelf</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Dedicated entry lane", "✓", "Express VIP"],
                ["VIP green lounge", "✓", "✓"],
                ["Top Shelf Skybox", "—", "✓"],
                ["All-inclusive drinks in Top Shelf", "—", "✓"],
                ["Food Zone 7 vendors", "✓", "✓"],
                ["Top Shelf-only lockers", "—", "✓"],
              ].map(([perk, vip, ts]) => (
                <tr key={perk} className="border-t border-zinc-800">
                  <td className="px-4 py-2">{perk}</td>
                  <td className="px-4 py-2 text-green-400">{vip}</td>
                  <td className="px-4 py-2 text-red-400">{ts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
