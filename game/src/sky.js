/* sky.js — golden-hour sky dome, sun, clouds and haze for Langit Nusantara.
   References: MSFS (volumetric clouds, light scattering, low sun) and War
   Thunder (non-repeating randomized clouds, godray glow, sharp horizon). */

// Low golden-hour sun, west-northwest: visible when flying north.
const SUN_DIR = new THREE.Vector3(-0.62, 0.24, -0.74).normalize();
const SUN_COLOR = new THREE.Color(0xffd9a0);
const HAZE_COLOR = new THREE.Color(0xf2c9a0);

// Soft round cloud puff texture, drawn once on a canvas. Two variants
// (round puffs / stretched streaks) so no two formations look alike.
// A vertical gradient darkens the base: fake self-shadowing inside the
// texture, so the cloud's underside reads darker than its sunlit top.
function makeCloudTexture(rng, streak) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const g = c.getContext('2d');
  const puffs = streak
    ? [[128, 70, 46], [70, 78, 30], [190, 74, 32], [40, 84, 20], [220, 84, 20], [128, 88, 40]]
    : [[128, 78, 62], [82, 86, 44], [176, 84, 46], [108, 62, 40],
       [152, 62, 38], [60, 96, 30], [200, 96, 32], [128, 96, 52]];
  // Jitter puff positions a little so the two textures differ per call.
  for (const [x, y, r] of puffs) {
    const jx = x + (rng() - 0.5) * 14;
    const jy = y + (rng() - 0.5) * 8;
    const jr = r * (0.9 + rng() * 0.2);
    const grad = g.createRadialGradient(jx, jy, 0, jx, jy, jr);
    grad.addColorStop(0, 'rgba(255,255,255,0.85)');
    grad.addColorStop(0.6, 'rgba(255,250,240,0.45)');
    grad.addColorStop(1, 'rgba(255,250,240,0)');
    g.fillStyle = grad;
    g.beginPath();
    g.arc(jx, jy, jr, 0, Math.PI * 2);
    g.fill();
  }
  g.globalCompositeOperation = 'source-atop';
  const vg = g.createLinearGradient(0, 0, 0, 128);
  vg.addColorStop(0, 'rgba(255,240,220,0)');
  vg.addColorStop(1, 'rgba(150,140,170,0.15)');
  g.fillStyle = vg;
  g.fillRect(0, 0, 256, 128);
  g.globalCompositeOperation = 'source-over';
  const tex = new THREE.CanvasTexture(c);
  return tex;
}

// Radial sun-glow texture for the sun sprite and godray fake.
function makeGlowTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255,240,200,1)');
  grad.addColorStop(0.25, 'rgba(255,210,140,0.55)');
  grad.addColorStop(0.6, 'rgba(255,180,110,0.18)');
  grad.addColorStop(1, 'rgba(255,180,110,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

// Gradient sky dome with a warm horizon band and a sun disc baked in.
function makeSkyDome() {
  const geo = new THREE.SphereGeometry(3200, 32, 18);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      sunDir: { value: SUN_DIR },
      topColor: { value: new THREE.Color(0x2e6cb0) },
      midColor: { value: new THREE.Color(0x9cc3de) },
      horizonColor: { value: new THREE.Color(0xf7c98b) },
      sunColor: { value: new THREE.Color(0xffe9b8) },
    },
    vertexShader: [
      'varying vec3 vDir;',
      'void main() {',
      '  vDir = normalize(position);',
      '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
      '}',
    ].join('\n'),
    fragmentShader: [
      'varying vec3 vDir;',
      'uniform vec3 sunDir; uniform vec3 topColor; uniform vec3 midColor;',
      'uniform vec3 horizonColor; uniform vec3 sunColor;',
      'void main() {',
      '  float h = clamp(vDir.y, -0.08, 1.0);',
      '  vec3 col = mix(horizonColor, midColor, smoothstep(0.0, 0.22, h));',
      '  col = mix(col, topColor, smoothstep(0.18, 0.65, h));',
      '  float s = max(dot(normalize(vDir), normalize(sunDir)), 0.0);',
      '  col += sunColor * pow(s, 220.0) * 0.65;',
      '  col += sunColor * pow(s, 32.0) * 0.12;',
      '  col += sunColor * pow(s, 8.0) * 0.10;',
      '  gl_FragColor = vec4(col, 1.0);',
      '}',
    ].join('\n'),
  });
  const dome = new THREE.Mesh(geo, mat);
  dome.renderOrder = -10;
  return dome;
}

