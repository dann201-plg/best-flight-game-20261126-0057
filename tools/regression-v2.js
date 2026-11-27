// tools/regression-v2.js — Langit Nusantara v2 regression harness (Node).
// RECONSTRUCTED 2026-11-27 (REALISM ROUND 2): the original /tmp harness
// was lost when /tmp was cleared between sessions, so this file rebuilds
// it with the same coverage intent — flight model, terrain, missions,
// grading — plus the R2 additions (bank staging value, atlas UVs, interior
// file wiring, new asset files). It runs in Node with a minimal THREE
// stub (the pure-logic files need only Vector3/Color); the browser probe
// (tools/probe-v2-flow.mjs) covers the live DOM/Three.js behaviour.
// Usage: node tools/regression-v2.js  (exit 0 iff every test passes)
// Saved in the repo (not /tmp) so it survives session restarts.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'game', 'src');

// --- Minimal THREE stub: only what the pure-logic files touch. ---
class Vector3 {
  constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
  set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
  copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
  clone() { return new Vector3(this.x, this.y, this.z); }
  addScaledVector(v, s) { this.x += v.x * s; this.y += v.y * s; this.z += v.z * s; return this; }
  distanceTo(v) { return Math.hypot(this.x - v.x, this.y - v.y, this.z - v.z); }
  add(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; }
  normalize() { const l = Math.hypot(this.x, this.y, this.z) || 1; this.x /= l; this.y /= l; this.z /= l; return this; }
}
class Color {
  constructor(hex) { this.r = 0; this.g = 0; this.b = 0; if (hex !== undefined) this.set(hex); }
  set(hex) {
    if (typeof hex === 'number') { this.r = ((hex >> 16) & 255) / 255; this.g = ((hex >> 8) & 255) / 255; this.b = (hex & 255) / 255; }
    return this;
  }
  lerp(c, t) { this.r += (c.r - this.r) * t; this.g += (c.g - this.g) * t; this.b += (c.b - this.b) * t; return this; }
  multiplyScalar(s) { this.r *= s; this.g *= s; this.b *= s; return this; }
  copy(c) { this.r = c.r; this.g = c.g; this.b = c.b; return this; }
  clone() { const c = new Color(); c.r = this.r; c.g = this.g; c.b = this.b; return c; }
}
globalThis.THREE = { Vector3, Color };

// Load the pure-logic sources into this context (top-level const/function
// declarations land in the global lexical scope, visible to later runs).
for (const f of ['rng.js', 'flight.js', 'missions.js', 'terrain.js']) {
  vm.runInThisContext(fs.readFileSync(path.join(SRC, f), 'utf8'), { filename: f });
}

let passed = 0;
let failed = 0;
const failures = [];
function test(name, fn) {
  try {
    fn();
    passed++;
  } catch (e) {
    failed++;
    failures.push(name + ': ' + e.message);
    console.log('FAIL ' + name + ': ' + e.message);
  }
}
function eq(a, b, msg) { if (a !== b) throw new Error((msg || '') + ' expected ' + b + ', got ' + a); }
function approx(a, b, tol, msg) { if (Math.abs(a - b) > tol) throw new Error((msg || '') + ' expected ~' + b + ' ±' + tol + ', got ' + a); }
function ok(v, msg) { if (!v) throw new Error(msg || 'expected truthy, got ' + v); }
function mkWorld(ring) {
  return { terrainHeightAt, activeRing: ring || null, runway: RUNWAY };
}
const NO_INPUT = { pitch: 0, roll: 0, throttle: 0, rudder: 0, brake: false };
function stepN(st, input, n, world) {
  let ev = '';
  for (let i = 0; i < n; i++) { const e = updateFlightModel(st, input, 1 / 60, world); if (e) ev = e; }
  return ev;
}

