/* assets.js — CC0 Poly Haven assets (see game/assets/NOTICE.md): the
   Qwantani Sunset HDRI tonemapped to a JPEG environment, the 2x2 biome
   ground atlas (grass / rock / dirt / sand tiles, REALISM ROUND 2) plus
   the grass normal map for the terrain, and the aerial-asphalt texture
   for the taxiway. Everything loads from files inside game/ — nothing
   over the network (RULES.txt line 19). Loading is async: loadGameAssets()
   resolves when all textures are applied (or after a 5 s cap / on error),
   so a missing file can never hang the game — it just falls back to the
   procedural look. */

const ASSET_FILES = {
  env: 'assets/qwantani_sunset_env_2k.jpg',
  groundAtlas: 'assets/ground_atlas_2k.jpg',
  groundNormal: 'assets/grass_ground_nor_1k.jpg',
  taxiwayAsphalt: 'assets/aerial_asphalt_01_diff_1k.jpg',
};

// The atlas is NOT tiled by repeat: terrain.js writes per-vertex UVs that
// already encode the 30 m tiling inside each quadrant, so repeat stays 1.
// The bump map shares those UVs, so its repeat is 1 too (its grain then
// reads at the same 30 m tile scale as the colour).
const GROUND_REPEAT = 1;

let _assetsPromise = null;

function _loadTexture(url, srgb) {
  return new Promise((resolve) => {
    new THREE.TextureLoader().load(url, (tex) => {
      if (srgb) tex.encoding = THREE.sRGBEncoding;
      resolve(tex);
    }, undefined, () => resolve(null));
  });
}

// Apply the HDRI environment (PMREM-baked), the terrain atlas and the
// taxiway asphalt. Returns a promise that resolves to
// { env: bool, ground: bool, taxiway: bool }.
function loadGameAssets(renderer, scene, terrainMesh) {
  if (_assetsPromise) return _assetsPromise;
  const done = Promise.all([
    _loadTexture(ASSET_FILES.env, true),
    _loadTexture(ASSET_FILES.groundAtlas, true),
    _loadTexture(ASSET_FILES.groundNormal, false),
    _loadTexture(ASSET_FILES.taxiwayAsphalt, true),
  ]).then(([envTex, atlasTex, normalTex, asphaltTex]) => {
    let env = false;
    let ground = false;
    let taxiway = false;
    if (envTex) {
      // PMREM-bake the LDR equirect into a mipmapped environment: the
      // warm sun lobe lands on the aircraft's standard materials and the
      // glass/water, instead of the flat white the bare directional light
      // left. The sun was rolled to u=0.139 at build time to match SUN_DIR.
      envTex.mapping = THREE.EquirectangularReflectionMapping;
      const pmrem = new THREE.PMREMGenerator(renderer);
      const rt = pmrem.fromEquirectangular(envTex);
      scene.environment = rt.texture;
      pmrem.dispose();
      envTex.dispose();
      env = true;
    }
    if (terrainMesh && atlasTex && normalTex) {
      // Atlas multiplies the biome vertex colours (each quadrant was
      // desaturated at build time so sand stays sandy); the normal map
      // becomes a bump map so the ground reads as textured, not flat.
      // Per-vertex UVs already encode the tiling — repeat stays 1.
      atlasTex.wrapS = atlasTex.wrapT = THREE.RepeatWrapping;
      atlasTex.repeat.set(GROUND_REPEAT, GROUND_REPEAT);
      atlasTex.anisotropy = 4;
      normalTex.wrapS = normalTex.wrapT = THREE.RepeatWrapping;
      normalTex.repeat.set(GROUND_REPEAT, GROUND_REPEAT);
      normalTex.anisotropy = 4;
      const mat = terrainMesh.material;
      mat.map = atlasTex;
      mat.bumpMap = normalTex;
      mat.bumpScale = 0.5;
      mat.needsUpdate = true;
      ground = true;
    }
    if (asphaltTex) {
      applyTaxiwayTexture(asphaltTex);
      taxiway = true;
    }
    return { env, ground, taxiway };
  });
  // 5 s cap: the staged screenshots wait on this promise, and a slow or
  // missing asset must never hang the shot — the game still runs.
  _assetsPromise = Promise.race([
    done,
    new Promise((resolve) => setTimeout(() => resolve({ env: false, ground: false, taxiway: false, timedOut: true }), 5000)),
  ]);
  return _assetsPromise;
}
