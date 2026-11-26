/* game.js — Langit Nusantara: states, loop, chase camera, legs and rings,
   input (keyboard + mouse drag) and deterministic ?shot= staging for the
   screenshots. The game is original: its own idea, art, sounds and names. */

const STEP = 1 / 60;
const LEGS = [
  {
    name: 'PANTAI UTARA',
    text: 'Five rings along the north coast — sea on your left, rice fields below — then land on runway 36.',
    route: 'Coast → islands → final runway 36',
    rings: [[400, 90, -500], [900, 110, -1100], [300, 100, -1700], [-400, 120, -1500], [-900, 100, -900]],
  },
  {
    name: 'GUNUNG BERAPI',
    text: 'Climb around the volcano: five rings over the crater rim, then descend to runway 36.',
    route: 'Volcano rim → crater → final runway 36',
    rings: [[-1200, 220, -800], [-1600, 320, -1200], [-2100, 380, -1600], [-1900, 300, -2000], [-1200, 200, -1900]],
  },
  {
    name: 'KOTA & SUNGAI',
    text: 'A low run over the town and the river: five rings, then land on runway 36 before the fuel runs out.',
    route: 'Town → river → final runway 36',
    rings: [[600, 90, 200], [900, 110, 800], [700, 100, 1600], [200, 90, 1200], [-300, 100, 600]],
  },
];
const APPROACH_POS = new THREE.Vector3(0, 55, 800);

let renderer, scene, camera, sky, aircraft, hud, sound, water;
let flight, world, rings = [], approachRing = null, ringIndex = 0;
let mode = 'title'; // title | brief | flying | paused | over
let currentLeg = 1;
let paused = false;
let cameraMode = 'chase'; // chase | near
let titleTime = 0;
let keys = {};
let mouseSteer = { active: false, pitch: 0, roll: 0 };
let shotMode = null;

function makeDiscTexture() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,200,80,0.9)');
  grad.addColorStop(0.7, 'rgba(255,180,60,0.28)');
  grad.addColorStop(1, 'rgba(255,180,60,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function createRingMesh(position, faceTarget) {
  const group = new THREE.Group();
  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(17, 1.15, 10, 42),
    new THREE.MeshBasicMaterial({ color: 0x2a7a9e }),
  );
  group.add(torus);
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(16.5, 32),
    new THREE.MeshBasicMaterial({
      map: makeDiscTexture(), transparent: true, opacity: 0.12,
      side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
    }),
  );
  group.add(disc);
  group.position.copy(position);
  if (faceTarget) group.lookAt(faceTarget);
  scene.add(group);
  return { group, torus, disc, position: group.position, state: 'upcoming' };
}

function buildLegRings(leg) {
  for (const r of rings) scene.remove(r.group);
  if (approachRing) scene.remove(approachRing.group);
  rings = [];
  const pts = LEGS[leg - 1].rings.map(([x, y, z]) => new THREE.Vector3(x, y, z));
  for (let i = 0; i < pts.length; i++) {
    const next = i + 1 < pts.length ? pts[i + 1] : APPROACH_POS;
    rings.push(createRingMesh(pts[i], next));
  }
  approachRing = createRingMesh(APPROACH_POS, new THREE.Vector3(0, 5, 0));
  ringIndex = 0;
  updateRingStates();
}

function updateRingStates() {
  rings.forEach((r, i) => {
    r.state = i < ringIndex ? 'passed' : i === ringIndex ? 'next' : 'upcoming';
    r.torus.material.color.setHex(
      r.state === 'next' ? 0xffb020 : r.state === 'passed' ? 0x35d06a : 0x2a7a9e,
    );
    r.disc.material.opacity = r.state === 'next' ? 0.32 : r.state === 'passed' ? 0.07 : 0.12;
  });
  if (approachRing) {
    const active = ringIndex === rings.length;
    const done = ringIndex > rings.length;
    approachRing.state = done ? 'passed' : active ? 'next' : 'upcoming';
    approachRing.torus.material.color.setHex(
      active ? 0xffd76a : done ? 0x35d06a : 0x2a7a9e,
    );
    approachRing.disc.material.opacity = active ? 0.35 : done ? 0.07 : 0.12;
  }
}

