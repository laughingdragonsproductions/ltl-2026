"use client";

import { Html } from "@react-three/drei";
import { useMemo } from "react";
import { mapPercentToLocal } from "@/lib/georef";
import { useTier } from "@/lib/tier-context";
import { getWalkthroughZones, type WalkthroughZone } from "@/lib/walkthrough-zones";

export function WalkthroughZones() {
  const { tier } = useTier();
  const zones = useMemo(() => getWalkthroughZones(tier), [tier]);

  return (
    <>
      {zones.map((zone) => (
        <ZoneNode key={zone.id} zone={zone} />
      ))}
    </>
  );
}

function ZoneNode({ zone }: { zone: WalkthroughZone }) {
  const [x, z] = mapPercentToLocal(zone.mapPosition);
  const labelY = zone.category === "vip" ? 12 : 8;

  return (
    <group position={[x, 0, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <planeGeometry args={[zone.width, zone.depth]} />
        <meshBasicMaterial color={zone.color} transparent opacity={zone.opacity} />
      </mesh>
      <Html
        position={[0, labelY, 0]}
        center
        distanceFactor={100}
        zIndexRange={[40, 0]}
        style={{ pointerEvents: "none" }}
      >
        <div className="flex flex-col items-center gap-0.5">
          <span
            className="whitespace-nowrap rounded px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-white shadow-lg"
            style={{
              backgroundColor: `${zone.color}dd`,
              boxShadow: `0 0 12px ${zone.color}66`,
            }}
          >
            {zone.name}
          </span>
          {zone.subtitle && (
            <span className="max-w-[10rem] truncate rounded bg-black/70 px-2 py-0.5 text-[9px] font-medium text-zinc-300">
              {zone.subtitle}
            </span>
          )}
        </div>
      </Html>
    </group>
  );
}
