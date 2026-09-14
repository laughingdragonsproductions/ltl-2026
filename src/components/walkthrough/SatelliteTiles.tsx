"use client";

import { useTexture } from "@react-three/drei";
import { georef, latLngToTile } from "@/lib/georef";

const ZOOM = georef.satellite.defaultZoom;
const TILE_SIZE = georef.satellite.tileSizeMetersAtZoom16;
const GRID = 3;

function tileUrl(x: number, y: number) {
  return georef.satellite.tileUrl
    .replace("{z}", String(ZOOM))
    .replace("{x}", String(x))
    .replace("{y}", String(y));
}

export function SatelliteTiles() {
  const { lat, lng } = georef.venue.center;
  const center = latLngToTile(lat, lng, ZOOM);
  const offset = Math.floor(GRID / 2);

  const tiles: { url: string; x: number; z: number; key: string }[] = [];
  for (let dy = -offset; dy <= offset; dy++) {
    for (let dx = -offset; dx <= offset; dx++) {
      const tx = center.x + dx;
      const ty = center.y + dy;
      tiles.push({
        url: tileUrl(tx, ty),
        x: dx * TILE_SIZE,
        z: dy * TILE_SIZE,
        key: `${tx}-${ty}`,
      });
    }
  }

  return (
    <group>
      {tiles.map((t) => (
        <SatelliteTile key={t.key} url={t.url} x={t.x} z={t.z} />
      ))}
    </group>
  );
}

function SatelliteTile({ url, x, z }: { url: string; x: number; z: number }) {
  const texture = useTexture(url);
  texture.wrapS = texture.wrapT = 1000;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0, z]} receiveShadow>
      <planeGeometry args={[TILE_SIZE, TILE_SIZE]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}