// --- Flight model ---
test('initial state', () => {
  const st = createFlightModel();
  eq(st.speed, 0); eq(st.fuel, 100); eq(st.status, 'ready'); eq(st.ringsTotal, 5);
});
test('throttle spools and speed rises', () => {
  const st = createFlightModel();
  st.status = 'flying'; st.airborne = true; st.position.y = 100;
  // 10 s at full throttle: spool ~2 s, then speed converges toward 80.
  stepN(st, { pitch: 0, roll: 0, throttle: 1, rudder: 0, brake: false }, 600, mkWorld());
  ok(st.throttle > 0.9, 'throttle ' + st.throttle);
  ok(st.speed > 45, 'speed ' + st.speed);
});
test('takeoff on runway pull', () => {
  const st = createFlightModel();
  st.status = 'flying'; st.position.set(0, 4.6, 150); st.speed = 40; st.pitch = 0.1;
  stepN(st, { pitch: 0.5, roll: 0, throttle: 1, rudder: 0, brake: false }, 30, mkWorld());
  ok(st.airborne, 'still on ground');
});
test('level flight holds altitude', () => {
  const st = createFlightModel();
  st.status = 'flying'; st.airborne = true; st.position.set(0, 120, 0); st.speed = 55; st.throttle = 0.7;
  stepN(st, { pitch: 0, roll: 0, throttle: 0.7, rudder: 0, brake: false }, 300, mkWorld());
  approx(st.position.y, 120, 25, 'altitude drifted to ' + st.position.y);
});
test('stall below 26 m/s', () => {
  const st = createFlightModel();
  st.status = 'flying'; st.airborne = true; st.position.set(0, 150, 0); st.speed = 20; st.throttle = 0.2;
  const ev = stepN(st, NO_INPUT, 30, mkWorld());
  ok(st.stalling, 'not stalling at 20 m/s');
  eq(ev, 'STALL');
});
test('bank expo: input -0.63 settles near -0.38 rad (R2 cover staging)', () => {
  const st = createFlightModel();
  st.status = 'flying'; st.airborne = true; st.position.set(800, 140, -550); st.speed = 58; st.throttle = 0.75;
  st.roll = -0.38;
  stepN(st, { pitch: 0, roll: -0.63, throttle: 0, rudder: 0, brake: false }, 45, mkWorld());
  approx(st.roll, -0.38, 0.08, 'roll settled at ' + st.roll);
  ok(!st.rolling, 'rate mode must not trigger below |input| 0.95');
});
test('banked turn changes heading', () => {
  const st = createFlightModel();
  st.status = 'flying'; st.airborne = true; st.position.set(0, 140, 0); st.speed = 58; st.throttle = 0.75;
  const h0 = st.heading;
  stepN(st, { pitch: 0, roll: -0.63, throttle: 0, rudder: 0, brake: false }, 300, mkWorld());
  ok(Math.abs(st.heading - h0) > 0.05, 'heading did not change: ' + st.heading);
});
test('full aileron enters rolling mode', () => {
  const st = createFlightModel();
  st.status = 'flying'; st.airborne = true; st.position.set(0, 190, 0); st.speed = 60; st.throttle = 0.8;
  st.roll = 0.9;
  stepN(st, { pitch: 0, roll: 1, throttle: 0, rudder: 0, brake: false }, 120, mkWorld());
  ok(st.rolling, 'rolling mode did not engage');
  ok(Math.abs(st.roll) > 1.5, 'roll did not progress: ' + st.roll);
});
test('full back-stick above 60 m enters loop mode', () => {
  const st = createFlightModel();
  st.status = 'flying'; st.airborne = true; st.position.set(0, 150, 0); st.speed = 60; st.throttle = 0.8;
  st.pitch = 0.3;
  stepN(st, { pitch: 1, roll: 0, throttle: 0, rudder: 0, brake: false }, 120, mkWorld());
  ok(st.looping, 'loop mode did not engage');
});
test('ring pass scores +100', () => {
  const st = createFlightModel();
  st.status = 'flying'; st.airborne = true; st.position.set(400, 90, -500); st.speed = 50; st.throttle = 0.6;
  const ring = { position: new Vector3(400, 90, -500) };
  // One step only: the model scores every step spent inside the ring
  // (the game consumes the ring via updateRingStates after the event).
  const ev = stepN(st, NO_INPUT, 1, mkWorld(ring));
  eq(ev, 'RING'); eq(st.ringsPassed, 1); eq(st.score, 100);
});
test('gentle runway landing grades and scores', () => {
  const st = createFlightModel();
  st.status = 'flying'; st.airborne = true; st.airborneTime = 10;
  st.position.set(0, 4.9, 200); st.speed = 40; st.throttle = 0.35; st.pitch = -0.02; st.roll = 0;
  st.vy = -1; st.prevY = 5.0;
  const ev = stepN(st, { pitch: -0.1, roll: 0, throttle: 0, rudder: 0, brake: false }, 120, mkWorld());
  eq(ev, 'LANDED'); eq(st.status, 'landed');
  ok(st.landing && st.landing.sink >= 0, 'no landing metrics');
  ok(st.score >= 250, 'landing score ' + st.score);
});
test('terrain impact crashes with a reason', () => {
  const st = createFlightModel();
  st.status = 'flying'; st.airborne = true; st.airborneTime = 10;
  st.position.set(1500, 30, -1000); st.speed = 45; st.pitch = -0.3; st.throttle = 0.4;
  const ev = stepN(st, { pitch: -0.5, roll: 0, throttle: 0, rudder: 0, brake: false }, 600, mkWorld());
  eq(ev, 'CRASH'); eq(st.status, 'crashed');
  ok(st.crash && (st.crash.reason === 'hard' || st.crash.reason === 'terrain'), 'crash reason ' + (st.crash && st.crash.reason));
});
test('runway overrun crashes', () => {
  const st = createFlightModel();
  // North end, heading 0 (north, -z): 20 m to the overrun line at |z| 520.
  st.status = 'flying'; st.position.set(0, 4.6, -500); st.speed = 40; st.throttle = 0.8;
  const ev = stepN(st, NO_INPUT, 60, mkWorld());
  eq(ev, 'OVERRUN'); eq(st.status, 'crashed');
});
test('fuel burns and empty tank kills throttle', () => {
  const st = createFlightModel();
  st.status = 'flying'; st.airborne = true; st.position.set(0, 150, 0); st.speed = 50; st.fuel = 0.5;
  stepN(st, { pitch: 0, roll: 0, throttle: 1, rudder: 0, brake: false }, 300, mkWorld());
  eq(st.fuel, 0);
  eq(st.throttle, 0);
});
test('timer expiry is TIME UP', () => {
  const st = createFlightModel();
  st.status = 'flying'; st.airborne = true; st.position.set(0, 150, 0); st.speed = 50; st.timeLeft = 0.05;
  const ev = stepN(st, NO_INPUT, 10, mkWorld());
  eq(ev, 'TIME UP'); eq(st.status, 'timeout');
});
test('gradeLandingMetrics S/A/B/C', () => {
  eq(gradeLandingMetrics({ sink: 1.0, offset: 2, bankDeg: 3 }).grade, 'S');
  eq(gradeLandingMetrics({ sink: 2.0, offset: 5, bankDeg: 6 }).grade, 'A');
  eq(gradeLandingMetrics({ sink: 3.5, offset: 9, bankDeg: 10 }).grade, 'B');
  eq(gradeLandingMetrics({ sink: 6.0, offset: 20, bankDeg: 20 }).grade, 'C');
  eq(gradeLandingMetrics(null).grade, 'C');
  eq(gradeLandingMetrics({ sink: 1.0, offset: 2, bankDeg: 3 }).points, 300);
});
test('headingDegrees wraps', () => {
  const st = createFlightModel();
  st.heading = -Math.PI / 2; eq(headingDegrees(st), 270);
  st.heading = 3 * Math.PI; eq(headingDegrees(st), 180);
});
test('knots and feet conversions', () => {
  const st = createFlightModel();
  st.speed = 50; eq(knots(st), 97);
  st.position.y = 100; eq(feet(st), 328);
});
test('forwardVector north and east', () => {
  const n = forwardVector(0, 0);
  approx(n.x, 0, 1e-9); approx(n.z, -1, 1e-9);
  const e = forwardVector(Math.PI / 2, 0);
  approx(e.x, 1, 1e-9); approx(e.z, 0, 1e-9);
});
test('wrapPi', () => {
  approx(wrapPi(3 * Math.PI), -Math.PI, 1e-9);
  approx(wrapPi(4), 4 - 2 * Math.PI, 1e-9);
});

