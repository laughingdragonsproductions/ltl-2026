import type { GeoJSONSource, ImageSource, Map } from "maplibre-gl";
import type { OverlayCoordinates } from "./overlay-georef";

export function syncOverlayMap(
  map: Map,
  opts: {
    coordinates: OverlayCoordinates;
    opacity: number;
    showFestivalOverlay?: boolean;
    basemap?: "streets" | "satellite";
    geojson?: GeoJSON.FeatureCollection;
  }
): boolean {
  try {
    const src = map.getSource("festivalMap") as ImageSource | undefined;
    if (!src) return false;
    src.setCoordinates(opts.coordinates);

    if (map.getLayer("festival-overlay")) {
      map.setPaintProperty(
        "festival-overlay",
        "raster-opacity",
        opts.showFestivalOverlay === false ? 0 : opts.opacity
      );
    }

    if (opts.basemap && map.getLayer("basemap-streets") && map.getLayer("basemap-satellite")) {
      map.setLayoutProperty(
        "basemap-streets",
        "visibility",
        opts.basemap === "streets" ? "visible" : "none"
      );
      map.setLayoutProperty(
        "basemap-satellite",
        "visibility",
        opts.basemap === "satellite" ? "visible" : "none"
      );
    }

    if (opts.geojson) {
      (map.getSource("pois") as GeoJSONSource | undefined)?.setData(opts.geojson);
    }

    return true;
  } catch (err) {
    console.error("syncOverlayMap failed:", err);
    return false;
  }
}
