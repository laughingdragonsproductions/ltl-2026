"use client";

import { useEffect, useRef } from "react";
import { compassHeadingToCameraYaw } from "./use-walkthrough-gps";

/** iOS 13+ may require a user gesture before DeviceOrientation fires. */
export function useDeviceCompass(enabled: boolean) {
  const yawRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      yawRef.current = null;
      return;
    }

    const onOrientation = (e: DeviceOrientationEvent) => {
      const ext = e as DeviceOrientationEvent & { webkitCompassHeading?: number };
      const heading =
        ext.webkitCompassHeading ??
        (e.alpha != null ? 360 - e.alpha : null);
      if (heading == null || Number.isNaN(heading)) return;
      yawRef.current = compassHeadingToCameraYaw(heading);
    };

    window.addEventListener("deviceorientation", onOrientation, true);
    return () => window.removeEventListener("deviceorientation", onOrientation, true);
  }, [enabled]);

  return yawRef;
}