// --- Terrain ---
test('runway and approach corridor are flat at 2 m', () => {
  approx(terrainHeightAt(0, 0), 2, 0.6);
  approx(terrainHeightAt(0, 800), 2, 0.6);
  approx(terrainHeightAt(0, -400), 2, 0.6);
});
test('volcano summit is high', () => {
  ok(terrainHeightAt(VOLCANO.x, VOLCANO.z) > 300, 'summit ' + terrainHeightAt(VOLCANO.x, VOLCANO.z));
});
test('sea floor is below zero far out', () => {
  ok(terrainHeightAt(0, 3400) < 0, 'h(0,3400)=' + terrainHeightAt(0, 3400));
  ok(terrainHeightAt(3400, 0) < 0, 'h(3400,0)=' + terrainHeightAt(3400, 0));
});
test('town ground is flat at 7 m', () => {
  approx(terrainHeightAt(TOWN.x, TOWN.z), 7, 0.6);
});
test('river channel is carved to ~1 m', () => {
  approx(terrainHeightAt(riverX(0), 0), 1, 0.6);
});
test('coastline is indented, not a circle (R2)', () => {
  const hs = [];
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    hs.push(terrainHeightAt(Math.cos(a) * 2700, Math.sin(a) * 2700));
  }
  const spread = Math.max(...hs) - Math.min(...hs);
  ok(spread > 5, 'coast heights too uniform, spread ' + spread);
});
test('groundQuad returns valid biome quadrants (R2 atlas)', () => {
  const valid = new Set(['0,0', '1,0', '0,1', '1,1']);
  for (let i = 0; i < 200; i++) {
    const x = -2600 + (i * 37) % 5200;
    const z = -2600 + (i * 91) % 5200;
    const q = groundQuad(x, z, terrainHeightAt(x, z));
    ok(valid.has(q.join(',')), 'bad quad ' + q + ' at ' + x + ',' + z);
  }
  eq(groundQuad(0, 3400, terrainHeightAt(0, 3400)).join(','), '1,1');
  eq(groundQuad(VOLCANO.x, VOLCANO.z, 380).join(','), '1,0');
});
test('biomeColor sand is sandy', () => {
  const c = new Color();
  biomeColor(0, 3400, -5, c);
  ok(c.r > 0.7 && c.r < 0.95 && c.g > 0.6 && c.g < 0.85 && c.b > 0.4 && c.b < 0.65,
    'sand color ' + [c.r, c.g, c.b].map((v) => v.toFixed(2)).join(','));
});

