/** Official LTL 2026 fest map — 1920×1080 JPG (replaces low-res amenity PNG). */
export const FESTIVAL_MAP_SRC = "/maps/LTL26_FestMap_1920x1080.jpg";
export const FESTIVAL_MAP_WIDTH = 1920;
export const FESTIVAL_MAP_HEIGHT = 1080;
export const FESTIVAL_MAP_ASPECT = FESTIVAL_MAP_WIDTH / FESTIVAL_MAP_HEIGHT;

/**
 * Pin x/y in data JSON are 0–100 on the map artwork only (right side of the JPG).
 * The full image includes legend panels on the left — map pins through this inset.
 */
export const FESTIVAL_MAP_PIN_BOUNDS = {
  left: 640 / FESTIVAL_MAP_WIDTH,
  top: 88 / FESTIVAL_MAP_HEIGHT,
  width: (1905 - 640) / FESTIVAL_MAP_WIDTH,
  height: (1005 - 88) / FESTIVAL_MAP_HEIGHT,
} as const;

/** Map-art percent → CSS % on the full fest map image. */
export function mapPinPercentToImage(x: number, y: number): { left: number; top: number } {
  const b = FESTIVAL_MAP_PIN_BOUNDS;
  return {
    left: (b.left + (x / 100) * b.width) * 100,
    top: (b.top + (y / 100) * b.height) * 100,
  };
}
