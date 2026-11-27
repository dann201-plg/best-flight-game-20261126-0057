/* terrain.js — the Indonesian archipelago: seeded heightfield, sea, river,
   roads, town, forest, volcano and the airfield with runway 36.
   References: MSFS (terrain + handcrafted airport) and Infinite Flight
   (satellite-look terrain, precise runway/taxiway). */

const WORLD_SIZE = 6000;
const WORLD_SEED = 20261126;
const VOLCANO = { x: -1750, z: -1350, radius: 650, height: 380 };
const TOWN = { x: 380, z: 60, radius: 320 };
const RUNWAY = { x: 0, z: 0, length: 900, width: 46, heading: 0 };

// The river's centreline: a sine curve running north-south.
function riverX(z) {
  return 950 + 260 * Math.sin(z * 0.0009 + 1.3);
}

// Analytic terrain height (metres). The mesh, the collision test and the
// blob shadow all call this one function, so they can never disagree.
function terrainHeightAt(x, z) {
  const r = Math.sqrt(x * x + z * z);
  // Indented coastline (REALISM ROUND 2): the island edge is not a
  // circle — fbm noise pushes the shoreline in/out by up to ~420 m so
  // the coast reads as bays and headlands from the air. Faded to zero
  // near the volcano (its NW flank sits on the mask band; a bite out
  // of the cone would read as a modelling error, not a bay).
  const dvV = Math.sqrt((x - VOLCANO.x) ** 2 + (z - VOLCANO.z) ** 2);
  const coastFade = smoothstep(700, 900, dvV);
  const coast = (fbm2(x * 0.0004 + 11.7, z * 0.0004 - 4.2, WORLD_SEED, 3) - 0.5) * 2 * 420 * coastFade;
  const mask = smoothstep(2950, 2200, r + coast); // island fades into the sea
  const n = fbm2(x * 0.00045 + 3.7, z * 0.00045 - 1.2, WORLD_SEED, 4);
  let h = (n - 0.5) * 2 * 62 + 16;

  // Volcano cone in the northwest.
  const dv = Math.sqrt((x - VOLCANO.x) ** 2 + (z - VOLCANO.z) ** 2);
  const cone = Math.max(0, 1 - dv / VOLCANO.radius);
  h += Math.pow(cone, 1.6) * VOLCANO.height;

  // Flatten the airfield: |x| < 130, runway z range plus the approach
  // corridor south (z to 1250) and the overshoot north (z to -560).
  const zFlat = smoothstep(1400, 1250, z) * smoothstep(-640, -490, z);
  const airFlat = smoothstep(150, 90, Math.abs(x)) * zFlat;
  h = lerp(h, 2, airFlat);

  // Flatten the town on the east coast.
  const dt = Math.sqrt((x - TOWN.x) ** 2 + (z - TOWN.z) ** 2);
  h = lerp(h, 7, smoothstep(TOWN.radius, TOWN.radius * 0.55, dt));

  // Carve the river channel down to the water.
  const dr = Math.abs(x - riverX(z));
  if (dr < 90) h = Math.min(h, 1.0 + (dr / 90) * 5);

  // Sea floor beyond the island mask.
  h = h * mask + -28 * (1 - mask);
  return Math.max(h, -30);
}

// Scratch colour reused by biomeColor (called once per vertex at load).
const _mixC = new THREE.Color();

