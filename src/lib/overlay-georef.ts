import georefData from "../../data/georef.json";
import type { MapPosition } from "./georef";
import { FESTIVAL_MAP_ASPECT } from "./festival-map";

/** MapLibre image source corners: NW, NE, SE, SW */
export type OverlayCoordinates = [
  [number, number],
  [number, number],
  [number, number],
  [number, number],
];

export type GeorefBounds = {
  west: number;
  east: number;
  north: number;
  south: number;
};

export type OverlayGeorefOverride = {
  bounds: GeorefBounds;
  coordinates: OverlayCoordinates;
  opacity?: number;
  updatedAt?: string;
};

/** @deprecated Legacy key — placement overrides migrated away; opacity only now */
export const OVERLAY_STORAGE_KEY = "ltl26-overlay-georef";
export const OVERLAY_OPACITY_KEY = "ltl26-overlay-opacity";
export const MAP_IMAGE_ASPECT = FESTIVAL_MAP_ASPECT;

/** Set NEXT_PUBLIC_OVERLAY_ADMIN=true locally to access /overlay aligner. */
export function isOverlayAdminEnabled(): boolean {
  return process.env.NEXT_PUBLIC_OVERLAY_ADMIN === "true";
}

const defaultBounds = georefData.bounds as GeorefBounds;

function readPublishedFromFile(): OverlayGeorefOverride {
  const fileOverlay = georefData.overlay as
    | { coordinates?: OverlayCoordinates; opacity?: number }
    | undefined;
  const coordinates =
    fileOverlay?.coordinates && isValidCoordinates(fileOverlay.coordinates)
      ? fileOverlay.coordinates
      : boundsToCoordinates(defaultBounds);
  return {
    bounds: { ...defaultBounds },
    coordinates,
    opacity: fileOverlay?.opacity ?? 0.72,
  };
}

export function boundsToCoordinates(b: GeorefBounds): OverlayCoordinates {
  return [
    [b.west, b.north],
    [b.east, b.north],
    [b.east, b.south],
    [b.west, b.south],
  ];
}

export function coordinatesToBounds(c: OverlayCoordinates): GeorefBounds {
  const lngs = c.map(([lng]) => lng);
  const lats = c.map(([, lat]) => lat);
  return {
    west: Math.min(...lngs),
    east: Math.max(...lngs),
    north: Math.max(...lats),
    south: Math.min(...lats),
  };
}

/** Committed alignment in data/georef.json — same for all users after deploy. */
export function getPublishedOverlayGeoref(): OverlayGeorefOverride {
  return readPublishedFromFile();
}

/** @alias getPublishedOverlayGeoref */
export function getDefaultOverlayGeoref(): OverlayGeorefOverride {
  return getPublishedOverlayGeoref();
}

function isValidCoordinates(value: unknown): value is OverlayCoordinates {
  if (!Array.isArray(value) || value.length !== 4) return false;
  return value.every(
    (p) =>
      Array.isArray(p) &&
      p.length === 2 &&
      Number.isFinite(p[0]) &&
      Number.isFinite(p[1])
  );
}

function isValidBounds(b: GeorefBounds): boolean {
  return (
    Number.isFinite(b.west) &&
    Number.isFinite(b.east) &&
    Number.isFinite(b.north) &&
    Number.isFinite(b.south) &&
    b.east > b.west &&
    b.north > b.south
  );
}

function migrateLegacyOverlayStorage(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(OVERLAY_STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw) as OverlayGeorefOverride;
    if (data.opacity != null && localStorage.getItem(OVERLAY_OPACITY_KEY) == null) {
      localStorage.setItem(OVERLAY_OPACITY_KEY, String(data.opacity));
    }
    localStorage.removeItem(OVERLAY_STORAGE_KEY);
  } catch {
    localStorage.removeItem(OVERLAY_STORAGE_KEY);
  }
}

export function loadUserOpacity(): number | null {
  if (typeof window === "undefined") return null;
  migrateLegacyOverlayStorage();
  const raw = localStorage.getItem(OVERLAY_OPACITY_KEY);
  if (raw == null) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : null;
}

export function saveUserOpacity(opacity: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    OVERLAY_OPACITY_KEY,
    String(Math.min(1, Math.max(0, opacity)))
  );
}

export function clearUserOpacity(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(OVERLAY_OPACITY_KEY);
}

/** @deprecated Placement is no longer stored client-side */
export function loadOverlayOverride(): OverlayGeorefOverride | null {
  migrateLegacyOverlayStorage();
  return null;
}

/** Persists opacity only (placement comes from georef.json). */
export function saveOverlayOverride(data: OverlayGeorefOverride): void {
  if (data.opacity != null) saveUserOpacity(data.opacity);
}

export function clearOverlayOverride(): void {
  clearUserOpacity();
  if (typeof window !== "undefined") {
    localStorage.removeItem(OVERLAY_STORAGE_KEY);
  }
}

/** Published placement + optional per-user opacity preference. */
export function getEffectiveOverlayGeoref(): OverlayGeorefOverride {
  const published = getPublishedOverlayGeoref();
  if (typeof window === "undefined") return published;
  const userOpacity = loadUserOpacity();
  if (userOpacity == null) return published;
  return { ...published, opacity: userOpacity };
}

