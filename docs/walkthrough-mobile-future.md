# 3D walk — mobile & GPS follow (future)

**Context:** Most users will be on phones at the event. Today `/walkthrough` is desktop-only (WASD + pointer lock). The free **`/overlay`** route is the mobile “where am I / what’s near me” experience. This doc captures a future path if we bring 3D walk to phones.

## Goals

1. **On-screen controls** — walk and look without keyboard/mouse.
2. **GPS follow** — optional mode: spawn camera from device location and update as the user moves on the grounds.
3. **Nearby POIs** — reuse existing proximity logic (~35 m) once camera position comes from GPS.

## Current state

| Piece | Status |
|-------|--------|
| `latLngToLocal()` in `src/lib/georef.ts` | ✅ GPS → 3D plane coords (unused in walkthrough) |
| POI proximity in `WalkthroughWorld.tsx` | ✅ Works from camera `[x, z]` |
| Geolocation pattern | ✅ `VirtualOverlayMap.tsx` (`watchPosition`, “Center on me”) |
| Mobile gate | ❌ `WalkthroughLoader.tsx` blocks coarse pointer / ≤768px |
| Device compass / heading | ❌ Not implemented |
| Touch movement / look | ❌ Not implemented |

## Future UX (mobile 3D)

### On-screen controls

- **Virtual joystick** (lower-left): forward/back/strafe on the festival plane; same speed as WASD (~8 m/s).
- **Drag-to-look** (right half of screen) or secondary touch zone: yaw/pitch without pointer lock (iOS Safari blocks pointer lock on many devices).
- **Tap POI marker** → info sheet (same content as HUD popup).
- **Mode toggle** in HUD: `Manual` | `GPS follow`.
- Keep **44px+** hit targets and safe-area insets; respect `touch-action` so the page doesn’t scroll while playing.

### GPS follow setup

1. **Permission prompt** — copy aligned with overlay (“Use location to place you on the festival map”).
2. **First fix** — `const [x, z] = latLngToLocal(lat, lng)` → teleport camera via existing `teleportRef`.
3. **Continuous tracking** — `navigator.geolocation.watchPosition` with `enableHighAccuracy: true`; lerp camera toward new `[x, z]` each frame to reduce jitter.
4. **Out of bounds** — if fix is outside `georef.bounds`, show “Move closer to the grounds” and fall back to manual spawn at venue center.
5. **Accuracy UI** — show accuracy radius (m); hide or damp updates when `accuracy > 30` m.
6. **Heading (optional phase 2)** — `deviceorientation` / `AbsoluteOrientation` to rotate view with compass; requires permission on iOS 13+.
7. **Satellite 3D mode** — festival plane GPS is straightforward; satellite tile grid may need alignment work before GPS works in that mode (tile origin ≠ festival plane origin today).

### Product / gating notes

- Do **not** block mobile entirely once controls + GPS exist; relax `WalkthroughLoader` mobile check when feature-ready.
- At-event default CTA can remain **`/overlay`** for reliability; 3D walk is a premium “immersive” layer for unlocked users with decent GPS.
- Test on real devices at KEC: sun glare, crowd density, and cell load affect GPS more than desktop QA.

## Suggested implementation order

1. Extract shared **`useFestivalGeolocation()`** hook from `VirtualOverlayMap` (watch, denied, accuracy).
2. Add **GPS follow toggle** to desktop walkthrough first (validate `latLngToLocal` + teleport).
3. **Virtual joystick + touch-look** in `WalkthroughWorld` / new `WalkthroughTouchControls.tsx`.
4. Remove mobile hard-block in `WalkthroughLoader`; show simplified HUD on small screens.
5. Compass heading (optional).
6. Satellite-mode GPS alignment (if both modes must support follow).

## Related files

- `src/components/walkthrough/WalkthroughLoader.tsx` — gate + dynamic import
- `src/components/walkthrough/WalkthroughExperience.tsx` — scene orchestration
- `src/components/walkthrough/WalkthroughWorld.tsx` — movement, bounds, proximity
- `src/components/walkthrough/WalkthroughHUD.tsx` — mode/tour UI
- `src/lib/georef.ts` — `latLngToLocal`, bounds, plane size
- `src/components/VirtualOverlayMap.tsx` — reference GPS implementation

## Out of scope (for now)

- Full AR / camera passthrough
- Replacing `/overlay` as the primary mobile map
- Unreal export (`unreal/LTL2026/`) — separate pipeline from web walkthrough
