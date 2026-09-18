"use client";

import { useEffect, useRef, useState } from "react";
import { georef, isLatLngInBounds, latLngToLocal } from "@/lib/georef";

export type GpsWalkStatus =
  | "off"
  | "acquiring"
  | "active"
  | "denied"
  | "out-of-bounds"
  | "unsupported";

export type GpsWalkUpdate = {
  local: [number, number];
  /** Radians, null if unknown */
  heading: number | null;
  accuracyM: number;
  speedMps: number;
};

export function useWalkthroughGps(
  follow: boolean,
  onFirstFix?: (update: GpsWalkUpdate) => void
) {
  const targetRef = useRef<GpsWalkUpdate | null>(null);
  const onFirstFixRef = useRef(onFirstFix);
  onFirstFixRef.current = onFirstFix;
  const [status, setStatus] = useState<GpsWalkStatus>("off");
  const [snapshot, setSnapshot] = useState<GpsWalkUpdate | null>(null);
  const firstFixSent = useRef(false);

  useEffect(() => {
    firstFixSent.current = false;
    if (!follow) {
      targetRef.current = null;
      setSnapshot(null);
      setStatus("off");
      return;
    }

    if (!navigator.geolocation) {
      setStatus("unsupported");
      return;
    }

    setStatus("acquiring");

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy, heading, speed } = pos.coords;

        if (!isLatLngInBounds(lat, lng)) {
          setStatus("out-of-bounds");
          return;
        }

        const local = latLngToLocal(lat, lng);
        const headingRad =
          heading != null && !Number.isNaN(heading)
            ? (heading * Math.PI) / 180
            : null;
        const speedMps = speed != null && !Number.isNaN(speed) ? speed : 0;

        const update: GpsWalkUpdate = {
          local,
          heading: headingRad,
          accuracyM: accuracy,
          speedMps,
        };
        targetRef.current = update;
        setSnapshot(update);
        setStatus("active");

        if (!firstFixSent.current) {
          firstFixSent.current = true;
          onFirstFixRef.current?.(update);
        }
      },
      () => setStatus("denied"),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [follow]);

  return { gpsTargetRef: targetRef, gpsStatus: status, gpsSnapshot: snapshot };
}

/** Spawn near festival center when GPS unavailable */
export function getDefaultSpawnLocal(): [number, number] {
  return latLngToLocal(georef.venue.center.lat, georef.venue.center.lng);
}

/** Device heading (compass) → camera yaw on festival plane */
export function compassHeadingToCameraYaw(headingDeg: number): number {
  return -((headingDeg * Math.PI) / 180) + Math.PI / 2;
}
