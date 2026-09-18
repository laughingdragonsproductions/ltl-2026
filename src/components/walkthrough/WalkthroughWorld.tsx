"use client";

import { PointerLockControls, useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FESTIVAL_MAP_SRC } from "@/lib/festival-map";
import { mapPercentToLocal, georef } from "@/lib/georef";
import type { WalkthroughTouchInput } from "@/lib/walkthrough-input";
import type { WalkPOI } from "@/lib/walkthrough-pois";
import type { WalkMode } from "./WalkthroughExperience";
import type { GpsWalkUpdate } from "./use-walkthrough-gps";
import { getDefaultSpawnLocal } from "./use-walkthrough-gps";
import { FestivalStructures } from "./FestivalStructures";
import { WalkthroughZones } from "./WalkthroughZones";
import { POIMarker } from "./POIMarker";
import { SatelliteTiles } from "./SatelliteTiles";
import { STRUCTURE_STAGE_IDS } from "@/lib/walkthrough-structures";

const MOVE_SPEED = 8;
const TOUR_LERP = 0.03;
const EYE_HEIGHT = 1.7;

function gpsLerpFactor(accuracyM: number): number {
  if (accuracyM <= 8) return 0.38;
  if (accuracyM <= 20) return 0.22;
  if (accuracyM <= 45) return 0.14;
  return 0.07;
}

function movementHeadingToYaw(headingRad: number): number {
  return -headingRad + Math.PI / 2;
}

type Props = {
  mode: WalkMode;
  pois: WalkPOI[];
  onNearPoi: (poi: WalkPOI | null) => void;
  tourTarget: [number, number] | null;
  teleportRef: React.MutableRefObject<(x: number, z: number) => void>;
  onLockChange: (locked: boolean) => void;
  mobile?: boolean;
  touchInputRef?: React.MutableRefObject<WalkthroughTouchInput>;
  gpsFollow?: boolean;
  gpsTargetRef?: React.MutableRefObject<GpsWalkUpdate | null>;
  compassYawRef?: React.MutableRefObject<number | null>;
};