function biomeColor(x, z, h, out) {
  const p = fbm2(x * 0.0016 + 7.3, z * 0.0016 - 2.1, WORLD_SEED, 3);
  const dv = Math.sqrt((x - VOLCANO.x) ** 2 + (z - VOLCANO.z) ** 2);
  const dt = Math.sqrt((x - TOWN.x) ** 2 + (z - TOWN.z) ** 2);
  const onCone = dv < VOLCANO.radius * 0.95;
  if (h < 0.6) out.set(0xd8c08d); // sand beach
  else if (h < 3) out.set(0xb9c07a); // beach grass
  else if (dt < TOWN.radius * 0.8) out.set(0xb0a58f); // town ground
  else if (onCone) {
    // Volcano slope, graded by height instead of one flat grey: jungle
    // green at the foot, brown scree, dark rock, grey summit, a dusting
    // of ash-white only on the very top — a cone you can read as a
    // mountain, not a pyramid.
    out.set(0x2f5a26);
    _mixC.set(0x7a5c38); out.lerp(_mixC, smoothstep(110, 190, h));
    _mixC.set(0x4a4238); out.lerp(_mixC, smoothstep(200, 290, h));
    _mixC.set(0x8a7f72); out.lerp(_mixC, smoothstep(310, 360, h));
    if (h > 365) { _mixC.set(0xd8d2c8); out.lerp(_mixC, smoothstep(365, 385, h)); }
  } else if (p > 0.62) out.set(0x6fae3e); // rice field
  else if (p > 0.45) out.set(0xc9b968); // dry field
  else if (p > 0.28) out.set(0x2f5a26); // forest
  else out.set(0x5d8f3e); // grass
  // Gentle altitude wash off-cone: high ground browns toward rock.
  if (!onCone && h > 60) {
    _mixC.set(0x8a7a5c);
    out.lerp(_mixC, smoothstep(60, 170, h) * 0.7);
  }
  // Per-vertex brightness jitter so the ground reads as textured, not flat.
  const j = 0.94 + 0.12 * hash2(Math.floor(x / 7), Math.floor(z / 7), WORLD_SEED);
  out.multiplyScalar(j);
  return out;
}

// Which quadrant of the ground atlas (assets/ground_atlas_2k.jpg) a
// vertex samples — mirrors biomeColor's decisions so the texture matches
// the vertex colour: sand on the beach, rock on the high volcano cone,
// dirt on dry fields and town ground, grass everywhere else.
// Quadrants in UV space (flipY): grass (0,0), rock (1,0), dirt (0,1),
// sand (1,1).
function groundQuad(x, z, h) {
  const p = fbm2(x * 0.0016 + 7.3, z * 0.0016 - 2.1, WORLD_SEED, 3);
  const dv = Math.sqrt((x - VOLCANO.x) ** 2 + (z - VOLCANO.z) ** 2);
  const dt = Math.sqrt((x - TOWN.x) ** 2 + (z - TOWN.z) ** 2);
  const onCone = dv < VOLCANO.radius * 0.95;
  if (h < 0.6) return [1, 1]; // sand beach
  if (onCone && h > 200) return [1, 0]; // volcano rock
  if (p > 0.45 && p <= 0.62) return [0, 1]; // dry field
  if (dt < TOWN.radius * 0.8) return [0, 1]; // town ground
  return [0, 0]; // grass
}

// The land mesh: displaced heightfield with vertex-colour biomes.
// REALISM ROUND 2: 220 segments (was 150) so relief reads at range, and
// per-vertex UVs into the 2x2 biome atlas — each vertex samples its own
// biome's 1024 px tile at a 30 m tiling, so the ground is rock where the
// colour says rock and sand where it says sand. The Poly Haven tiles are
// seamless, so the frac() wrap at each tile edge is invisible.
function createTerrain(scene) {
  const geo = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, 220, 220);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  const TILE = 30;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const h = terrainHeightAt(x, z);
    pos.setY(i, h);
    biomeColor(x, z, h, c);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
    const [qx, qy] = groundQuad(x, z, h);
    const fx = (((x / TILE) % 1) + 1) % 1;
    const fz = (((z / TILE) % 1) + 1) % 1;
    uv.setXY(i, qx * 0.5 + fx * 0.5, qy * 0.5 + fz * 0.5);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshLambertMaterial({ vertexColors: true }),
  );
  scene.add(mesh);

  // Volcano smoke: a thin grey plume rising off the summit and drifting
  // east, so the cone reads as alive instead of a painted pyramid.
  // Static sprites (the shot is one frame); the drift is baked into the
  // rising, widening, fading stack.
  {
    const sc = document.createElement('canvas');
    sc.width = 128; sc.height = 128;
    const sg = sc.getContext('2d');
    const sgrad = sg.createRadialGradient(64, 64, 0, 64, 64, 64);
    sgrad.addColorStop(0, 'rgba(220,214,205,0.85)');
    sgrad.addColorStop(0.55, 'rgba(210,204,195,0.4)');
    sgrad.addColorStop(1, 'rgba(210,204,195,0)');
    sg.fillStyle = sgrad;
    sg.fillRect(0, 0, 128, 128);
    const smokeTex = new THREE.CanvasTexture(sc);
    const summitY = terrainHeightAt(VOLCANO.x, VOLCANO.z);
    for (let i = 0; i < 8; i++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: smokeTex, transparent: true, depthWrite: false,
        opacity: 0.3 - i * 0.025,
      }));
      const rise = i * 22;
      sp.position.set(
        VOLCANO.x + 20 + i * 26,
        summitY + 10 + rise,
        VOLCANO.z - 10 - i * 8,
      );
      const size = 90 + i * 26;
      sp.scale.set(size, size * 0.75, 1);
      scene.add(sp);
    }
  }
  return mesh;
}

