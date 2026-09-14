# LTL 2026 — Unreal Engine Virtual Walkthrough

Full photoreal walkthrough of Louder Than Life 2026 at Kentucky Expo Center using **Unreal Engine 5.8** + **Cesium for Unreal** + open geospatial data.

## Why Unreal?

The web walkthrough (`/walkthrough`) gives first-person navigation on the official festival map and Esri satellite tiles. Unreal adds:

- True-scale terrain and buildings (Cesium 3D Tiles / OSM)
- Photoreal lighting and materials
- VR support for pre-festival exploration
- Pixel Streaming to embed in the website later

## Prerequisites

- Unreal Engine 5.8 (`G:\UE_5.8` on this machine)
- [Cesium for Unreal](https://cesium.com/platform/cesium-for-unreal/) plugin
- Free [Cesium ion](https://ion.cesium.com/) account (terrain + OSM buildings)

## Quick start

1. **Export POIs from this repo**
   ```bash
   npm run export:unreal
   ```
   Output: `data/export/ltl-pois-wgs84.geojson`

2. **Create UE project**
   - New Blank project → `LTL2026` → no starter content (or Third Person for walk mode)
   - Enable **Cesium for Unreal** plugin
   - Restart editor

3. **Georeference the level**
   - Add **CesiumGeoreference** actor
   - Set origin to Louisville KEC: `38.1969, -85.7416, 0`
   - Add **Cesium3DTileset** → Cesium ion → `Cesium World Terrain`
   - Add **Cesium3DTileset** → `Cesium OSM Buildings` (or Google Photorealistic 3D Tiles)

4. **Import festival POIs**
   - Use [GeoJSON Blueprint library](https://github.com/connor-js/georeferenced-actor-spawner) or manual placement
   - Load `data/export/ltl-pois-wgs84.geojson`
   - Spawn billboard actors at each stage / VIP entrance / zone

5. **Overlay official festival map**
   - Import `assets/maps/ltl-2026-official-amenity-map.png` as texture
   - Create flat mesh aligned to georef bounds:
     - West: -85.752, East: -85.728
     - North: 38.204, South: 38.188
   - Use Cesium **CesiumCartographicPolygon** or manual placement at ~0–2m height above terrain

6. **VIP zones**
   - Green translucent volume = VIP area (map center ~75%, 42%)
   - Red volume = Angel's Envy Top Shelf (east ~92%, 30%)

## Open data sources

| Source | Use |
|--------|-----|
| Cesium World Terrain | Ground elevation |
| Cesium OSM Buildings | Expo center context |
| Esri World Imagery | Satellite (same as web walkthrough) |
| OpenStreetMap / Overpass | Parking lots, roads, Phillips Lane |
| `data/georef.json` | Bounds + scale from this repo |

## Overpass query (roads / parking near KEC)

```
[out:json][timeout:25];
(
  way(around:800,38.1969,-85.7416)["highway"];
  way(around:800,38.1969,-85.7416)["amenity"="parking"];
);
out body;
>;
out skel qt;
```

Export as GeoJSON → Blender cleanup → FBX → UE.

## Suggested player setup

- Third Person or First Person template
- `CharacterMovement` walk speed ~600 uu/s
- Collision on terrain + simplified stage blockout meshes
- Level Sequence for **Guided VIP Tour** matching web tour IDs in `src/lib/walkthrough-pois.ts`

## Pixel Streaming (optional)

Host UE build on GPU VM → embed in Next.js via iframe for public site.

## Sync with web app

When festival map updates:

1. Replace `assets/maps/ltl-2026-official-amenity-map.png`
2. Update `data/*.json` map positions
3. Re-run `npm run export:unreal`
4. Re-import GeoJSON in UE
