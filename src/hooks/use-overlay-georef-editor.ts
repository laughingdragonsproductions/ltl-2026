"use client";

import { useCallback, useEffect, useState } from "react";
import {
  boundsToCoordinates,
  clearUserOpacity,
  coordinatesToBounds,
  exportGeorefJsonSnippet,
  getEffectiveOverlayGeoref,
  getPublishedOverlayGeoref,
  saveUserOpacity,
  scaleCoordinates,
  setBoundsWithAspect,
  translateCoordinates,
  type GeorefBounds,
  type OverlayCoordinates,
  type OverlayGeorefOverride,
} from "@/lib/overlay-georef";

type OverlayGeorefEditorOptions = {
  /** Save opacity slider to localStorage (live GPS view). Placement never persists. */
  persistOpacity?: boolean;
};

export function useOverlayGeorefEditor(options: OverlayGeorefEditorOptions = {}) {
  const persistOpacity = options.persistOpacity ?? false;
  const [state, setState] = useState<OverlayGeorefOverride>(() =>
    getPublishedOverlayGeoref()
  );
  const [lockAspect, setLockAspect] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(getEffectiveOverlayGeoref());
    setHydrated(true);
  }, []);

  const persistOpacityOnly = useCallback(
    (opacity: number) => {
      if (persistOpacity) saveUserOpacity(opacity);
    },
    [persistOpacity]
  );

  const setOpacity = useCallback(
    (opacity: number) => {
      setState((prev) => {
        const clamped = Math.min(1, Math.max(0, opacity));
        persistOpacityOnly(clamped);
        return { ...prev, opacity: clamped };
      });
    },
    [persistOpacityOnly]
  );

  const setCoordinates = useCallback((coordinates: OverlayCoordinates) => {
    setState((prev) => ({
      ...prev,
      coordinates,
      bounds: coordinatesToBounds(coordinates),
    }));
  }, []);

  const updateBounds = useCallback(
    (patch: Partial<GeorefBounds>) => {
      setState((prev) => {
        const nextBounds = setBoundsWithAspect(prev.bounds, patch, lockAspect);
        return {
          ...prev,
          bounds: nextBounds,
          coordinates: boundsToCoordinates(nextBounds),
        };
      });
    },
    [lockAspect]
  );

  const nudge = useCallback((dLng: number, dLat: number) => {
    setState((prev) => {
      const coordinates = translateCoordinates(prev.coordinates, dLng, dLat);
      return {
        ...prev,
        coordinates,
        bounds: coordinatesToBounds(coordinates),
      };
    });
  }, []);

  const scale = useCallback((factor: number) => {
    setState((prev) => {
      const coordinates = scaleCoordinates(prev.coordinates, factor);
      return {
        ...prev,
        coordinates,
        bounds: coordinatesToBounds(coordinates),
      };
    });
  }, []);

  const saveNow = useCallback(() => {
    if (state.opacity != null) persistOpacityOnly(state.opacity);
  }, [state.opacity, persistOpacityOnly]);

  const reset = useCallback(() => {
    clearUserOpacity();
    setState(getPublishedOverlayGeoref());
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
    reload: () => setState(getEffectiveOverlayGeoref()),
  };
}