// Procedural normal map for the sea: a seeded wave heightfield turned into
// normals, so the sun glint breaks into a shimmering path instead of one
// frozen highlight. 512 px with finer high-frequency terms (Poly Haven
// has no water normal texture in its catalogue, checked 2026-11-27) —
// the 128 px version blurred the glitter into one soft blob at range.
// The offset drifts slowly in the update loop.
function makeWaterNormalMap() {
  const S = 512;
  const c = document.createElement('canvas');
  c.width = S; c.height = S;
  const g = c.getContext('2d');
  const img = g.createImageData(S, S);
  const hgt = new Float32Array(S * S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const u = x / S * Math.PI * 2;
      const v = y / S * Math.PI * 2;
      hgt[y * S + x] = Math.sin(u * 3 + 1.7) * 0.5 + Math.sin(v * 4 + 0.6) * 0.35
        + Math.sin((u + v) * 5 + 2.3) * 0.25 + Math.sin((u - v) * 7 + 0.9) * 0.15
        + Math.sin(u * 11 + 0.4) * 0.12 + Math.sin(v * 13 + 2.9) * 0.10
        + Math.sin((u * 2 - v * 3) * 4 + 1.1) * 0.08;
    }
  }
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const xl = hgt[y * S + ((x - 1 + S) % S)];
      const xr = hgt[y * S + ((x + 1) % S)];
      const yt = hgt[((y - 1 + S) % S) * S + x];
      const yb = hgt[((y + 1) % S) * S + x];
      const nx = (xl - xr) * 0.7;
      const ny = (yt - yb) * 0.7;
      const len = Math.hypot(nx, ny, 1);
      const i = (y * S + x) * 4;
      img.data[i] = Math.round((nx / len * 0.5 + 0.5) * 255);
      img.data[i + 1] = Math.round((ny / len * 0.5 + 0.5) * 255);
      img.data[i + 2] = Math.round((1 / len * 0.5 + 0.5) * 255);
      img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(64, 64);
  return tex;
}

