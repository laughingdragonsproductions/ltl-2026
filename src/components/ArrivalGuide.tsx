"use client";

import { data } from "@/lib/data";
import { useTier } from "@/lib/tier-context";

const tierEntrance: Record<string, string> = {
  ga: "Highland or Cardinal Entrance (pick based on parking)",
  vip: "VIP Entrance near Main Merch / Louder-Life stages",
  topshelf: "Top Shelf Entrance (east edge) — express lanes + Skybox access",
};

const tierLocker: Record<string, string> = {
  ga: "Highland GA Lockers (south) or Cardinal GA Lockers (north)",
  vip: "VIP Lockers inside VIP green zone",
  topshelf: "Top Shelf-only lockers inside Angel's Envy red zone",
};

export function ArrivalGuide() {
  const { tier } = useTier();

  const steps = [
    {
      title: "Register your RFID wristband",
      body: "Mandatory before entry. Code is on the back of the RFID saddle. Link your Front Gate order number at pass-info on the official site.",
      link: data.festival.links.registerWristband,
    },
    {
      title: "Get your credentials",
      body:
        data.credentials.fulfillment.shipping.timeline +
        ". Late orders: Box Office & Will Call at Highland with order confirmation + photo ID.",
    },
    {
      title: "Plan parking (sold separately)",
      body: `$${data.parking.onsite.pricePerDay}/day onsite FCFS via KEC Gates ${data.parking.onsite.gates.join(", ")}. Opens 90 min before gates. Cash OK in parking lots only.`,
    },
    {
      title: "Choose your entrance",
      body: tierEntrance[tier],
    },
    {
      title: "Bring both credentials if VIP",
      body:
        tier === "ga"
          ? "RFID wristband only."
          : "RFID wristband AND commemorative laminate. Top Shelf also uses dedicated Top Shelf entrance.",
    },
    {
      title: "Reserve lockers near your zone",
      body: tierLocker[tier],
    },
    {
      title: "Load cashless on wristband (optional)",
      body: "Venue is cashless. Registered RFID works at all food, beverage, and merch vendors.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-green-800/50 bg-green-950/20 p-4">
        <h2 className="font-bold text-green-400">
          Your pass mode: {tier.toUpperCase()}
        </h2>
        <p className="mt-1 text-sm text-zinc-300">
          Entrance: {tierEntrance[tier]}
        </p>
      </div>

      <ol className="space-y-4">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className="flex gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-600 text-sm font-bold">
              {i + 1}
            </span>
            <div>
              <h3 className="font-bold text-white">{step.title}</h3>
              <p className="mt-1 text-sm text-zinc-400">{step.body}</p>
              {step.link && (
                <a
                  href={step.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm text-orange-400 underline"
                >
                  Register wristband →
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 p-4">
          <h3 className="font-bold text-orange-400">Box Office Hours</h3>
          <ul className="mt-2 space-y-1 text-sm text-zinc-400">
            {data.credentials.boxOffices.map((bo) => (
              <li key={bo.id}>
                <strong className="text-zinc-200">{bo.name}:</strong> {bo.hours}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-zinc-800 p-4">
          <h3 className="font-bold text-orange-400">Parking Options</h3>
          <ul className="mt-2 space-y-1 text-sm text-zinc-400">
            <li>On-site: ${data.parking.onsite.pricePerDay}/day</li>
            <li>Rideshare: {data.parking.rideshare.address}</li>
            <li>Downtown shuttle: ${data.parking.shuttles.downtown.fourDayPass} 4-day pass</li>
            <li>PARC+TARC: ${data.parking.shuttles.parcTarc.price} round-trip</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
