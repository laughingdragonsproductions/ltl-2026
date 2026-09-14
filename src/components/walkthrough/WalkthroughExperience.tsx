"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useCallback, useMemo, useRef, useState } from "react";
import { useTier } from "@/lib/tier-context";
import {
  collectWalkthroughPOIs,
  getTourWaypoints,
  type WalkPOI,
} from "@/lib/walkthrough-pois";
import { mapPercentToLocal } from "@/lib/georef";
import { WalkthroughWorld } from "./WalkthroughWorld";
import { WalkthroughHUD } from "./WalkthroughHUD";

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
  const teleportRef = useRef<(x: number, z: number) => void>(() => {});

  const handleNearPoi = useCallback((poi: WalkPOI | null) => {
    setNearPoi(poi);
  }, []);

  const startTour = () => {
    setTourActive(true);
    setTourIndex(0);
    const first = tourWaypoints[0];
    if (first) {
      const [x, z] = mapPercentToLocal(first.mapPosition);
      teleportRef.current(x, z);
    }
  };

  const nextTourStop = () => {
    const next = tourIndex + 1;
    if (next >= tourWaypoints.length) {
      setTourActive(false);
      setTourIndex(0);
      return;
    }
    setTourIndex(next);
    const wp = tourWaypoints[next];
    const [x, z] = mapPercentToLocal(wp.mapPosition);
    teleportRef.current(x, z);
  };

  const currentTourStop = tourActive ? tourWaypoints[tourIndex] : null;

  return (
    <div className="relative h-[min(80vh,720px)] w-full overflow-hidden rounded-xl border border-zinc-700 bg-black">
      <Canvas shadows camera={{ fov: 70, position: [0, 1.7, 0] }}>
        <Suspense fallback={null}>
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
          />
        </Suspense>
      </Canvas>

      <WalkthroughHUD
        mode={mode}
        onModeChange={setMode}
        locked={locked}
        nearPoi={nearPoi}
        tourActive={tourActive}
        tourIndex={tourIndex}
        tourTotal={tourWaypoints.length}
        currentTourStop={currentTourStop}
        onStartTour={startTour}
        onNextTourStop={nextTourStop}
        onStopTour={() => setTourActive(false)}
        tier={tier}
      />
    </div>
  );
}