// Sun-glinting sea plane at y = 0.
function createWater(scene) {
  const geo = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE);
  geo.rotateX(-Math.PI / 2);
  const normalMap = makeWaterNormalMap();
  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshPhongMaterial({
      color: 0x145a74, specular: 0xffd9a0, shininess: 220,
      normalMap, normalScale: new THREE.Vector2(0.45, 0.45),
      transparent: true, opacity: 0.96,
    }),
  );
  mesh.position.y = 0.2;
  scene.add(mesh);

  // Elongated sun-glint streak on the northern sea, along the sun's
  // azimuth: the glitter path a low golden-hour sun throws on water.
  // A canvas gradient (warm, fading at both ends) on an additive plane,
  // so the sea reads as lit water instead of a flat blue slab.
  const glintTex = (() => {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 64;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0, 'rgba(255,215,140,0)');
    grad.addColorStop(0.35, 'rgba(255,215,140,0.55)');
    grad.addColorStop(0.6, 'rgba(255,225,170,0.75)');
    grad.addColorStop(1, 'rgba(255,215,140,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 64);
    g.globalCompositeOperation = 'destination-in';
    const vg = g.createLinearGradient(0, 0, 0, 64);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(0.5, 'rgba(0,0,0,1)');
    vg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = vg;
    g.fillRect(0, 0, 256, 64);
    return new THREE.CanvasTexture(c);
  })();
  const glintGeo = new THREE.PlaneGeometry(2600, 240);
  glintGeo.rotateX(-Math.PI / 2);
  const glint = new THREE.Mesh(
    glintGeo,
    new THREE.MeshBasicMaterial({
      map: glintTex, transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }),
  );
  glint.position.set(-900, 0.6, -1900);
  glint.rotation.y = 2.26; // long axis along the WNW sun azimuth
  scene.add(glint);

  // Wake: a fading foam trail behind the aircraft when it flies low
  // over the sea — the churn a real float run leaves, and the cue that
  // the water is water. Hidden over land or above 30 m.
  const wakeTex = (() => {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 256;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 0, 256);
    // Bright at the canvas bottom (v=0, the +z end after the bake) so
    // the fresh foam sits closest to the aircraft and fades to the tail.
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(0.6, 'rgba(255,255,255,0.4)');
    grad.addColorStop(1, 'rgba(255,255,255,0.85)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 256);
    g.globalCompositeOperation = 'destination-in';
    const vg = g.createLinearGradient(0, 0, 64, 0);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(0.5, 'rgba(0,0,0,1)');
    vg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = vg;
    g.fillRect(0, 0, 64, 256);
    return new THREE.CanvasTexture(c);
  })();
  const wakeGeo = new THREE.PlaneGeometry(16, 70);
  wakeGeo.rotateX(-Math.PI / 2);
  const wake = new THREE.Mesh(
    wakeGeo,
    new THREE.MeshBasicMaterial({
      map: wakeTex, transparent: true, opacity: 0,
      depthWrite: false,
    }),
  );
  wake.position.y = 0.55;
  wake.visible = false;
  scene.add(wake);

  return {
    mesh,
    wake,
    // The ripple drifts slowly so the sun glitter shimmers instead of
    // sitting as one frozen highlight. With a position + heading the
    // wake trails behind the aircraft on low passes over the sea.
    update(dt, pos, heading, airborne) {
      normalMap.offset.x += dt * 0.004;
      normalMap.offset.y += dt * 0.0025;
      if (!pos || !airborne) { wake.visible = false; return; }
      const overSea = terrainHeightAt(pos.x, pos.z) < 1;
      const alt = pos.y - 0.2;
      if (!overSea || alt > 30) { wake.visible = false; return; }
      // Forward is (sin(heading), 0, cos(heading)) negated: heading 0
      // flies north (-z), so forward = (-sin h, 0, -cos h).
      const fx = -Math.sin(heading);
      const fz = -Math.cos(heading);
      wake.position.set(pos.x - fx * 38, 0.55, pos.z - fz * 38);
      wake.rotation.y = Math.atan2(fx, fz);
      wake.material.opacity = 0.55 * (1 - alt / 30);
      wake.visible = true;
    },
  };
}

// A flat ribbon following sample points (used for the river and the roads).
function buildRibbon(points, width, yLift, color) {
  const n = points.length;
  const verts = new Float32Array(n * 2 * 3);
  const idx = [];
  for (let i = 0; i < n; i++) {
    const p = points[i];
    const q = points[Math.min(i + 1, n - 1)];
    const r = points[Math.max(i - 1, 0)];
    let dx = q.x - r.x;
    let dz = q.z - r.z;
    const len = Math.hypot(dx, dz) || 1;
    dx /= len; dz /= len;
    const nx = -dz * width * 0.5;
    const nz = dx * width * 0.5;
    verts.set([p.x + nx, p.y + yLift, p.z + nz], i * 6);
    verts.set([p.x - nx, p.y + yLift, p.z - nz], i * 6 + 3);
    if (i < n - 1) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color }));
}

function createRiverAndRoads(scene) {
  const riverPts = [];
  for (let z = -2800; z <= 2800; z += 100) {
    riverPts.push(new THREE.Vector3(riverX(z), 0.4, z));
  }
  scene.add(buildRibbon(riverPts, 58, 0.15, 0x2a7a9e));

  const roadPts = [];
  for (let x = -2600; x <= 2600; x += 120) {
    roadPts.push(new THREE.Vector3(x, terrainHeightAt(x, 350), 350 + 40 * Math.sin(x * 0.0006)));
  }
  scene.add(buildRibbon(roadPts, 11, 0.5, 0x3c3a38));
  const linkPts = [];
  for (let t = 0; t <= 1.0001; t += 0.1) {
    const x = lerp(0, TOWN.x, t);
    const z = lerp(520, TOWN.z, t);
    linkPts.push(new THREE.Vector3(x, terrainHeightAt(x, z), z));
  }
  scene.add(buildRibbon(linkPts, 9, 0.5, 0x3c3a38));
}