// --- Missions ---
test('six named missions', () => {
  eq(MISSIONS.length, 6);
  const names = MISSIONS.map((m) => m.name);
  for (const n of ['POS MERPATI', 'KAWAH BERAPI', 'BADAI PENYELAMAT', 'ANGIN SAMPING', 'MEDEVAC SENJA', 'LINTAS PULAU']) {
    ok(names.includes(n), 'missing ' + n);
  }
});
test('every mission has rings, fuel and a time limit', () => {
  for (const m of MISSIONS) {
    ok(m.rings.length >= 2 && m.rings.length <= 5, m.name + ' rings ' + m.rings.length);
    ok(m.fuel >= 70 && m.fuel <= 100, m.name + ' fuel ' + m.fuel);
    ok(m.timeLimit >= 160 && m.timeLimit <= 280, m.name + ' time ' + m.timeLimit);
  }
});
test('mission specials', () => {
  eq(MISSIONS[3].strict, true);
  eq(MISSIONS[4].sinkLimit, 2.0);
  eq(MISSIONS[2].fuel, 70);
});
test('medalForGrade', () => {
  eq(medalForGrade('S'), 'EMAS');
  eq(medalForGrade('A'), 'PERAK');
  eq(medalForGrade('B'), 'PERUNGGU');
  eq(medalForGrade('C'), null);
});
test('createPilotProgress initial', () => {
  const p = createPilotProgress();
  eq(p.score, 0); eq(Object.keys(p.medals).length, 0); eq(Object.keys(p.completed).length, 0);
});