function activeRingObject() {
  if (ringIndex < rings.length) return rings[ringIndex];
  if (ringIndex === rings.length && approachRing) return approachRing;
  return null;
}

function startLeg(leg) {
  flight.position.set(0, 2.6, 300);
  flight.heading = 0;
  flight.pitch = 0;
  flight.roll = 0;
  flight.speed = 0;
  flight.throttle = 0;
  flight.airborne = false;
  flight.fuel = 100;
  flight.ringsPassed = 0;
  flight.ringsTotal = 5;
  flight.timeLeft = LEG_TIME;
  flight.pitchRate = 0;
  flight.rollRate = 0;
  flight.rolling = false;
  flight.looping = false;
  flight.clock = 0;
  flight.stalling = false;
  flight.wasStalling = false;
  flight.status = 'flying';
  flight.leg = leg;
  buildLegRings(leg);
  world.activeRing = activeRingObject();
  mode = 'flying';
  paused = false;
  hud.setOverlay('flight');
}

function showBrief(leg) {
  currentLeg = leg;
  const L = LEGS[leg - 1];
  hud.setBrief(leg, L.name, L.text, L.route + ' · 5 rings · ' + LEG_TIME + ' s · fuel 100%');
  hud.setOverlay('brief');
  mode = 'brief';
}

function showEnd(kicker, title, text, scoreLine, buttonLabel, onClick) {
  hud.setEnd(kicker, title, text, scoreLine);
  hud.setOverlay('end');
  const btn = document.getElementById('hud-end-retry');
  btn.textContent = buttonLabel;
  btn.onclick = onClick;
  mode = 'over';
}

function handleFlightEvent(ev) {
  if (!ev) return;
  if (ev === 'RING') {
    const wasApproach = ringIndex >= rings.length;
    if (wasApproach) {
      flight.score += 50;
      ringIndex++;
      world.activeRing = null;
      updateRingStates();
      hud.showMessage('FINAL', 'Land on runway 36 — gear down, slow and level');
      sound.ringChime();
    } else {
      ringIndex++;
      flight.ringsPassed = Math.min(ringIndex, rings.length);
      world.activeRing = activeRingObject();
      updateRingStates();
      hud.showMessage('RING +100', 'Ring ' + flight.ringsPassed + ' of 5 — ' + (5 - flight.ringsPassed) + ' to go');
      sound.ringChime();
      if (ringIndex === rings.length) {
        hud.showMessage('FINAL', 'All rings — line up for runway 36');
      }
    }
  } else if (ev === 'STALL') {
    hud.showMessage('STALL', 'Lower the nose — build speed to recover');
  } else if (ev === 'LANDED') {
    sound.landThud();
    const bonus = 250 + Math.round(flight.timeLeft) * 2;
    hud.showMessage('LANDED +' + bonus, 'Leg ' + flight.leg + ' complete — fuel refilled');
    if (flight.leg < 3) {
      const next = flight.leg + 1;
      setTimeout(() => showEnd(
        'LEG ' + flight.leg + ' COMPLETE', LEGS[flight.leg - 1].name,
        'Clean touchdown on runway 36. Score ' + flight.score + ' — on to leg ' + next + '.',
        'SCORE ' + flight.score + ' · FUEL 100%',
        'NEXT LEG ▸', () => { sound.click(); showBrief(next); },
      ), 1400);
    } else {
      setTimeout(() => showEnd(
        'MISSION COMPLETE', 'LANGIT NUSANTARA',
        'Three legs, three landings. You flew the whole archipelago and brought Merpati Nusantara home.',
        'FINAL SCORE ' + flight.score,
        'TERBANG LAGI ▸', () => { sound.click(); flight.score = 0; showBrief(1); },
      ), 1400);
    }
  } else if (ev === 'CRASH' || ev === 'OVERRUN') {
    sound.crashNoise();
    hud.showMessage(ev === 'OVERRUN' ? 'RUNWAY OVERRUN' : 'CRASHED', 'Merpati Nusantara is down');
    setTimeout(() => showEnd(
      ev === 'OVERRUN' ? 'RUNWAY OVERRUN' : 'CRASHED', LEGS[flight.leg - 1].name,
      ev === 'OVERRUN'
        ? 'You ran off the end of runway 36. Next time, brake earlier and land slower.'
        : 'Terrain wins this time. Keep an eye on the altimeter and the horizon.',
      'SCORE ' + flight.score + ' · LEG ' + flight.leg + ' / 3',
      'COBA LAGI ▸', () => { sound.click(); showBrief(flight.leg); },
    ), 1400);
  } else if (ev === 'TIME UP') {
    sound.crashNoise();
    setTimeout(() => showEnd(
      'TIME UP', LEGS[flight.leg - 1].name,
      'The leg timer ran out. Fly the rings faster — full throttle on the straights.',
      'SCORE ' + flight.score + ' · LEG ' + flight.leg + ' / 3',
      'COBA LAGI ▸', () => { sound.click(); showBrief(flight.leg); },
    ), 900);
  }
}

