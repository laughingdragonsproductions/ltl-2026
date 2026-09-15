"use client";

import { useCallback, type MutableRefObject } from "react";
import {
  boundsToCoordinates,
  getDefaultOverlayGeoref,
  scaleCoordinates,
  setBoundsWithAspect,
  translateCoordinates,
  coordinatesToBounds,
  type GeorefBounds,
  type OverlayCoordinates,
} from "@/lib/overlay-georef";

type SyncOpts = {
  coordinates: OverlayCoordinates;
  opacity: number;
  showFestivalOverlay?: boolean;
  basemap?: "streets" | "satellite";
  geojson?: GeoJSON.FeatureCollection;
};

/** Push coordinate changes to MapLibre immediately, then persist in React/localStorage. */
export function useOverlayLiveControls(
  syncOptsRef: MutableRefObject<SyncOpts>,
  pushToMap: () => void,
  lockAspect: boolean,
  {
    setCoordinates,
    reset,
  }: {
    setCoordinates: (coords: OverlayCoordinates) => void;
    reset: () => void;
  }
) {
  const applyCoords = useCallback(
    (next: OverlayCoordinates) => {
      syncOptsRef.current = { ...syncOptsRef.current, coordinates: next };
      pushToMap();
      setCoordinates(next);
    },
    [syncOptsRef, pushToMap, setCoordinates]
  );

  const handleNudge = useCallback(
    (dLng: number, dLat: number) => {
      applyCoords(translateCoordinates(syncOptsRef.current.coordinates, dLng, dLat));
    },
    [applyCoords, syncOptsRef]
  );

  const handleScale = useCallback(
    (factor: number) => {
      applyCoords(scaleCoordinates(syncOptsRef.current.coordinates, factor));
    },
    [applyCoords, syncOptsRef]
  );

  const handleBoundsChange = useCallback(
    (patch: Partial<GeorefBounds>) => {
      const currentBounds = coordinatesToBounds(syncOptsRef.current.coordinates);
      const nextBounds = setBoundsWithAspect(currentBounds, patch, lockAspect);
      applyCoords(boundsToCoordinates(nextBounds));
    },
    [applyCoords, lockAspect, syncOptsRef]
  );

  const handleReset = useCallback(() => {
    const defaults = getDefaultOverlayGeoref();
    syncOptsRef.current = {
      ...syncOptsRef.current,
      coordinates: defaults.coordinates,
      opacity: defaults.opacity ?? 0.72,
    };
    pushToMap();
    reset();
  }, [syncOptsRef, pushToMap, reset]);

  return { handleNudge, handleScale, handleBoundsChange, handleReset };
}