export function mapPercentToLatLngWithBounds(
  pos: MapPosition,
  b: GeorefBounds
): { lat: number; lng: number } {
  const lng = b.west + (pos.x / 100) * (b.east - b.west);
  const lat = b.north - (pos.y / 100) * (b.north - b.south);
  return { lat, lng };
}

/** Shift all corners by delta lng/lat */
export function translateCoordinates(
  coords: OverlayCoordinates,
  dLng: number,
  dLat: number
): OverlayCoordinates {
  return coords.map(([lng, lat]) => [lng + dLng, lat + dLat]) as OverlayCoordinates;
}

/** Scale corners around center (uniform) */
export function scaleCoordinates(
  coords: OverlayCoordinates,
  factor: number
): OverlayCoordinates {
  const b = coordinatesToBounds(coords);
  const cLng = (b.west + b.east) / 2;
  const cLat = (b.north + b.south) / 2;
  return coords.map(([lng, lat]) => [
    cLng + (lng - cLng) * factor,
    cLat + (lat - cLat) * factor,
  ]) as OverlayCoordinates;
}

/**
 * Adjust east/west span while keeping center; optionally lock PNG aspect on the ground.
 */
export function setBoundsWithAspect(
  b: GeorefBounds,
  next: Partial<GeorefBounds>,
  lockAspect: boolean
): GeorefBounds {
  let west = next.west ?? b.west;
  let east = next.east ?? b.east;
  let north = next.north ?? b.north;
  let south = next.south ?? b.south;

  if (lockAspect) {
    const cLng = (west + east) / 2;
    const cLat = (north + south) / 2;
    const lngSpan = east - west;
    const latSpan = north - south;
    const centerLat = cLat * (Math.PI / 180);
    const metersPerLng = 111320 * Math.cos(centerLat);
    const metersPerLat = 110540;
    const widthM = lngSpan * metersPerLng;
    const heightM = latSpan * metersPerLat;
    const currentAspect = widthM / Math.max(heightM, 1);

    if (next.east !== undefined || next.west !== undefined) {
      const targetHeightM = widthM / MAP_IMAGE_ASPECT;
      const newLatSpan = targetHeightM / metersPerLat;
      north = cLat + newLatSpan / 2;
      south = cLat - newLatSpan / 2;
    } else if (next.north !== undefined || next.south !== undefined) {
      const targetWidthM = heightM * MAP_IMAGE_ASPECT;
      const newLngSpan = targetWidthM / metersPerLng;
      west = cLng - newLngSpan / 2;
      east = cLng + newLngSpan / 2;
    } else if (Math.abs(currentAspect - MAP_IMAGE_ASPECT) > 0.05) {
      const targetHeightM = widthM / MAP_IMAGE_ASPECT;
      const newLatSpan = targetHeightM / metersPerLat;
      north = cLat + newLatSpan / 2;
      south = cLat - newLatSpan / 2;
    }
  }

  return { west, east, north, south };
}

/** Centroid of the four MapLibre image corners */
export function getCoordinatesCenter(coords: OverlayCoordinates): [number, number] {
  const lng = coords.reduce((sum, [x]) => sum + x, 0) / 4;
  const lat = coords.reduce((sum, [, y]) => sum + y, 0) / 4;
  return [lng, lat];
}

/** Midpoint of edge: 0=N (NW–NE), 1=E, 2=S, 3=W */
export function getEdgeMidpoint(
  coords: OverlayCoordinates,
  edge: 0 | 1 | 2 | 3
): [number, number] {
  const a = edge;
  const b = (edge + 1) % 4;
  return [(coords[a][0] + coords[b][0]) / 2, (coords[a][1] + coords[b][1]) / 2];
}

/** Rotate all corners around center (small-area lng/lat approximation). */
export function rotateCoordinatesAroundCenter(
  coords: OverlayCoordinates,
  deltaDeg: number,
  center?: [number, number]
): OverlayCoordinates {
  const [cLng, cLat] = center ?? getCoordinatesCenter(coords);
  const rad = (deltaDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return coords.map(([lng, lat]) => {
    const dx = lng - cLng;
    const dy = lat - cLat;
    return [cLng + dx * cos - dy * sin, cLat + dx * sin + dy * cos];
  }) as OverlayCoordinates;
}

/** Ray-cast point-in-quad test (lng/lat treated as planar). */
export function pointInQuad(lng: number, lat: number, coords: OverlayCoordinates): boolean {
  let inside = false;
  for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
    const [xi, yi] = coords[i];
    const [xj, yj] = coords[j];
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function coordinatesToFrameGeoJson(
  coords: OverlayCoordinates
): GeoJSON.Feature<GeoJSON.Polygon> {
  const ring = coords.map(([lng, lat]) => [lng, lat] as [number, number]);
  ring.push(ring[0]);
  return {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [ring] },
    properties: {},
  };
}

export function exportGeorefJsonSnippet(data: OverlayGeorefOverride): string {
  return JSON.stringify(
    {
      bounds: data.bounds,
      overlay: {
        coordinates: data.coordinates,
        opacity: data.opacity ?? 0.72,
      },
    },
    null,
    2
  );
}