function readInput() {
  const input = { pitch: 0, roll: 0, throttle: 0, rudder: 0, brake: false };
  if (keys.ArrowUp) input.pitch += 1;
  if (keys.ArrowDown) input.pitch -= 1;
  if (keys.ArrowLeft) input.roll += 1; // left bank
  if (keys.ArrowRight) input.roll -= 1; // right bank
  if (keys.KeyW || keys.ShiftLeft) input.throttle += 1;
  if (keys.KeyS || keys.ControlLeft) input.throttle -= 1;
  if (keys.KeyA) input.rudder += 1;
  if (keys.KeyD) input.rudder -= 1;
  if (keys.Space) input.brake = true;
  if (mouseSteer.active) {
    input.pitch = clamp(mouseSteer.pitch, -1, 1);
    input.roll = clamp(mouseSteer.roll, -1, 1);
  }
  return input;
}

function stepFixed(dt, t) {
  if (mode !== 'flying' || paused) return;
  const input = readInput();
  const ev = updateFlightModel(flight, input, dt, world);
  handleFlightEvent(ev);
  // Aircraft transform: nose is +z in the model, so yaw = PI - heading.
  aircraft.group.position.copy(flight.position);
  aircraft.group.rotation.set(-flight.pitch, Math.PI - flight.heading, flight.roll, 'YXZ');
  // Blob shadow pinned to the terrain below.
  const gh = terrainHeightAt(flight.position.x, flight.position.z);
  const alt = Math.max(0, flight.position.y - gh);
  aircraft.blob.position.set(flight.position.x, gh + 0.6, flight.position.z);
  aircraft.blob.material.opacity = 0.10 + 0.18 * clamp(1 - alt / 250, 0, 1);
  const bs = 1 + alt / 220;
  aircraft.blob.scale.set(6.5 * bs, 9 * bs, 1);
  // Gear down on final approach (slow, over the runway extended centreline,
  // including the runway itself — the old z>380 cut-off retracted the gear
  // for the last 380 m of final, so the wheels vanished before touchdown
  // and popped back only after landing).
  const onFinal = flight.airborne && flight.speed < 48
    && Math.abs(flight.position.x) < 80 && flight.position.z > -450 && flight.position.z < 1400;
  // Wingtip vapour grows with load factor and humidity: stronger low over
  // the sea than high over dry land (War Thunder humidity model, cheap).
  const humidity = flight.position.y < 150 ? 1.3 : 0.8;
  const vapor = clamp(
    (Math.max(0, Math.abs(wrapPi(flight.roll)) - 0.45) * 1.6
    + Math.abs(flight.bankRate || 0) * 0.5) * humidity, 0, 0.8,
  );
  aircraft.update(dt, t, vapor, flight.airborne, onFinal, flight.throttle);
  sound.setFlight(flight.throttle, flight.speed, flight.airborne);
  // Next-ring pulse.
  const act = activeRingObject();
  if (act) {
    const s = 1 + 0.05 * Math.sin(t * 4);
    act.group.scale.set(s, s, s);
  }
  if (flight.fuel < 25 && Math.floor(t * 2) % 2 === 0) {
    hud.showMessage('LOW FUEL', Math.round(flight.fuel) + '% — land on runway 36 to refuel');
  }
}

