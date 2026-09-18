"use client";

import { Html } from "@react-three/drei";
import { mapPercentToLocal } from "@/lib/georef";
import type { WalkPOI } from "@/lib/walkthrough-pois";

export function POIMarker({
  poi,
  showLabel = true,
}: {
  poi: WalkPOI;
  showLabel?: boolean;
}) {
  const [x, z] = mapPercentToLocal(poi.mapPosition);
  const color = poi.color ?? "#f97316";

  const isStage = poi.category === "stage";

  return (
    <group position={[x, 0, z]}>
      {!isStage && (
        <>
          <mesh position={[0, 2, 0]}>
            <cylinderGeometry args={[0.8, 0.8, 4, 8]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[0, 4.2, 0]}>
            <sphereGeometry args={[1.2, 12, 12]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </>
      )}
      {showLabel && (
        <Html
          position={[0, 6, 0]}
          center
          distanceFactor={85}
          zIndexRange={[45, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div className="flex flex-col items-center gap-0.5">
            <span className="whitespace-nowrap rounded bg-black/70 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-zinc-400">
              {poi.category.replace("-", " ")}
            </span>
            <span className="whitespace-nowrap rounded bg-black/85 px-2.5 py-1 text-[11px] font-black text-white">
              {poi.name}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}