// Town buildings and forest trees as instanced meshes (cheap at range).
function createTownAndTrees(scene, rng) {
  const box = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const town = new THREE.InstancedMesh(box, mat, 70);
  const townSpots = [];
  const m = new THREE.Matrix4();
  const col = new THREE.Color();
  const palette = [0xe8e0cc, 0xd8c9a8, 0xc9b8a0, 0xb8b0a0, 0xe0d8d0];
  for (let i = 0; i < 70; i++) {
    const a = rng() * Math.PI * 2;
    const rr = Math.sqrt(rng()) * TOWN.radius * 0.8;
    const x = TOWN.x + Math.cos(a) * rr;
    const z = TOWN.z + Math.sin(a) * rr;
    const w = rngRange(rng, 12, 30);
    const hgt = rngRange(rng, 6, 26);
    const d = rngRange(rng, 12, 30);
    m.makeScale(w, hgt, d);
    m.setPosition(x, terrainHeightAt(x, z) + hgt / 2, z);
    town.setMatrixAt(i, m);
    townSpots.push({ x, z, w, hgt, d, topY: terrainHeightAt(x, z) + hgt });
    col.set(palette[Math.floor(rng() * palette.length)]);
    town.setColorAt(i, col);
  }
  scene.add(town);

  // Pitched roofs on most town buildings: a triangular prism (3-sided
  // cylinder) reads as a roofline from the air, where flat boxes read as
  // a grey slab. ~70% of buildings get one.
  const roofGeo = new THREE.CylinderGeometry(1, 1, 1, 3);
  roofGeo.rotateX(-Math.PI / 2); // prism axis along z, triangle pointing up
  const roofMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const roofs = new THREE.InstancedMesh(roofGeo, roofMat, 70);
  const roofPalette = [0xa85f3c, 0x6f6a66, 0x4a4642, 0x8a5a3a];
  let roofCount = 0;
  for (const s of townSpots) {
    if (rng() < 0.3) continue;
    const roofH = s.w * 0.18;
    m.makeScale(s.w * 0.58, roofH, s.d * 1.05);
    m.setPosition(s.x, s.topY - 0.2 + 0.5 * roofH, s.z);
    roofs.setMatrixAt(roofCount, m);
    col.set(roofPalette[Math.floor(rng() * roofPalette.length)]);
    roofs.setColorAt(roofCount, col);
    roofCount++;
  }
  roofs.count = roofCount;
  scene.add(roofs);

  // Merge coloured parts (trunk + foliage blobs) into one vertex-coloured
  // geometry: one InstancedMesh per species, one draw call per species.
  // Upward-facing normals are brighter (baked sun from above) so the
  // crown reads as 3D without a shadow map.
  function mergeColoredParts(parts) {
    const positions = [];
    const normals = [];
    const colors = [];
    const c = new THREE.Color();
    for (const part of parts) {
      const g = part.geo.index ? part.geo.toNonIndexed() : part.geo;
      g.applyMatrix4(part.matrix);
      g.computeVertexNormals(); // flat facets — the low-poly crown look
      const pos = g.attributes.position;
      const nor = g.attributes.normal;
      c.set(part.color);
      for (let i = 0; i < pos.count; i++) {
        positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
        normals.push(nor.getX(i), nor.getY(i), nor.getZ(i));
        const shade = part.shade === false ? 1 : 0.78 + 0.22 * Math.max(0, nor.getY(i));
        colors.push(c.r * shade, c.g * shade, c.b * shade);
      }
      g.dispose();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geo;
  }
  function xform(x, y, z, sx, sy, sz) {
    const m4 = new THREE.Matrix4();
    m4.makeScale(sx, sy, sz);
    m4.setPosition(x, y, z);
    return m4;
  }
  // (a) Tropical rain tree: straight trunk + 5 overlapping crown blobs
  // (REALISM ROUND 2: a fifth, smaller top blob breaks the single-blob
  // silhouette — the crown reads as layered foliage, not one ball).
  const rainGeo = mergeColoredParts([
    { geo: new THREE.CylinderGeometry(0.28, 0.5, 3.4, 6), matrix: xform(0, 1.7, 0, 1, 1, 1), color: 0x6b4a2f, shade: false },
    { geo: new THREE.IcosahedronGeometry(2.6, 1), matrix: xform(0, 4.4, 0, 1, 0.85, 1), color: 0x2f5c28 },
    { geo: new THREE.IcosahedronGeometry(2.1, 1), matrix: xform(0.9, 5.6, 0.4, 1, 0.85, 1), color: 0x3a6b32 },
    { geo: new THREE.IcosahedronGeometry(1.9, 1), matrix: xform(-0.8, 5.8, -0.5, 1, 0.85, 1), color: 0x2a5224 },
    { geo: new THREE.IcosahedronGeometry(1.5, 1), matrix: xform(0, 7.0, 0, 1, 0.9, 1), color: 0x4a7a3c },
    { geo: new THREE.IcosahedronGeometry(1.0, 1), matrix: xform(0.4, 8.2, 0.3, 1, 0.9, 1), color: 0x55883f },
  ]);
  // (b) Mountain pine: trunk + 4 stacked shrinking blobs (layered, not one cone).
  const pineGeo = mergeColoredParts([
    { geo: new THREE.CylinderGeometry(0.22, 0.4, 2.6, 6), matrix: xform(0, 1.3, 0, 1, 1, 1), color: 0x5a3d26, shade: false },
    { geo: new THREE.IcosahedronGeometry(2.0, 1), matrix: xform(0, 3.6, 0, 1, 0.9, 1), color: 0x24401e },
    { geo: new THREE.IcosahedronGeometry(1.5, 1), matrix: xform(0, 5.2, 0, 1, 0.9, 1), color: 0x2c4d24 },
    { geo: new THREE.IcosahedronGeometry(1.0, 1), matrix: xform(0, 6.5, 0, 1, 0.95, 1), color: 0x35602c },
    { geo: new THREE.IcosahedronGeometry(0.65, 1), matrix: xform(0, 7.5, 0, 1, 0.95, 1), color: 0x3d6c33 },
  ]);
  // (c) Tropical palm: leaning trunk + 7 drooping fronds.
  const palmParts = [
    { geo: new THREE.CylinderGeometry(0.22, 0.34, 7.5, 5), matrix: xform(0, 3.75, 0, 1, 1, 1), color: 0x7a5c38, shade: false },
  ];
  for (let f = 0; f < 7; f++) {
    const a = (f / 7) * Math.PI * 2 + 0.2;
    const frond = new THREE.PlaneGeometry(0.9, 3.4);
    frond.translate(0, -1.7, 0); // hang from the crown point
    const fm = new THREE.Matrix4().makeRotationY(a)
      .multiply(new THREE.Matrix4().makeRotationX(0.85));
    fm.setPosition(0, 7.5, 0);
    palmParts.push({ geo: frond, matrix: fm, color: f % 2 ? 0x3f7a34 : 0x4a8a3c });
  }
  const palmGeo = mergeColoredParts(palmParts);

  const treeMat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
  function plantTrees(geo, count, filter, scaleMin, scaleMax, xMin, xMax, zMin, zMax) {
    const mesh = new THREE.InstancedMesh(geo, treeMat, count);
    const tint = new THREE.Color();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    let placed = 0;
    let guard = 0;
    while (placed < count && guard++ < count * 100) {
      const x = rngRange(rng, xMin, xMax);
      const z = rngRange(rng, zMin, zMax);
      const h = terrainHeightAt(x, z);
      if (!filter(x, z, h)) continue;
      // Lognormal-ish scale: many medium trees, a few giants.
      const sc = scaleMin + (scaleMax - scaleMin) * rng() * rng();
      const sy = sc * rngRange(rng, 0.9, 1.15);
      e.set(rngRange(rng, -0.05, 0.05), rng() * Math.PI * 2, rngRange(rng, -0.05, 0.05));
      q.setFromEuler(e);
      s.set(sc, sy, sc);
      p.set(x, h - 0.2, z);
      m.compose(p, q, s);
      mesh.setMatrixAt(placed, m);
      const g = rngRange(rng, 0.85, 1.12);
      tint.setRGB(g * rngRange(rng, 0.9, 1.0), g, g * rngRange(rng, 0.85, 1.0));
      mesh.setColorAt(placed, tint);
      placed++;
    }
    mesh.count = placed;
    scene.add(mesh);
    return placed;
  }
  const forestFilter = (x, z, h) => {
    const p = fbm2(x * 0.0016 + 7.3, z * 0.0016 - 2.1, WORLD_SEED, 3);
    return h >= 4 && h <= 75 && p >= 0.28 && p <= 0.45
      && !(Math.abs(x) < 160 && Math.abs(z) < 560);
  };
  plantTrees(rainGeo, 520, forestFilter, 1.15, 2.5, -2600, 2600, -2600, 2600);
  plantTrees(pineGeo, 300, (x, z, h) => {
    const dv = Math.sqrt((x - VOLCANO.x) ** 2 + (z - VOLCANO.z) ** 2);
    return h >= 60 && h <= 260 && dv < 900 && !(Math.abs(x) < 160 && Math.abs(z) < 560);
  }, 1.0, 2.0, -2450, -1050, -2050, -650);
  plantTrees(palmGeo, 90, (x, z, h) => {
    const dr = Math.abs(x - riverX(z));
    const r = Math.sqrt(x * x + z * z);
    return h >= 1 && h <= 6 && (r > 2100 || dr < 130)
      && !(Math.abs(x) < 160 && Math.abs(z) < 560);
  }, 0.8, 1.5, -2600, 2600, -2600, 2600);

  // (d) Undergrowth shrubs (REALISM ROUND 2): two-blob bushes that fill
  // the bare ground between the trees — the forest floor reads as
  // vegetation instead of flat green at low altitude.
  const shrubGeo = mergeColoredParts([
    { geo: new THREE.IcosahedronGeometry(1.4, 1), matrix: xform(0, 0.9, 0, 1, 0.7, 1), color: 0x2f5c28 },
    { geo: new THREE.IcosahedronGeometry(1.0, 1), matrix: xform(0.8, 1.2, 0.3, 1, 0.7, 1), color: 0x3a6b32 },
  ]);
  plantTrees(shrubGeo, 380, (x, z, h) => {
    const p = fbm2(x * 0.0016 + 7.3, z * 0.0016 - 2.1, WORLD_SEED, 3);
    return h >= 2 && h <= 45 && p >= 0.28 && p <= 0.62
      && !(Math.abs(x) < 160 && Math.abs(z) < 560);
  }, 0.9, 2.2, -2600, 2600, -2600, 2600);

  // (e) Approach-flank trees (REALISM ROUND 2): rain trees lining both
  // sides of the runway 36 final (x 170-320, z 200-600) — just outside
  // the airfield exclusion, so the cockpit shot's final frames the
  // runway with real trees instead of empty grass.
  plantTrees(rainGeo, 40, (x, z, h) => {
    const ax = Math.abs(x);
    return ax >= 170 && ax <= 320 && z >= 200 && z <= 600 && h >= 2;
  }, 1.3, 2.4, -320, 320, 200, 600);
}

// Runway 36 texture: asphalt, centreline dashes, threshold bars, "36".
function makeRunwayTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 1024;
  const g = c.getContext('2d');
  g.fillStyle = '#2e2e30';
  g.fillRect(0, 0, 256, 1024);
  // Asphalt speckle.
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.12)';
    g.fillRect(Math.random() * 256, Math.random() * 1024, 2, 2);
  }
  // Edge lines.
  g.fillStyle = '#e8e8e8';
  g.fillRect(10, 0, 5, 1024);
  g.fillRect(241, 0, 5, 1024);
  // Centreline dashes.
  for (let y = 40; y < 1024; y += 80) g.fillRect(124, y, 8, 44);
  // Threshold bars at both ends.
  for (const y0 of [18, 966]) {
    for (let k = 0; k < 6; k++) g.fillRect(28 + k * 36, y0, 22, 40);
  }
  // Runway numbers: "36" at the south end (canvas bottom, read by a
  // northbound pilot) and "18" at the north end (canvas top, rotated).
  g.fillStyle = '#f2f2f2';
  g.font = 'bold 92px sans-serif';
  g.textAlign = 'center';
  g.fillText('36', 128, 880);
  g.save();
  g.translate(128, 180);
  g.rotate(Math.PI);
  g.fillText('18', 0, 0);
  g.restore();
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}

