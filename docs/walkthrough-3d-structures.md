# 3D walk — structures from video & photos

Goal: when you WASD through `/walkthrough`, **real festival geometry** (stages, tents, VIP deck, expo halls) sits on the map plane — not just flat JPG + pin cylinders.

## Feature flag

The 3D walk is **hidden from the public site** until you flip the flag:

| Environment | `NEXT_PUBLIC_WALKTHROUGH_ENABLED` |
|-------------|-----------------------------------|
| Production / Vercel | `false` or unset — `/walkthrough` redirects to `/map`, no nav links |
| Local prototype | `true` in `.env.local` |

Unlock copy on the live site does **not** mention 3D walk until you re-enable and update `src/lib/unlock-copy.ts`.

## What exists now

| Piece | Location |
|-------|----------|
| Structure definitions | `data/walkthrough-structures.json` |
| Renderers | `src/components/walkthrough/FestivalStructures.tsx` |
| Drone reference | `assets/walkthrough/reference/drone-load-in-2026.png` |
| Blender models (glTF) | `public/walkthrough/models/*.glb` |
| Stage positions | `data/stages.json` → linked via `stageId` |

**Procedural types:** `main-stage`, `secondary-stage`, `tent-stage`, `vip-deck`, `expo-hall`, `tent-row`

**Blender type:** `gltf` — loads a `.glb` from `public/walkthrough/models/`

Stages with a 3D structure **replace** the old cylinder POI markers.

## Blender graybox → glTF workflow

Best balance of speed vs. fidelity for matching the drone load-in layout.

### 1. Reference

- Drone photo: `assets/walkthrough/reference/drone-load-in-2026.png`
- TikTok / walk clips → frames:

```bash
npm run walk:frames -- path/to/video.mp4 main-stages 0.5
```

Outputs to `assets/walkthrough/reference/frames/<name>/`.

### 2. Block out in Blender

- New scene, units = **meters**
- Add drone photo as **Background Reference** or a floor-aligned plane (top-down)
- Model with cubes/planes only: black stage frames, white peaked tents, VIP multi-level deck, tan expo blocks
- **Origin** at ground center of the object; stage front faces **+Y** (adjust with `rotationY` in JSON)
- Export each structure as **glTF Binary (`.glb`)** — **Apply transforms**, **Y-up**

### 3. Drop models in repo

```
public/walkthrough/models/louder-stage.glb
public/walkthrough/models/impact-tent.glb
public/walkthrough/models/vip-deck.glb
...
```

### 4. Place via JSON

Swap a procedural entry for `gltf` (or add a new id) in `data/walkthrough-structures.json`:

```json
{
  "id": "louder-stage",
  "name": "Louder Stage",
  "type": "gltf",
  "modelUrl": "/walkthrough/models/louder-stage.glb",
  "mapPosition": { "x": 82, "y": 28 },
  "rotationY": 2.35,
  "scale": 1,
  "labelHeight": 18,
  "stageId": "louder"
}
```

| Field | Notes |
|-------|-------|
| `modelUrl` | Path under `public/` |
| `scale` | Uniform scale (default `1`) |
| `labelHeight` | Float label when model bounds unknown |
| `mapPosition` / `rotationY` | Same as procedural types |

Keep procedural types as fallback until each structure has a `.glb`.

### 5. Tune locally

1. Set `NEXT_PUBLIC_WALKTHROUGH_ENABLED=true` in `.env.local`
2. Walk to the structure in `/walkthrough`
3. Compare to drone / TikTok frame
4. Adjust `mapPosition`, `rotationY`, `scale` in JSON only — no re-export unless the mesh shape is wrong

### Blender export checklist

- [ ] Scene units = meters
- [ ] Origin at ground center
- [ ] Front faces +Y
- [ ] Apply scale / rotation before export
- [ ] Format: glTF Binary (`.glb`)
- [ ] No cameras / lights required (scene lighting is in-app)

### Priority build order (matches drone image)

1. Twin **main stages** (Louder + Life)
2. **Impact** peaked tent
3. **VIP viewing deck**
4. **Expo hall** backdrop
5. **Vendor tent rows**
6. Optional: distant **coaster** silhouettes at map edge

## Workflow: TikTok / walk videos → procedural tuning

Use procedural types first for layout, then replace with glTF when the Blender blockout is ready.

### Measure & tune in JSON

Edit `data/walkthrough-structures.json`:

- **`mapPosition`** — same 0–100 coords as map pins (`data/stages.json`)
- **`rotationY`** — radians; which way the stage **faces the crowd**
- **`width` / `depth` / `height`** — meters on the festival plane (1200×900 m) — procedural only
- **`notes`** — what video/frame you used

Teleport in walk mode to the stage POI and compare silhouette to your frame.

### Add new procedural types (optional)

Extend `ProceduralStructureType` in `walkthrough-structures.ts` and add a mesh builder in `FestivalStructures.tsx`.

### Future: photo-textured facades

Drop a cropped stage front PNG in `public/walkthrough/textures/` and apply as `meshStandardMaterial.map` on the back wall mesh.

## Quick test

1. `NEXT_PUBLIC_WALKTHROUGH_ENABLED=true` in `.env.local`
2. Unlock via `NEXT_PUBLIC_DEV_UNLOCK=true` or test payment
3. Open `/walkthrough` — **Festival map** mode (not satellite)
4. WASD toward **Louder / Life** (east) — stages fill the view
5. Drop a test cube `.glb` at Louder coords; verify rotation / scale
6. North toward **Impact** — white peaked tent
7. West — **Decibel / Reverb** + vendor tent row

## Video sources to prioritize

- Load-in / drone (layout, scale) — ✅ drone reference saved
- Ground-level walk toward main stage (height, speaker stack placement)
- Impact tent interior/exterior (peaked roof proportions)
- VIP deck / hospitality (multi-level white structure)

Paste TikTok URLs into `data/walkthrough-structures.json` → `referenceVideos[]`.
