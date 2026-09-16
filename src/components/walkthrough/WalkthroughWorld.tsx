"use client";

import { PointerLockControls, useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FESTIVAL_MAP_SRC } from "@/lib/festival-map";
import { mapPercentToLocal, georef } from "@/lib/georef";
import type { WalkPOI } from "@/lib/walkthrough-pois";
import type { WalkMode } from "./WalkthroughExperience";
import { POIMarker } from "./POIMarker";
import { SatelliteTiles } from "./SatelliteTiles";

const MOVE_SPEED = 8;
const TOUR_LERP = 0.03;

type Props = {
  mode: WalkMode;
  pois: WalkPOI[];
  onNearPoi: (poi: WalkPOI | null) => void;
  tourTarget: [number, number] | null;
  teleportRef: React.MutableRefObject<(x: number, z: number) => void>;
  onLockChange: (locked: boolean) => void;
};

export function WalkthroughWorld({
  mode,
  pois,
  onNearPoi,
  tourTarget,
  teleportRef,
  onLockChange,
}: Props) {
  const { camera } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const mapTexture = useTexture(FESTIVAL_MAP_SRC);
  const [teleportPos, setTeleportPos] = useState<[number, number] | null>(null);

  useEffect(() => {
    teleportRef.current = (x: number, z: number) => {
      setTeleportPos([x, z]);
    };
  }, [teleportRef]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
    };
    const up = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame((_, delta) => {
    if (teleportPos) {
      camera.position.x = teleportPos[0];
      camera.position.z = teleportPos[1];
      camera.position.y = 1.7;
      setTeleportPos(null);
    }

    if (tourTarget) {
      camera.position.x += (tourTarget[0] - camera.position.x) * TOUR_LERP;
      camera.position.z += (tourTarget[1] - camera.position.z) * TOUR_LERP;
      camera.position.y = 1.7;
    } else {
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      dir.y = 0;
      dir.normalize();
      const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0));

      const move = new THREE.Vector3();
      if (keys.current.KeyW || keys.current.ArrowUp) move.add(dir);
      if (keys.current.KeyS || keys.current.ArrowDown) move.sub(dir);
      if (keys.current.KeyA || keys.current.ArrowLeft) move.sub(right);
      if (keys.current.KeyD || keys.current.ArrowRight) move.add(right);

      if (move.lengthSq() > 0) {
        move.normalize().multiplyScalar(MOVE_SPEED * delta);
        camera.position.add(move);
      }
    }

    camera.position.y = 1.7;

    const bounds = georef.festivalMapPlane;
    const halfW = bounds.widthMeters / 2 - 5;
    const halfD = bounds.depthMeters / 2 - 5;
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -halfW, halfW);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -halfD, halfD);

    let closest: WalkPOI | null = null;
    let closestDist = 35;
    for (const poi of pois) {
      const [px, pz] = mapPercentToLocal(poi.mapPosition);
      const dist = Math.hypot(camera.position.x - px, camera.position.z - pz);
      if (dist < closestDist) {
        closestDist = dist;
        closest = poi;
      }
    }
    onNearPoi(closest);
  });

  const planeW = georef.festivalMapPlane.widthMeters;
  const planeD = georef.festivalMapPlane.depthMeters;

  return (
    <>
      <color attach="background" args={["#0a0a0a"]} />
      <ambientLight intensity={mode === "festival" ? 1.2 : 0.8} />
      <directionalLight position={[100, 200, 50]} intensity={1.2} castShadow />

      {mode === "festival" ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
          <planeGeometry args={[planeW, planeD]} />
          <meshStandardMaterial map={mapTexture} />
        </mesh>
      ) : (
        <SatelliteTiles />
      )}

      {/* VIP zone overlays on festival map */}
      {mode === "festival" && (
        <>
          <ZoneOverlay
            mapPosition={{ x: 75, y: 42 }}
            width={180}
            depth={120}
            color="#22c55e"
            opacity={0.25}
          />
          <ZoneOverlay
            mapPosition={{ x: 92, y: 30 }}
            width={80}
            depth={100}
            color="#ef4444"
            opacity={0.3}
          />
        </>
      )}

      {pois.map((poi) => (
        <POIMarker key={poi.id} poi={poi} />
      ))}

      <PointerLockControls
        onLock={() => onLockChange(true)}
        onUnlock={() => onLockChange(false)}
      />
    </>
  );
}

function ZoneOverlay({
  mapPosition,
  width,
  depth,
  color,
  opacity,
}: {
  mapPosition: { x: number; y: number };
  width: number;
  depth: number;
  color: string;
  opacity: number;
}) {
  const [x, z] = mapPercentToLocal(mapPosition);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.05, z]}>
      <planeGeometry args={[width, depth]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}