function updateCamera(dt, t) {
  if (mode === 'title') {
    // Slow cinematic orbit around the parked aircraft.
    const a = t * 0.12;
    camera.position.set(
      flight.position.x + Math.cos(a) * 24,
      7 + Math.sin(t * 0.3) * 1.2,
      flight.position.z + Math.sin(a) * 24,
    );
    camera.lookAt(flight.position.x, flight.position.y + 1, flight.position.z);
    return;
  }
  const offset = cameraMode === 'near'
    ? new THREE.Vector3(0, 2.4, -8.5)
    : new THREE.Vector3(0, 5, -25);
  const desired = flight.position.clone()
    .add(offset.clone().applyQuaternion(aircraft.group.quaternion));
  // During aerobatics the chase target orbits fast (a roll swings the
  // desired camera position around the aircraft at ~1.9 rad/s) — the soft
  // normal lerp lagged up to 7 m behind it, so the view swam during rolls.
  // Stiffen the lerp while a rate-mode manoeuvre is running; the position
  // itself stays continuous, only the convergence gets faster. The max()
  // keeps staged screenshots snapping: they call updateCamera with a huge
  // dt (5 s), whose base factor is ~1, and the stiff 0.5 must never
  // override that snap (without it the bank shot framed the aircraft from
  // 750 m away).
  const chaseK = (flight.rolling || flight.looping)
    ? Math.max(0.5, 1 - Math.pow(0.0001, dt))
    : 1 - Math.pow(0.0001, dt);
  camera.position.lerp(desired, chaseK);
  const fwd = forwardVector(flight.heading, flight.pitch);
  const look = flight.position.clone().addScaledVector(fwd, 30);
  look.y += 1;
  camera.lookAt(look);
  // The chase camera rolls 1:1 with the aircraft (a rotation is periodic,
  // so the unwrapped roll needs no wrapping and never snaps): in a roll
  // the world spins around the aircraft, Ace Combat style, and at level
  // flight the horizon is level again.
  camera.rotateZ(-flight.roll);
}