// --- R2 source / file checks ---
test('R2 files and wiring exist', () => {
  const interior = fs.readFileSync(path.join(SRC, 'interior.js'), 'utf8');
  ok(interior.includes('function createCockpitInterior'), 'no createCockpitInterior');
  ok(interior.includes('setVisible'), 'no setVisible');
  const html = fs.readFileSync(path.join(ROOT, 'game', 'index.html'), 'utf8');
  ok(html.includes('src/interior.js'), 'index.html does not load interior.js');
  const game = fs.readFileSync(path.join(SRC, 'game.js'), 'utf8');
  ok(game.includes('setCockpitMode'), 'no setCockpitMode helper');
  ok(game.includes('roll = -0.87'), 'cover mid-roll pose missing');
  ok(game.includes('roll: -0.63'), 'cover bank input missing');
  ok(game.includes('1.7, -2.2'), 'raised cockpit seat missing');
});
test('R2 terrain source: 220 segments, UV atlas, shrubs', () => {
  const t = fs.readFileSync(path.join(SRC, 'terrain.js'), 'utf8');
  ok(t.includes('220, 220'), 'terrain still 150 segments');
  ok(t.includes('groundQuad'), 'no groundQuad');
  ok(t.includes('setXY'), 'no per-vertex UV rewrite');
  ok(t.includes('shrubGeo'), 'no shrubs');
  ok(t.includes('coast'), 'no coastline noise');
  ok(t.includes('applyTaxiwayTexture'), 'no taxiway texture hook');
});
test('R2 assets vendored', () => {
  for (const f of ['ground_atlas_2k.jpg', 'aerial_asphalt_01_diff_1k.jpg', 'qwantani_sunset_env_2k.jpg', 'grass_ground_nor_1k.jpg']) {
    ok(fs.existsSync(path.join(ROOT, 'game', 'assets', f)), 'missing asset ' + f);
  }
  const notice = fs.readFileSync(path.join(ROOT, 'game', 'assets', 'NOTICE.md'), 'utf8');
  ok(notice.includes('ground_atlas_2k'), 'NOTICE does not document the atlas');
  ok(notice.includes('aerial_asphalt_01'), 'NOTICE does not document the asphalt');
});
test('aircraft detail present (R2 procedural path)', () => {
  const a = fs.readFileSync(path.join(SRC, 'aircraft.js'), 'utf8');
  ok(a.includes('winglet'), 'no winglets');
  ok(a.includes('de-ice') || a.includes('boot'), 'no de-ice boots');
  ok(a.includes('fairing'), 'no flap track fairings');
});
test('shots and screenshots intact', () => {
  const shots = JSON.parse(fs.readFileSync(path.join(ROOT, 'shots.json'), 'utf8'));
  eq(shots.length, 4);
  for (const s of shots) {
    const f = path.join(ROOT, 'screenshots', s.name + '.jpg');
    ok(fs.existsSync(f), 'missing screenshot ' + f);
    const sz = fs.statSync(f).size;
    ok(sz > 10000 && sz <= 262144, s.name + ' size ' + sz);
  }
});

console.log(`\nregression: ${passed} passed, ${failed} failed`);
if (failed) {
  console.log('failures:\n' + failures.map((f) => ' - ' + f).join('\n'));
  process.exit(1);
}