// The airfield: runway, taxiway, windsock, terminal, hangars, edge lights.
// The taxiway wears the Poly Haven aerial-asphalt texture (CC0, applied
// by assets.js once it loads — loadGameAssets resolves only after the
// texture is in, so staged shots never catch the flat grey).
let _taxiwayMesh = null;
let _taxiwayTexPending = null;
function applyTaxiwayTexture(tex) {
  if (!tex) return;
  if (_taxiwayMesh) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 10); // ~32 m per tile along the 320 m taxiway
    tex.anisotropy = 4;
    _taxiwayMesh.material.map = tex;
    _taxiwayMesh.material.needsUpdate = true;
  } else {
    _taxiwayTexPending = tex;
  }
}

function createAirfield(scene) {
  const group = new THREE.Group();
  const y = 2.3;

  const runway = new THREE.Mesh(
    new THREE.PlaneGeometry(RUNWAY.width, RUNWAY.length),
    new THREE.MeshLambertMaterial({ map: makeRunwayTexture() }),
  );
  runway.rotation.x = -Math.PI / 2;
  runway.position.set(RUNWAY.x, y, RUNWAY.z);
  group.add(runway);

  const taxi = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 320),
    new THREE.MeshLambertMaterial({ color: 0x333336 }),
  );
  taxi.rotation.x = -Math.PI / 2;
  taxi.position.set(60, y + 0.05, 120);
  group.add(taxi);
  _taxiwayMesh = taxi;
  if (_taxiwayTexPending) applyTaxiwayTexture(_taxiwayTexPending);

  // Windsock: striped cone on a pole, pointing with the wind.
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 9, 8),
    new THREE.MeshLambertMaterial({ color: 0xd8d8d8 }),
  );
  pole.position.set(40, y + 4.5, -380);
  group.add(pole);
  const sockTex = (() => {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 16;
    const g = c.getContext('2d');
    for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#f2f2f2' : '#e8641e'; g.fillRect(i * 16, 0, 16, 16); }
    return new THREE.CanvasTexture(c);
  })();
  const sock = new THREE.Mesh(
    new THREE.ConeGeometry(1.1, 4.5, 10, 1, true),
    new THREE.MeshLambertMaterial({ map: sockTex, side: THREE.DoubleSide }),
  );
  sock.rotation.z = Math.PI / 2 + 0.35;
  sock.position.set(42.2, y + 8.4, -380);
  group.add(sock);

  // Small terminal with a dark glass band.
  const terminal = new THREE.Mesh(
    new THREE.BoxGeometry(64, 11, 26),
    new THREE.MeshLambertMaterial({ color: 0xe6e0d2 }),
  );
  terminal.position.set(110, y + 5.5, 120);
  group.add(terminal);
  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(64.4, 3.2, 26.4),
    new THREE.MeshStandardMaterial({ color: 0x10222e, metalness: 0.8, roughness: 0.15 }),
  );
  glass.position.set(110, y + 7.5, 120);
  group.add(glass);

  // Two hangars with curved roofs.
  for (const hx of [105, 150]) {
    const hangar = new THREE.Mesh(
      new THREE.BoxGeometry(26, 9, 34),
      new THREE.MeshLambertMaterial({ color: 0xb9c0c4 }),
    );
    hangar.position.set(hx, y + 4.5, 30);
    group.add(hangar);
    const roof = new THREE.Mesh(
      new THREE.CylinderGeometry(13, 13, 34, 12, 1, false, 0, Math.PI),
      new THREE.MeshLambertMaterial({ color: 0x8a9296 }),
    );
    roof.rotation.z = Math.PI / 2;
    roof.rotation.y = Math.PI / 2;
    roof.position.set(hx, y + 9, 30);
    group.add(roof);
  }

  // Runway edge lights (emissive dots, like Infinite Flight's lit airfields).
  const lightGeo = new THREE.SphereGeometry(0.5, 8, 6);
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xfff2c0 });
  const edgeLights = new THREE.InstancedMesh(lightGeo, lightMat, 24);
  const m = new THREE.Matrix4();
  for (let i = 0; i < 12; i++) {
    const z = -420 + i * (840 / 11);
    m.setPosition(-RUNWAY.width / 2 - 2, y + 0.8, z);
    edgeLights.setMatrixAt(i * 2, m);
    m.setPosition(RUNWAY.width / 2 + 2, y + 0.8, z);
    edgeLights.setMatrixAt(i * 2 + 1, m);
  }
  group.add(edgeLights);

  scene.add(group);
  return group;
}