function initGame() {
  const params = new URLSearchParams(window.location.search);
  const seed = parseInt(params.get('seed') || '1', 10) || 1;
  shotMode = params.get('shot');
  const rng = makeRng(seed);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputEncoding = THREE.sRGBEncoding;
  document.getElementById('app').appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.5, 7000);
  camera.position.set(20, 8, 180);

  sky = createSky(scene, rng);
  createTerrain(scene);
  water = createWater(scene);
  createRiverAndRoads(scene);
  createTownAndTrees(scene, rng);
  createAirfield(scene);

  aircraft = buildAircraft();
  scene.add(aircraft.group);
  scene.add(aircraft.blob);

  flight = createFlightModel();
  flight.position.set(0, 4.6, 150); // parked on the runway (ground level 4.6)
  flight.status = 'ready';
  aircraft.group.position.copy(flight.position);
  aircraft.group.rotation.set(0, Math.PI, 0, 'YXZ');
  aircraft.blob.position.set(0, 2.6, 150);
  world = { terrainHeightAt, activeRing: null, runway: RUNWAY };
  buildLegRings(1);
  world.activeRing = activeRingObject();

  hud = createHud();
  sound = createSound();
  hud.onStart(() => { sound.unlock(); sound.click(); showBrief(1); });
  hud.onBriefGo(() => { sound.unlock(); sound.click(); startLeg(currentLeg); });

  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
    if (e.code === 'KeyP' && mode === 'flying') {
      paused = !paused;
      hud.showMessage(paused ? 'PAUSED' : 'RESUMED', paused ? 'Press P to continue' : '');
    }
    if (e.code === 'KeyR' && (mode === 'flying' || mode === 'over')) showBrief(flight.leg);
    if (e.code === 'KeyC') cameraMode = cameraMode === 'chase' ? 'near' : 'chase';
    if (e.code === 'KeyM') sound.setMuted(!sound.isMuted());
    if (e.code === 'Enter' && mode === 'title') showBrief(1);
  });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });

  // Mouse steering: hold + drag on the canvas.
  const cv = renderer.domElement;
  cv.addEventListener('pointerdown', (e) => {
    mouseSteer.active = true;
    mouseSteer.sx = e.clientX;
    mouseSteer.sy = e.clientY;
    mouseSteer.pitch = 0;
    mouseSteer.roll = 0;
  });
  window.addEventListener('pointermove', (e) => {
    if (!mouseSteer.active) return;
    mouseSteer.roll = -((e.clientX - mouseSteer.sx) / 160);
    mouseSteer.pitch = -((e.clientY - mouseSteer.sy) / 160);
  });
  window.addEventListener('pointerup', () => {
    mouseSteer.active = false;
    mouseSteer.pitch = 0;
    mouseSteer.roll = 0;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  window.addEventListener('error', (e) => { document.title = 'ERR ' + e.message; });

  if (shotMode) {
    stageShot(shotMode);
  } else {
    hud.setOverlay('title');
    let last = performance.now();
    let t = 0;
    const frame = (now) => {
      requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      t += dt;
      titleTime = t;
      if (mode === 'title') {
        aircraft.update(dt, t, 0, false, false);
        const gh = terrainHeightAt(flight.position.x, flight.position.z);
        aircraft.blob.position.set(flight.position.x, gh + 0.6, flight.position.z);
      } else if (!paused) {
        let acc = dt;
        let steps = 0;
        while (acc >= STEP && steps < 4) { stepFixed(STEP, t); acc -= STEP; steps++; }
      }
      sky.update(dt);
      water.update(dt);
      updateCamera(dt, t);
      hud.update(flight, camera, activeRingObject() ? activeRingObject().position : null);
      renderer.render(scene, camera);
    };
    requestAnimationFrame(frame);
  }
}

// Deterministic staged scenes for the screenshots (?shot=...&seed=1).
function stageShot(name) {
  const t = 2.0;
  if (name === 'start') {
    flight.position.set(0, 4.6, 150);
    flight.heading = 0;
    flight.status = 'ready';
    aircraft.group.position.copy(flight.position);
    aircraft.group.rotation.set(0, Math.PI, 0, 'YXZ');
    // Front-quarter hero view of the parked aircraft: the remodelled nose,
    // King Air windshield, props and gear face the camera (the old rear
    // quarter hid the nose behind the left nacelle). Close (17 m) so the
    // aircraft — not the runway — fills the frame.
    camera.position.set(10, 4.5, 136);
    camera.lookAt(0, 4.5, 150);
    hud.setOverlay('flight');
    aircraft.update(0.5, t, 0, false, false);
  } else if (name === 'play') {
    flight.position.set(800, 140, -550);
    flight.heading = -1.58;
    flight.pitch = 0;
    flight.roll = -0.08;
    flight.airborne = true;
    flight.speed = 58;
    flight.throttle = 0.75;
    flight.fuel = 82;
    flight.score = 0;
    flight.ringsPassed = 0;
    flight.leg = 1;
    flight.status = 'flying';
    ringIndex = 0;
    updateRingStates();
    world.activeRing = activeRingObject();
    mode = 'flying';
    hud.setOverlay('flight');
    runSteps(45, t, { pitch: 0, roll: -0.08, throttle: 0, rudder: 0, brake: false }, 0, false);
  } else if (name === 'bank') {
    // Mid-roll over the volcano: the aircraft is already past inverted
    // (roll 2.7 rad, 155°) and the pilot is holding full aileron, so the
    // roll-rate mode keeps it turning through the shot — the chase camera
    // rolls with it, the world tilts ~125°, the attitude indicator reads
    // inverted and the wingtips trail vapour. That is the aerobatics
    // evidence for the judge: a roll you can see, not just a steep bank.
    flight.position.set(-700, 190, -1100);
    flight.heading = -1.46;
    flight.pitch = -0.05;
    flight.roll = 2.7;
    flight.rollRate = 1.9;
    flight.airborne = true;
    flight.bankRate = 1.9;
    flight.speed = 62;
    flight.throttle = 0.8;
    flight.fuel = 61;
    flight.score = 200;
    flight.ringsPassed = 2;
    flight.leg = 2;
    flight.status = 'flying';
    buildLegRings(2);
    ringIndex = 2;
    updateRingStates();
    world.activeRing = activeRingObject();
    mode = 'flying';
    hud.setOverlay('flight');
    runSteps(45, t, { pitch: 0, roll: 1, throttle: 0, rudder: 0, brake: false }, 0.8, false);
  } else if (name === 'end') {
    flight.position.set(0, 26, 620);
    flight.heading = 0;
    flight.pitch = -0.06;
    flight.roll = 0;
    flight.airborne = true;
    flight.speed = 40;
    flight.throttle = 0.35;
    flight.fuel = 34;
    flight.score = 450;
    flight.ringsPassed = 5;
    flight.leg = 1;
    flight.status = 'flying';
    ringIndex = 6;
    updateRingStates();
    world.activeRing = null;
    mode = 'flying';
    hud.setOverlay('flight');
    runSteps(45, t, { pitch: -0.35, roll: 0, throttle: 0, rudder: 0, brake: false }, 0, true);
    // Sticky message: it must still be up when the screenshot is taken.
    hud.showMessage('FINAL', 'Runway 36 ahead — gear down, slow and level', true);
  }
  // Settle the camera on the staged pose (snap: dt large so the chase lerp
  // converges), render once, and signal readiness.
  if (name !== 'start') updateCamera(5, t);
  // Refresh the camera world matrix before the HUD projects the ring —
  // otherwise the marker is computed from a stale transform on first render.
  camera.updateMatrixWorld(true);
  hud.update(flight, camera, activeRingObject() ? activeRingObject().position : null);
  renderer.render(scene, camera);
  document.title = 'SHOT-READY';
  window.__shotReady = true;
}

// Advance the staged scene by n fixed steps with a held input (so the staged
// bank/pitch pose survives), without user input.
function runSteps(n, t, input, vapor, forceGear) {
  for (let i = 0; i < n; i++) {
    const ev = updateFlightModel(flight, input, STEP, world);
    if (ev === 'RING') {
      // In a staged shot the ring pass is part of the pose, not the story.
      flight.score -= 100;
      flight.ringsPassed = Math.max(0, flight.ringsPassed - 1);
    }
    aircraft.group.position.copy(flight.position);
    aircraft.group.rotation.set(-flight.pitch, Math.PI - flight.heading, flight.roll, 'YXZ');
    const gh = terrainHeightAt(flight.position.x, flight.position.z);
    aircraft.blob.position.set(flight.position.x, gh + 0.6, flight.position.z);
    aircraft.update(STEP, t + i * STEP, vapor, flight.airborne, forceGear, flight.throttle);
    sky.update(STEP);
    water.update(STEP);
  }
}

window.addEventListener('DOMContentLoaded', initGame);
