# Overlay freeform mapper

HotspotMapper-style box editing for the GPS amenity overlay on MapLibre satellite imagery.

## Origin

The interaction model comes from **HotspotMapper** (Laughing Dragons / them1947.com dashboard art tool). It is vendored for reference:

```bash
npm run overlay:mapper
```

Output: `public/vendor/hotspot-mapper/` (JS, CSS, README from upstream).

The live LTL26 integration is **`src/hooks/use-overlay-freeform-mapper.ts`** — same UX adapted to WGS84 quad corners instead of CSS percentages.

## Where to use

| Route | Mode |
|-------|------|
| `/overlay` | Tap **Adjust placement** |
| `/overlay/adjust` | Always on (full-screen admin) |

## Handles (HotspotMapper parity)

| Handle | Color | Action |
|--------|-------|--------|
| **NW / NE / SE / SW** | Green | Free-form corner — independent lat/lng |
| **✥ center** | Cyan | Drag whole overlay (like box body drag) |
| **↻ rotate** | Gold | Rotate quad around center; **Shift** = 15° snap |
| **Edge dots** | Green dim | Drag one side (both corners on that edge move) |
| **Inside quad** | — | Click/drag anywhere inside the dashed frame to pan |

## Workflow

1. Set opacity ~40–60% to see satellite + PNG together.
2. Drag corners/edges until stages and roads align.
3. Use **↻** if the PNG needs a slight rotation on the ground.
4. **Copy georef JSON** → paste `bounds` + `overlay` into `data/georef.json`.
5. Commit and deploy for all users.

Browser-only tweaks persist in `localStorage` key `ltl26-overlay-georef`.

## Data format

MapLibre image source corners (NW, NE, SE, SW):

```json
{
  "overlay": {
    "coordinates": [
      [-85.752, 38.204],
      [-85.728, 38.204],
      [-85.728, 38.188],
      [-85.752, 38.188]
    ],
    "opacity": 0.72
  }
}
```

Four corners support **affine skew** (trapezoid) — enough for flat festival grounds. Full rubber-sheet warping would need a different renderer.
