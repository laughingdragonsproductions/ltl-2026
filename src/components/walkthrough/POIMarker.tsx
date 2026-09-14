"use client";

import { Html } from "@react-three/drei";
import { mapPercentToLocal } from "@/lib/georef";
import type { WalkPOI } from "@/lib/walkthrough-pois";

export function POIMarker({ poi }: { poi: WalkPOI }) {
  const [x, z] = mapPercentToLocal(poi.mapPosition);
  const color = poi.color ?? "#f97316";

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 4, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 4.2, 0]}>
        <sphereGeometry args={[1.2, 12, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Html
        position={[0, 6, 0]}
        center
        distanceFactor={80}
        style={{ pointerEvents: "none" }}
      >
        <div className="whitespace-nowrap rounded bg-black/80 px-2 py-0.5 text-[10px] font-bold text-white">
          {poi.name}
        </div>
      </Html>
    </group>
  );
}
