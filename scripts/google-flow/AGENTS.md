# Google Flow bot workflow — LTL26 viral video

Bots (Cursor agents, Gemini, etc.) use this folder to produce **copy-paste prompts** for [Google Flow](https://labs.google/fx/tools/flow) / Veo 3.

## Goal

30–45s vertical viral promo for **https://ltl26.com/map** that **feels like LTL 2025 recap energy** but showcases the **website** (free map + virtual overlay).

## Bot run order

1. Read `viral-ltl26-shotlist.json`
2. Read `SOURCES.md` — ensure human exported ingredients to `assets/flow-ingredients/`
3. Run `npm run flow:brief` → outputs `assets/flow-export/flow-brief.md`
4. For each shot in JSON, paste **veoPrompt** into Flow with listed **ingredients**
5. Export clips → stitch in CapCut/DaVinci with **onScreenText** overlays
6. Add **voiceoverScript** as VO or captions
7. Post with **captionCopy** variants

## Veo prompt formula (required)

Every generated prompt MUST follow:

```
[Shot type + camera] + [subject + ONE action] + [environment] + [lighting/style] + [Audio: ...]
```

- One action per 8s clip  
- Quote dialogue if any: `A voice says, "..."`  
- No DWP logos, no official LTL trademark claims in generated footage  
- Always leave room for text overlay when `onScreenText` is set  

## Gemini system prompt (for expanding shots)

Copy into Flow Agent or Gemini when brainstorming variations:

```
You are a festival UGC director and Veo 3 prompt engineer for an UNOFFICIAL fan app (ltl26.com).
Reference the energy of Louder Than Life 2025 recap videos (crowds, bourbon, metal, Kentucky Expo Center outdoor grounds) but do NOT recreate copyrighted artist performances.
Output only Veo-ready prompts. Palette: neon green #39ff14, purple #9b30ff, black backgrounds for UI shots.
Product facts: free official tap map forever; virtual overlay has 10-min trial then $5 unlock all features + no ads; LitPrintz.com association.
```

## Ingredient naming convention

| Filename | Content |
|----------|---------|
| `ltl2025_crowd_wide.jpg` | Wide crowd from 2025 recap still |
| `ltl2025_recap_frame_crowd.jpg` | Any 2025 recap frame |
| `phone_pov.jpg` | Hand + phone at festival |
| `ltl26_map_screenshot.png` | `/map` tap map |
| `ltl26_overlay_screenshot.png` | `/overlay` GPS view |
| `ltl26_schedule_screenshot.png` | `/schedule` NOW banner |
| `ltl26_home_screenshot.png` | Home hero |
| `stage_lights.jpg` | Generic stage haze |
| `vip_zone_photo_2025.jpg` | VIP area reference |

## Quality checklist before publish

- [ ] Disclaimer in caption: unofficial fan project  
- [ ] URL visible: **ltl26.com**  
- [ ] Shows free map AND overlay (paid feature tease ok)  
- [ ] 9:16 export for TikTok/IG Reels  
- [ ] No misleading "official LTL app" wording  
