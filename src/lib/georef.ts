import georef from "../../data/georef.json";

export type MapPosition = { x: number; y: number };

const { bounds, festivalMapPlane } = georef;

/** Map percent (0-100) → local Three.js X/Z on festival ground plane */
export function mapPercentToLocal(pos: MapPosition): [number, number] {
  const x =
    (pos.x / 100) * festivalMapPlane.widthMeters -
    festivalMapPlane.widthMeters / 2;
  const z =
    (pos.y / 100) * festivalMapPlane.depthMeters -
    festivalMapPlane.depthMeters / 2;
  return [x, z];
}

/** Map percent → WGS84 lat/lng (approximate, linear within bounds) */
export function mapPercentToLatLng(pos: MapPosition): { lat: number; lng: number } {
  const lng =
    bounds.west + (pos.x / 100) * (bounds.east - bounds.west);
  const lat =
    bounds.north - (pos.y / 100) * (bounds.north - bounds.south);
  return { lat, lng };
}

/** WGS84 → local X/Z on festival plane (inverse linear) */
export function isLatLngInBounds(lat: number, lng: number): boolean {
  return (
    lat >= bounds.south &&
    lat <= bounds.north &&
    lng >= bounds.west &&
    lng <= bounds.east
  );
}

export function latLngToLocal(lat: number, lng: number): [number, number] {
  const xPct =
    ((lng - bounds.west) / (bounds.east - bounds.west)) * 100;
  const yPct =
    ((bounds.north - lat) / (bounds.north - bounds.south)) * 100;
  return mapPercentToLocal({ x: xPct, y: yPct });
}

export function latLngToTile(lat: number, lng: number, zoom: number) {
  const n = 2 ** zoom;
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x, y };
}

export { georef };
