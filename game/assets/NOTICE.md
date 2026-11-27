# NOTICE — third-party assets (CC0, Poly Haven)

All files in this directory are Creative Commons CC0 (public domain) assets
from Poly Haven (https://polyhaven.com), downloaded 2026-11-27. They are
vendored here so the game loads nothing over the network (RULES.txt line 19:
every reference must be a file inside game/). No code, image or asset from
any other make.fun entry was used.

## 1. qwantani_sunset_env_2k.jpg — HDRI environment (golden hour)
- Source asset: "Qwantani Sunset" — https://polyhaven.com/a/qwantani_sunset
- Source file: `qwantani_sunset_2k.hdr` (2k, Radiance HDR, 5,948,919 bytes,
  md5 07d82385c773b8b4a82fde37ce9c6878, via
  https://api.polyhaven.com/files/qwantani_sunset)
- License: CC0 — https://polyhaven.com/license
- Derivation (build-time only, done 2026-11-27): ffmpeg tonemap=mobius to
  2048x1024 JPEG, then rolled horizontally so the sun sits at u=0.139 to
  match the game's SUN_DIR in src/sky.js (sun column measured from the
  brightest horizon band, shift 1114 px). The original .hdr is NOT in the
  repo — only this tonemapped, sun-aligned JPEG is used, as
  `scene.environment` via PMREMGenerator. The game's sky dome stays
  procedural (src/sky.js); the HDRI is lighting/reflections only.

## 2. grass_ground_detail_1k.jpg — terrain detail map
- Source asset: "Grass Ground" — https://polyhaven.com/a/grass_ground
- Source file: `grass_ground_diff_2k.jpg` (2k albedo, via
  https://api.polyhaven.com/files/grass_ground)
- License: CC0 — https://polyhaven.com/license
- Derivation (build-time only, done 2026-11-27): downscaled to 1024x1024
  and desaturated to 0.35 (ImageEnhance.Color) so it reads as a neutral
  ground-detail map that multiplies with the terrain's own biome vertex
  colours instead of tinting sand/rock green. Used as `map` on the terrain
  material (src/terrain.js), repeat 200x200.

## 3. grass_ground_nor_1k.jpg — terrain normal map
- Source asset: "Grass Ground" — https://polyhaven.com/a/grass_ground
- Source file: `grass_ground_nor_gl_2k.jpg` (2k OpenGL normal map, via
  https://api.polyhaven.com/files/grass_ground)
- License: CC0 — https://polyhaven.com/license
- Derivation (build-time only, done 2026-11-27): downscaled to 1024x1024.
  Used as `bumpMap` on the terrain material (src/terrain.js), repeat 200x200.

## 4. ground_atlas_2k.jpg — terrain biome atlas (REALISM ROUND 2)
- 2x2 mosaic of 1024 px tiles, built 2026-11-27 with PIL (see below):
  top-left dirt, top-right sand, bottom-left grass, bottom-right rock.
  Used as `map` on the terrain material (src/terrain.js writes per-vertex
  UVs into the matching quadrant at a 30 m tiling; src/assets.js).
- Tile sources (all CC0 — https://polyhaven.com/license):
  - Grass: the same `grass_ground_diff_2k.jpg` as item 2 (already treated).
  - Rock: "Aerial Rocks 02" — https://polyhaven.com/a/aerial_rocks_02 —
    `aerial_rocks_02_diff_1k.jpg` (785,923 bytes, md5
    b5795e9b9e43d718ace73448c97d57ab, via https://api.polyhaven.com/files/aerial_rocks_02).
  - Dirt: "Aerial Ground Rock" — https://polyhaven.com/a/aerial_ground_rock —
    `aerial_ground_rock_diff_1k.jpg` (599,629 bytes, md5
    bf5dca7bdd00de98f6a18ed10ec74b42, via https://api.polyhaven.com/files/aerial_ground_rock).
  - Sand: "Aerial Beach 02" — https://polyhaven.com/a/aerial_beach_02 —
    `aerial_beach_02_diff_1k.jpg` (309,954 bytes, md5
    8add95ec469c7b776d3289e774927f28, via https://api.polyhaven.com/files/aerial_beach_02).
- Derivation (build-time only, done 2026-11-27): the three new tiles were
  desaturated to 0.35 and renormalized to mean luminance 0.91 (same
  treatment as item 2, so the vertex biome colours still dominate); the
  four 1024 px tiles were pasted into one 2048x2048 JPEG (quality 90,
  1,672,215 bytes). The three 1k source JPGs were NOT kept in the repo —
  only this mosaic is used (same derived-only convention as items 1-3).

## 5. aerial_asphalt_01_diff_1k.jpg — taxiway asphalt (REALISM ROUND 2)
- Source asset: "Aerial Asphalt 01" — https://polyhaven.com/a/aerial_asphalt_01
- Source file: `aerial_asphalt_01_diff_1k.jpg` (635,143 bytes, md5
  b41fc0114556f15fe59b260cf0978b89, via https://api.polyhaven.com/files/aerial_asphalt_01)
- License: CC0 — https://polyhaven.com/license
- Used as-is (no derivation) as `map` on the taxiway plane
  (src/terrain.js `applyTaxiwayTexture`, repeat 1x10), loaded by
  src/assets.js together with the other textures.

## What was NOT used
- No water normal texture from Poly Haven exists (checked the catalogue
  2026-11-27); the sea keeps the game's own procedural normal map
  (src/terrain.js `makeWaterNormalMap`, upgraded 128 -> 512 px in this pass).
- No aircraft model was fetched in this pass (GLTF licensing/size risk,
  noted as a possible next step).

## Asset-library search (REALISM ROUND 2, 27 Nov 2026) — no external model used
The hero aircraft stays procedural (src/aircraft.js, path b): no public
library yielded a usable twin-prop King Air, and the procedural King Air
already reads in the cover shot. Sources checked, in priority order:
- Poly Haven models API (https://api.polyhaven.com/assets?t=models):
  "aircraft" 0 matches, "plane" only a hand-plane tool, "hangar" 0,
  "house" only incidental words. Trees/rocks are photogrammetry scans
  (100k-7.8M tris) — unusable in a browser game. No model integrated.
- Sketchfab: no usable CC0/CC-BY flyable King Air ≤5 MB (King Air
  Beechcraft Animated / Super King Air are "Free Standard", not CC0/CC-BY;
  KA350 Flight Deck is CC-BY-NC-SA; Meshopia King Air 350 CC0 is 56.6 MB).
  Downloads also need an account. Nothing taken.
- Blend Swap: no King Air / civil twin-turboprop found (nearest: Fokker
  G1, a 1930s twin-engine fighter, CC-BY-SA — wrong type). Downloads
  return a login interstitial (verified 27 Nov 2026), and `blender` is
  NOT installed on this VM, so .blend -> .glb conversion is impossible
  anyway. Nothing taken.
- Quaternius (quaternius.com, CC0): the Airplane Pack has only a
  single-engine "SmallPlane" — wrong type, and stylized low-poly. Its
  nature/city kits would be a lateral move from our procedural trees and
  town. Nothing taken.
- Kenney (kenney.nl, CC0, no account needed): no aircraft pack exists at
  all (Kenney has only teased one, unreleased). City/nature kits are
  stylized blocky and would clash with the semi-realistic look.
  Nothing taken.
- CGTrader Free / TurboSquid Free: downloads require a free account
  sign-up (verified 27 Nov 2026) and licences are seller-chosen
  ("Royalty Free" / Editorial), ambiguous per model — both blocked by the
  no-account + clear-licence rules. Free3D: no CC0/CC-BY twin-prop
  verified, licence ambiguous — not used. Nothing taken.
- No code, image or asset from any other make.fun entry was used.