// Build the whole sky: dome, sun glow sprite, cloud layers, low fog bank.
function createSky(scene, rng) {
  scene.add(makeSkyDome());

  const glowTex = makeGlowTexture();
  // FINAL POLISH: softer glow (was opacity 0.35, scale 180) — the old
  // sprite blew out into a white blob at the cockpit shot's top-left.
  const sun = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, opacity: 0.25,
  }));
  sun.position.copy(SUN_DIR).multiplyScalar(2900);
  sun.scale.set(150, 150, 1);
  scene.add(sun);

  // Two cloud textures (round puffs + stretched streaks) so no two
  // formations look alike — War Thunder's non-repeating sky trick.
  const cloudTexRound = makeCloudTexture(rng, false);
  const cloudTexStreak = makeCloudTexture(rng, true);
  const clouds = [];
  function addCloudSprite(tex, x, y, z, w, hRatio, opacity, color, drift, rot) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex, transparent: true, depthWrite: false, opacity, color,
    }));
    sp.position.set(x, y, z);
    sp.scale.set(w, w * hRatio, 1);
    sp.material.rotation = rot;
    sp.userData.drift = drift;
    scene.add(sp);
    clouds.push(sp);
    return sp;
  }
  // Low cumulus: one cloud = a cluster of 5-9 sprites — a wide flat base
  // (dark, cold grey = self-shadowed underside) with bright warm tops.
  // All sprites in a formation share one drift so it does not smear apart.
  for (let f = 0; f < 11; f++) {
    const cx = rngRange(rng, -2600, 2600);
    const cy = rngRange(rng, 250, 480);
    const cz = rngRange(rng, -2600, 2600);
    const drift = rngRange(rng, 1.5, 3.5);
    const sizeClass = rng();
    const baseW = sizeClass < 0.55 ? rngRange(rng, 220, 360)
      : sizeClass < 0.9 ? rngRange(rng, 400, 620) : rngRange(rng, 750, 1100);
    const sunSide = Math.sign(cx - SUN_DIR.x * 2000) || 1;
    addCloudSprite(cloudTexRound, cx, cy, cz, baseW, 0.24,
      rngRange(rng, 0.6, 0.75), 0xf2eef8, drift, rngRange(rng, -0.26, 0.26));
    const puffs = 3 + Math.floor(rng() * 4);
    for (let k = 0; k < puffs; k++) {
      const px = cx + rngRange(rng, -0.32, 0.32) * baseW;
      const py = cy + rngRange(rng, 0.05, 0.22) * baseW * 0.42;
      const pz = cz + rngRange(rng, -0.18, 0.18) * baseW;
      const pw = baseW * rngRange(rng, 0.35, 0.6);
      addCloudSprite(rng() < 0.7 ? cloudTexRound : cloudTexStreak, px, py, pz,
        pw, rngRange(rng, 0.35, 0.55), rngRange(rng, 0.7, 0.9), 0xfff6e8,
        drift, rngRange(rng, -0.26, 0.26));
    }
    // Silver lining: a thin additive sprite on the sun-facing edge.
    const silver = addCloudSprite(cloudTexStreak, cx + sunSide * baseW * 0.32,
      cy + baseW * 0.06, cz, baseW * 0.5, 0.2, 0.2, 0xffe9b8, drift, 0);
    silver.material.blending = THREE.AdditiveBlending;
  }
  // Stratocumulus deck: wide rippled slabs, mid height.
  for (let i = 0; i < 9; i++) {
    addCloudSprite(cloudTexStreak,
      rngRange(rng, -2600, 2600), rngRange(rng, 560, 720), rngRange(rng, -2600, 2600),
      rngRange(rng, 700, 1300), rngRange(rng, 0.12, 0.2), rngRange(rng, 0.45, 0.6),
      0xf2ead9, rngRange(rng, 1.0, 2.0), rngRange(rng, -0.2, 0.2));
  }
  // High thin cirrus, stretched wide.
  for (let i = 0; i < 12; i++) {
    addCloudSprite(cloudTexStreak,
      rngRange(rng, -2800, 2800), rngRange(rng, 620, 860), rngRange(rng, -2800, 2800),
      rngRange(rng, 700, 1300), 0.1, rngRange(rng, 0.25, 0.45),
      0xffffff, rngRange(rng, 0.8, 1.6), rngRange(rng, -0.15, 0.15));
  }
  // One distant cumulonimbus tower as a horizon landmark: dark base,
  // stacked puffs, anvil top.
  {
    const tx = -2100, tz = -2200;
    addCloudSprite(cloudTexRound, tx, 260, tz, 700, 0.3, 0.75, 0xb5b0cc, 1.2, 0);
    addCloudSprite(cloudTexRound, tx + 80, 480, tz, 520, 0.5, 0.8, 0xcfc8de, 1.2, 0.1);
    addCloudSprite(cloudTexRound, tx - 60, 700, tz, 420, 0.55, 0.85, 0xfff6e8, 1.2, -0.1);
    addCloudSprite(cloudTexStreak, tx, 900, tz, 900, 0.16, 0.6, 0xfff2dd, 1.2, 0);
  }
  // Low fog bank hugging the sea at dawn — warm-tinted so the horizon
  // melts into the golden hour instead of a cold white wall.
  for (let i = 0; i < 10; i++) {
    addCloudSprite(cloudTexRound,
      rngRange(rng, -2400, 2400), rngRange(rng, 18, 60), rngRange(rng, -2400, 2400),
      rngRange(rng, 900, 1500), 0.1, rngRange(rng, 0.22, 0.34),
      0xf7dcbc, rngRange(rng, 0.5, 1.0), 0);
  }

  // Golden-hour lighting: warm low sun + cool sky hemisphere.
  const sunLight = new THREE.DirectionalLight(SUN_COLOR, 1.55);
  sunLight.position.copy(SUN_DIR).multiplyScalar(800);
  scene.add(sunLight);
  scene.add(new THREE.HemisphereLight(0x9fc4e8, 0x5a6b46, 0.75));
  scene.fog = new THREE.FogExp2(HAZE_COLOR, 0.00016); // layered haze: the far horizon dissolves warm instead of ending in a hard edge

  return {
    // Slow wind drift; sprites wrap around the world edge.
    update(dt) {
      for (const c of clouds) {
        c.position.x += c.userData.drift * dt;
        if (c.position.x > 3000) c.position.x = -3000;
      }
    },
  };
}