export function WalkthroughWorld({
  mode,
  pois,
  onNearPoi,
  tourTarget,
  teleportRef,
  onLockChange,
  mobile = false,
  touchInputRef,
  gpsFollow = false,
  gpsTargetRef,
  compassYawRef,
}: Props) {
  const { camera } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const mapTexture = useTexture(FESTIVAL_MAP_SRC);
  const [teleportPos, setTeleportPos] = useState<[number, number] | null>(null);
  const spawnedRef = useRef(false);

  useEffect(() => {
    if (mobile) onLockChange(true);
  }, [mobile, onLockChange]);

  useEffect(() => {
    if (!mobile || spawnedRef.current || gpsFollow) return;
    spawnedRef.current = true;
    const [x, z] = getDefaultSpawnLocal();
    camera.position.set(x, EYE_HEIGHT, z);
    camera.rotation.order = "YXZ";
    camera.rotation.y = -0.4;
    camera.rotation.x = 0;
  }, [mobile, gpsFollow, camera]);

  useEffect(() => {
    teleportRef.current = (x: number, z: number) => {
      setTeleportPos([x, z]);
    };
  }, [teleportRef]);

  useEffect(() => {
    if (mobile) return;
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
  }, [mobile]);

  useFrame((_, delta) => {
    if (teleportPos) {
      camera.position.x = teleportPos[0];
      camera.position.z = teleportPos[1];
      camera.position.y = EYE_HEIGHT;
      setTeleportPos(null);
    }

    if (tourTarget) {
      camera.position.x += (tourTarget[0] - camera.position.x) * TOUR_LERP;
      camera.position.z += (tourTarget[1] - camera.position.z) * TOUR_LERP;
      camera.position.y = EYE_HEIGHT;
    } else if (gpsFollow && gpsTargetRef?.current && mode === "festival") {
      const gps = gpsTargetRef.current;
      const [gx, gz] = gps.local;
      const manualJoystick =
        mobile &&
        touchInputRef &&
        (Math.abs(touchInputRef.current.forward) > 0.08 ||
          Math.abs(touchInputRef.current.strafe) > 0.08);
      const manualKeyboard =
        !mobile &&
        (keys.current.KeyW ||
          keys.current.KeyS ||
          keys.current.KeyA ||
          keys.current.KeyD ||
          keys.current.ArrowUp ||
          keys.current.ArrowDown ||
          keys.current.ArrowLeft ||
          keys.current.ArrowRight);

      if (!manualJoystick && !manualKeyboard) {
        const t = gpsLerpFactor(gps.accuracyM);
        camera.position.x += (gx - camera.position.x) * t;
        camera.position.z += (gz - camera.position.z) * t;

        camera.rotation.order = "YXZ";
        let targetYaw: number | null = null;
        if (gps.speedMps > 0.6 && gps.heading != null) {
          targetYaw = movementHeadingToYaw(gps.heading);
        } else if (compassYawRef?.current != null) {
          targetYaw = compassYawRef.current;
        }
        if (targetYaw != null) {
          let diff = targetYaw - camera.rotation.y;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          camera.rotation.y += diff * 0.08;
        }
      }

      applyTouchLook();

      if (manualJoystick) {
        applyManualMove(delta);
      } else if (manualKeyboard) {
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
    } else {
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      dir.y = 0;
      dir.normalize();
      const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0));

      if (mobile && touchInputRef) {
        applyTouchLook();
        applyManualMove(delta);
      } else {
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
    }

    camera.position.y = EYE_HEIGHT;

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

  function applyManualMove(delta: number) {
    if (!touchInputRef) return;
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    dir.y = 0;
    dir.normalize();
    const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0));
    const { forward, strafe } = touchInputRef.current;
    const move = new THREE.Vector3();
    if (Math.abs(forward) > 0.08) move.add(dir.clone().multiplyScalar(forward));
    if (Math.abs(strafe) > 0.08) move.add(right.clone().multiplyScalar(strafe));
    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(MOVE_SPEED * delta);
      camera.position.add(move);
    }
  }

  function applyTouchLook() {
    if (!touchInputRef) return;
    const { lookYaw, lookPitch } = touchInputRef.current;
    if (Math.abs(lookYaw) > 0.0001 || Math.abs(lookPitch) > 0.0001) {
      camera.rotation.order = "YXZ";
      camera.rotation.y += lookYaw;
      camera.rotation.x += lookPitch;
      camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x, -1.25, 1.25);
      touchInputRef.current.lookYaw = 0;
      touchInputRef.current.lookPitch = 0;
    }
  }

  const planeW = georef.festivalMapPlane.widthMeters;
  const planeD = georef.festivalMapPlane.depthMeters;

  return (
    <>
      <color attach="background" args={["#0a0a0a"]} />
      <fog attach="fog" args={["#0a0a0a", 80, 420]} />
      <ambientLight intensity={mode === "festival" ? 0.65 : 0.8} />
      <hemisphereLight args={["#8888aa", "#1a1a12", 0.45]} />
      <directionalLight position={[100, 200, 50]} intensity={1.1} castShadow />

      {mode === "festival" ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
          <planeGeometry args={[planeW, planeD]} />
          <meshStandardMaterial map={mapTexture} />
        </mesh>
      ) : (
        <SatelliteTiles />
      )}

      {mode === "festival" && <WalkthroughZones />}

      {mode === "festival" && <FestivalStructures />}

      {pois.map((poi) => {
        if (mode === "festival" && poi.category === "stage" && STRUCTURE_STAGE_IDS.has(poi.id)) {
          return null;
        }
        const zoneLabeled =
          poi.category === "food" || poi.category === "vip-zone";
        return (
          <POIMarker key={poi.id} poi={poi} showLabel={!zoneLabeled} />
        );
      })}

      {!mobile && (
        <PointerLockControls
          onLock={() => onLockChange(true)}
          onUnlock={() => onLockChange(false)}
        />
      )}
    </>
  );
}

