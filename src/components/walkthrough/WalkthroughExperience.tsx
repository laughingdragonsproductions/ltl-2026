"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTier } from "@/lib/tier-context";
import { isMobilePrimary } from "@/lib/is-mobile-primary";
import {
  createWalkthroughTouchInput,
  type WalkthroughTouchInput,
} from "@/lib/walkthrough-input";
import {
  collectWalkthroughPOIs,
  getTourWaypoints,
  type WalkPOI,
} from "@/lib/walkthrough-pois";
import { mapPercentToLocal } from "@/lib/georef";
import { WalkthroughCanvasShell } from "./WalkthroughCanvasShell";
import { WalkthroughWorld } from "./WalkthroughWorld";
import { WalkthroughHUD } from "./WalkthroughHUD";
import { WalkthroughMobileControls } from "./WalkthroughMobileControls";
import { useDeviceCompass } from "./use-device-compass";
import { useWalkthroughGps, type GpsWalkUpdate } from "./use-walkthrough-gps";

export type WalkMode = "festival" | "satellite";

export function WalkthroughExperience() {
  const { tier } = useTier();
  const pois = useMemo(() => collectWalkthroughPOIs(tier), [tier]);
  const tourWaypoints = useMemo(() => getTourWaypoints(tier), [tier]);
  const [mode, setMode] = useState<WalkMode>("festival");
  const [nearPoi, setNearPoi] = useState<WalkPOI | null>(null);
  const [tourActive, setTourActive] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);
  const [locked, setLocked] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [gpsFollow, setGpsFollow] = useState(false);
  const [showMobileHint, setShowMobileHint] = useState(false);
  const [mounted, setMounted] = useState(false);
  const teleportRef = useRef<(x: number, z: number) => void>(() => {});
  const touchInputRef = useRef<WalkthroughTouchInput>(createWalkthroughTouchInput());

  const handleFirstGpsFix = useCallback((update: GpsWalkUpdate) => {
    teleportRef.current(update.local[0], update.local[1]);
  }, []);

  const { gpsTargetRef, gpsStatus, gpsSnapshot } = useWalkthroughGps(
    gpsFollow && mode === "festival" && !tourActive,
    handleFirstGpsFix
  );

  const compassYawRef = useDeviceCompass(gpsFollow && mode === "festival" && !tourActive);

  const handleNearPoi = useCallback((poi: WalkPOI | null) => {
    setNearPoi(poi);
  }, []);

  useEffect(() => {
    setMounted(true);
    const mob = isMobilePrimary();
    setMobile(mob);
    if (mob) {
      setMode("festival");
      setGpsFollow(true);
      setShowMobileHint(true);
    }
  }, []);

  const startTour = useCallback(() => {
    setGpsFollow(false);
    setTourActive(true);
    setTourIndex(0);
    const first = tourWaypoints[0];
    if (first) {
      const [x, z] = mapPercentToLocal(first.mapPosition);
      teleportRef.current(x, z);
    }
  }, [tourWaypoints]);

  const nextTourStop = useCallback(() => {
    setTourIndex((prev) => {
      const next = prev + 1;
      if (next >= tourWaypoints.length) {
        setTourActive(false);
        return 0;
      }
      const wp = tourWaypoints[next];
      const [x, z] = mapPercentToLocal(wp.mapPosition);
      teleportRef.current(x, z);
      return next;
    });
  }, [tourWaypoints]);

  const currentTourStop = tourActive ? tourWaypoints[tourIndex] : null;

  const canvasHeight = mobile
    ? "h-[min(72dvh,640px)] min-h-[420px]"
    : "h-[min(80vh,720px)]";

  if (!mounted) {
    return (
      <WalkthroughCanvasShell detail="Starting WebGL — first visit may take a few seconds." />
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border border-zinc-700 bg-black touch-none ${canvasHeight}`}
      style={{ touchAction: "none" }}
    >
      <Canvas shadows camera={{ fov: mobile ? 75 : 70, position: [0, 1.7, 0] }}>
        <Suspense
          fallback={
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color="#111" />
            </mesh>
          }
        >
          <WalkthroughWorld
            mode={mode}
            pois={pois}
            onNearPoi={handleNearPoi}
            tourTarget={
              tourActive && currentTourStop
                ? mapPercentToLocal(currentTourStop.mapPosition)
                : null
            }
            teleportRef={teleportRef}
            onLockChange={setLocked}
            mobile={mobile}
            touchInputRef={touchInputRef}
            gpsFollow={gpsFollow}
            gpsTargetRef={gpsTargetRef}
            compassYawRef={compassYawRef}
          />
        </Suspense>
      </Canvas>

      {mobile && locked && (
        <WalkthroughMobileControls
          inputRef={touchInputRef}
          disabled={tourActive}
          onInteract={() => setShowMobileHint(false)}
        />
      )}

      <WalkthroughHUD
        mode={mode}
        onModeChange={setMode}
        locked={locked}
        mobile={mobile}
        nearPoi={nearPoi}
        tourActive={tourActive}
        tourIndex={tourIndex}
        tourTotal={tourWaypoints.length}
        currentTourStop={currentTourStop}
        onStartTour={startTour}
        onNextTourStop={nextTourStop}
        onStopTour={() => setTourActive(false)}
        tier={tier}
        gpsFollow={gpsFollow}
        onGpsFollowChange={setGpsFollow}
        gpsStatus={gpsStatus}
        gpsAccuracyM={gpsSnapshot?.accuracyM ?? null}
        showMobileHint={showMobileHint}
        onDismissMobileHint={() => setShowMobileHint(false)}
      />
    </div>
  );
}
