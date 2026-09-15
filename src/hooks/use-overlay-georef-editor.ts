"use client";

import { useCallback, useEffect, useState } from "react";
import {
  boundsToCoordinates,
  clearOverlayOverride,
  coordinatesToBounds,
  exportGeorefJsonSnippet,
  getDefaultOverlayGeoref,
  getEffectiveOverlayGeoref,
  loadOverlayOverride,
  saveOverlayOverride,
  scaleCoordinates,
  setBoundsWithAspect,
  translateCoordinates,
  type GeorefBounds,
  type OverlayCoordinates,
  type OverlayGeorefOverride,
} from "@/lib/overlay-georef";

export function useOverlayGeorefEditor(autoSave = true) {
  const [state, setState] = useState<OverlayGeorefOverride>(() => getDefaultOverlayGeoref());
  const [lockAspect, setLockAspect] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(getEffectiveOverlayGeoref());
    setHydrated(true);
  }, []);

  const persist = useCallback(
    (next: OverlayGeorefOverride) => {
      if (autoSave) saveOverlayOverride(next);
    },
    [autoSave]
  );

  const setOpacity = useCallback(
    (opacity: number) => {
      setState((prev) => {
        const next = { ...prev, opacity: Math.min(1, Math.max(0, opacity)) };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const setCoordinates = useCallback(
    (coordinates: OverlayCoordinates) => {
      setState((prev) => {
        const next = {
          ...prev,
          coordinates,
          bounds: coordinatesToBounds(coordinates),
        };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const updateBounds = useCallback(
    (patch: Partial<GeorefBounds>) => {
      setState((prev) => {
        const nextBounds = setBoundsWithAspect(prev.bounds, patch, lockAspect);
        const next = {
          ...prev,
          bounds: nextBounds,
          coordinates: boundsToCoordinates(nextBounds),
        };
        persist(next);
        return next;
      });
    },
    [lockAspect, persist]
  );

  const nudge = useCallback(
    (dLng: number, dLat: number) => {
      setState((prev) => {
        const coordinates = translateCoordinates(prev.coordinates, dLng, dLat);
        const next = {
          ...prev,
          coordinates,
          bounds: coordinatesToBounds(coordinates),
        };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const scale = useCallback(
    (factor: number) => {
      setState((prev) => {
        const coordinates = scaleCoordinates(prev.coordinates, factor);
        const next = {
          ...prev,
          coordinates,
          bounds: coordinatesToBounds(coordinates),
        };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const saveNow = useCallback(() => {
    saveOverlayOverride(state);
  }, [state]);

  const reset = useCallback(() => {
    clearOverlayOverride();
    const defaults = getDefaultOverlayGeoref();
    setState(defaults);
  }, []);

  const copyJson = useCallback(async () => {
    await navigator.clipboard.writeText(exportGeorefJsonSnippet(state));
  }, [state]);

  return {
    state,
    hydrated,
    lockAspect,
    setLockAspect,
    setOpacity,
    setCoordinates,
    updateBounds,
    nudge,
    scale,
    saveNow,
    reset,
    copyJson,
    reload: () => setState(loadOverlayOverride() ?? getEffectiveOverlayGeoref()),
  };
}
