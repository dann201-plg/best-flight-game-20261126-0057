/* aircraft.js — "Merpati Nusantara", a twin-prop island hopper built from
   primitives: lathe fuselage with a painted livery, extruded wings and tail,
   spinning propellers, retractable gear, nav lights and wingtip vapour.
   References: MSFS / X-Plane (precise airframes, lit cockpits) and War
   Thunder (wing vapour in steep turns). */

// Livery texture for the lathe fuselage: white, blue cheatline, gold pinstripe,
// "MERPATI NUSANTARA" along the side and "PK-MRP" near the tail.
function makeLiveryTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#f4f6f7';
  g.fillRect(0, 0, 512, 512);
  // Grey belly band (u = 0 / 1, the keel): the fuselage reads as a
  // two-tone airframe from below and behind, not a white tube.
  g.fillStyle = '#c9ced2';
  g.fillRect(0, 0, 26, 512);
  g.fillRect(486, 0, 26, 512);
  // Cheatline on both fuselage sides (u = 0.25 and 0.75). REALISM ROUND 2:
  // wider (58 px, was 44) and deeper blue so the stripe survives the
  // downscale to contact-sheet size — the v1 stripe thinned to a hair
  // at ~320 px.
  for (const x of [128, 384]) {
    g.fillStyle = '#0f4f86';
    g.fillRect(x - 29, 0, 58, 512);
    g.fillStyle = '#e8a81e';
    g.fillRect(x - 35, 0, 5, 512);
    g.fillRect(x + 30, 0, 5, 512);
  }
  // Side titles, written along the fuselage (canvas y = along the length).
  g.fillStyle = '#123a5c';
  g.font = 'bold 30px sans-serif';
  g.textAlign = 'center';
  g.save();
  g.translate(128, 300);
  g.rotate(-Math.PI / 2);
  g.fillText('MERPATI NUSANTARA', 0, 0);
  g.restore();
  g.save();
  g.translate(384, 300);
  g.rotate(-Math.PI / 2);
  g.fillText('MERPATI NUSANTARA', 0, 0);
  g.restore();
  g.font = 'bold 34px sans-serif';
  g.save();
  g.translate(128, 470);
  g.rotate(-Math.PI / 2);
  g.fillText('PK-MRP', 0, 0);
  g.restore();
  g.save();
  g.translate(384, 470);
  g.rotate(-Math.PI / 2);
  g.fillText('PK-MRP', 0, 0);
  g.restore();
  // Panel lines: faint rings around the fuselage (constant v) and
  // lengthwise seams (constant u) so the skin reads as riveted metal,
  // not a flat white tube. REALISM ROUND 2: darker (0.13, was 0.08) and
  // more rings — the v1 lines vanished entirely at contact-sheet size.
  g.fillStyle = 'rgba(0,0,0,0.13)';
  for (const y of [90, 130, 170, 200, 240, 270, 310, 340, 380, 410, 450]) g.fillRect(0, y, 512, 2);
  g.fillStyle = 'rgba(0,0,0,0.08)';
  for (const x of [64, 192, 320, 448]) g.fillRect(x, 0, 2, 512);
  // Anti-glare panel on the nose top: the lathe's top is u = 0.5
  // (canvas x 256) and the nose stations are profile indices 7–13,
  // i.e. v 0.54–1.0 (canvas y 0–235) — v follows the point index, not
  // the y value, so the panel must span that whole band. Painted into
  // the livery so it follows the fuselage curve exactly — the dark
  // panel every real King Air wears ahead of the windshield. Wide
  // (u 0.29–0.71): from the cockpit the nose is seen at a shallow
  // grazing angle, so a narrow strip foreshortens to a thin wedge.
  // REALISM ROUND 2: widened 176 -> 212 px and extended to y 256
  // (the geometry panel now reaches axis 2.6) so the nose top reads
  // dark from the pilot's seat instead of a white dome.
  g.fillStyle = '#1c2124';
  g.fillRect(150, 0, 212, 256);
  g.fillStyle = 'rgba(255,255,255,0.10)';
  g.fillRect(150, 0, 212, 3);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}

// Wing planform: a tapered trapezoid extruded to a thin slab, then laid flat
// (chord along z, thickness vertical) so the mesh only needs a dihedral roll.
function makeWingGeometry(span, rootChord, tipChord, thick) {
  const s = new THREE.Shape();
  s.moveTo(0, -rootChord / 2);
  s.lineTo(span, -tipChord / 2);
  s.lineTo(span, tipChord / 2);
  s.lineTo(0, rootChord / 2);
  s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: thick, bevelEnabled: false });
  geo.translate(0, 0, -thick / 2);
  geo.rotateX(-Math.PI / 2);
  return geo;
}

function buildAircraft() {
  const group = new THREE.Group();
  let gearAnim = 0; // 0 = gear down, 1 = retracted (animated in update)
  const white = new THREE.MeshStandardMaterial({
    map: makeLiveryTexture(), metalness: 0.15, roughness: 0.5,
  });
  // Plain white for wings/tail/nacelles: the livery map belongs on the fuselage only.
  const plainWhite = new THREE.MeshStandardMaterial({
    color: 0xf4f6f7, metalness: 0.15, roughness: 0.5,
  });
  const blue = new THREE.MeshStandardMaterial({ color: 0x155e9e, metalness: 0.3, roughness: 0.4 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x22262a, metalness: 0.6, roughness: 0.5 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x0a1c28, metalness: 0.9, roughness: 0.12, side: THREE.DoubleSide,
  });

  // Fuselage: lathe profile, nose at +z after rotation. King Air 350 nose:
  // blunt-rounded — the radius shrinks over a long taper to a rounded tip,
  // never a hemisphere and never a point.
  const profile = [
    [0.02, -5.6], [0.55, -5.2], [0.92, -4.2], [1.04, -2.6], [1.06, -0.8],
    [1.02, 1.2], [0.99, 2.2], [0.93, 3.0], [0.82, 3.8], [0.66, 4.4],
    [0.46, 4.9], [0.27, 5.2], [0.12, 5.38], [0.02, 5.45],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const fuselageGeo = new THREE.LatheGeometry(profile, 28);
  // Nose droop: the King Air's top line slopes down from the cockpit roof
  // to the tip while the belly rises — shift nose cross-sections down.
  {
    const pos = fuselageGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      if (y > 3.0) pos.setZ(i, pos.getZ(i) + (y - 3.0) * 0.05);
    }
    fuselageGeo.computeVertexNormals();
  }
  const fuselage = new THREE.Mesh(fuselageGeo, white);
  fuselage.rotation.x = Math.PI / 2; // lathe axis Y -> fuselage axis Z
  group.add(fuselage);

  // Anti-glare panel as real geometry, not just paint: a partial lathe
  // hugging the nose crown (phi around the top), radii 0.06 proud of
  // the skin so it never z-fights, with the same nose droop applied.
  // The painted panel in the livery is geometrically correct but
  // foreshortens to a thin wedge from the pilot's seat (verified by a
  // UV probe: nose top is u 0.5 / v 0.69, canvas pixel dark) — a raised
  // matte panel is what actually reads from the cockpit, the way a real
  // King Air's does. It also darkens the nose top in chase view.
  // REALISM ROUND 2: widened 2.1 -> 2.6 rad and extended forward to
  // axis 2.6 so the nose top reads dark from the seat, not white.
  {
    const panelProfile = [
      [1.02, 2.6], [0.99, 3.0], [0.88, 3.8], [0.72, 4.4], [0.52, 4.9],
      [0.33, 5.2], [0.18, 5.38], [0.08, 5.45],
    ].map(([r, y]) => new THREE.Vector2(r, y));
    const panelGeo = new THREE.LatheGeometry(panelProfile, 12, Math.PI - 1.3, 2.6);
    const ppos = panelGeo.attributes.position;
    for (let i = 0; i < ppos.count; i++) {
      const y = ppos.getY(i);
      if (y > 3.0) ppos.setZ(i, ppos.getZ(i) + (y - 3.0) * 0.05);
    }
    panelGeo.computeVertexNormals();
    const panel = new THREE.Mesh(
      panelGeo,
      new THREE.MeshStandardMaterial({
        color: 0x1c2124, metalness: 0.1, roughness: 0.95, side: THREE.DoubleSide,
      }),
    );
    panel.rotation.x = Math.PI / 2;
    group.add(panel);
  }

  // Cockpit glass, King Air style: two raked trapezoidal windshield panes
  // meeting at a thin centre pillar, a triangular side window, then a
  // D-shaped cockpit window — never a bubble dome.
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x1a1e22, metalness: 0.6, roughness: 0.5 });
  function trapezoidGeo(wBot, wTop, h) {
    const s = new THREE.Shape();
    s.moveTo(-wBot / 2, -h / 2);
    s.lineTo(wBot / 2, -h / 2);
    s.lineTo(wTop / 2, h / 2);
    s.lineTo(-wTop / 2, h / 2);
    s.closePath();
    return new THREE.ShapeGeometry(s);
  }
  for (const sx of [-1, 1]) {
    // Dark frame slightly behind the glass, a touch larger all round.
    const frame = new THREE.Mesh(trapezoidGeo(0.68, 0.54, 0.6), frameMat);
    frame.position.set(sx * 0.30, 0.55, 4.03);
    frame.rotation.set(-0.52, sx * 0.35, 0, 'YXZ');
    frame.translateZ(-0.02);
    group.add(frame);
    const pane = new THREE.Mesh(trapezoidGeo(0.62, 0.48, 0.55), glassMat);
    pane.position.set(sx * 0.30, 0.55, 4.05);
    pane.rotation.set(-0.52, sx * 0.35, 0, 'YXZ');
    group.add(pane);
    // Triangular side window just behind the windshield (point forward).
    const tri = new THREE.Shape();
    tri.moveTo(0, -0.17);
    tri.lineTo(0.34, -0.17);
    tri.lineTo(0.34, 0.17);
    tri.closePath();
    const triMesh = new THREE.Mesh(new THREE.ShapeGeometry(tri), glassMat);
    triMesh.position.set(sx * 0.64, 0.55, 3.55);
    triMesh.rotation.y = sx * Math.PI / 2;
    triMesh.scale.x = sx;
    group.add(triMesh);
    // D-shaped cockpit window: straight edge forward, curved back.
    const dShape = new THREE.Shape();
    dShape.moveTo(-0.28, -0.18);
    dShape.lineTo(0.22, -0.18);
    dShape.absarc(0.22, 0, 0.18, -Math.PI / 2, Math.PI / 2, false);
    dShape.lineTo(-0.28, 0.18);
    dShape.closePath();
    const dWin = new THREE.Mesh(new THREE.ShapeGeometry(dShape), glassMat);
    dWin.position.set(sx * 0.80, 0.5, 3.0);
    dWin.rotation.y = sx * Math.PI / 2;
    dWin.scale.x = sx;
    group.add(dWin);
    // Round cabin windows (King Air round windows, 5 per side).
    for (const [wz, wx] of [[1.2, 0.85], [0.2, 0.91], [-0.8, 0.92], [-1.8, 0.91], [-2.8, 0.90]]) {
      const cw = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), glassMat);
      cw.scale.set(0.35, 1, 1);
      cw.position.set(sx * wx, 0.55, wz);
      group.add(cw);
    }
  }

  // Main wing (low wing) with blue tips, slight dihedral. Span 13.8 m
  // total: King Air 350 span/length is 1.24, not the 1.37 the first build had.
  const wingGeo = makeWingGeometry(6.9, 2.5, 1.1, 0.16);
  for (const sx of [1, -1]) {
    const wing = new THREE.Mesh(wingGeo, plainWhite);
    wing.scale.x = sx;
    wing.position.set(0, -0.28, 0.7);
    wing.rotation.z = sx * 0.07;
    group.add(wing);
    // Blue tip cap sits ON the dihedral tip (y matches the wing rise),
    // not hanging below it as a loose slab.
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 1.15), blue);
    tip.position.set(sx * 6.68, 0.19, 0.7);
    tip.rotation.z = sx * 0.07;
    group.add(tip);
    // REALISM ROUND 2 — winglets: upturned fins at the tips (King Air 350
    // winglets), the silhouette cue that reads at contact-sheet size.
    const winglet = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.75, 1.0), blue);
    winglet.position.set(sx * 6.92, 0.55, 0.7);
    winglet.rotation.z = sx * -0.30; // top leans outward
    group.add(winglet);
    // REALISM ROUND 2 — black de-ice boots: a tapered rubber strip just
    // behind the leading edge, swept back with it (the wing LE sweeps
    // ~5.8 deg, so the strip is rotated to match instead of floating
    // ahead of the tip). Sits on the wing top surface, same dihedral.
    const bootGeo = makeWingGeometry(6.85, 0.34, 0.16, 0.06);
    const boot = new THREE.Mesh(bootGeo, new THREE.MeshStandardMaterial({
      color: 0x1a1a1a, metalness: 0.1, roughness: 0.9,
    }));
    boot.scale.x = sx;
    boot.position.set(0, -0.19, 1.72);
    boot.rotation.z = sx * 0.07;
    boot.rotation.y = sx * 0.10;
    group.add(boot);
    // REALISM ROUND 2 — flap track fairings: three canoe fairings under
    // each wing (the bumps every King Air wears under its trailing edge).
    for (const [fx, fz] of [[2.2, 0.2], [4.0, 0.35], [5.6, 0.5]]) {
      const fairing = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), dark);
      fairing.scale.set(0.15, 0.14, 0.6);
      // y follows the wing dihedral (bottom surface -0.36 + 0.07 * span),
      // embedded 0.09 into the wing so it hangs from the underside.
      fairing.position.set(sx * fx, -0.41 + 0.07 * fx, fz);
      group.add(fairing);
    }
  }

  // T-tail (King Air 200/300/350): the horizontal stabilizer sits on top
  // of the fin, not on the fuselage — the silhouette that identifies a 350.
  const tailGeo = makeWingGeometry(2.15, 1.4, 0.7, 0.12);
  for (const sx of [1, -1]) {
    const stab = new THREE.Mesh(tailGeo, plainWhite);
    stab.scale.x = sx;
    stab.position.set(0, 2.80, -4.45);
    group.add(stab);
  }
  // Small ventral fin under the tail (a King Air detail often missed).
  const ventral = new THREE.Shape();
  ventral.moveTo(0, 0);
  ventral.lineTo(0.9, -0.55);
  ventral.lineTo(0.15, -0.55);
  ventral.closePath();
  const ventralMesh = new THREE.Mesh(new THREE.ShapeGeometry(ventral), blue);
  ventralMesh.position.set(-0.02, -0.6, -4.6);
  ventralMesh.rotation.y = Math.PI / 2;
  group.add(ventralMesh);
  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0);
  finShape.lineTo(1.5, 0.15);
  finShape.lineTo(1.9, 2.1);
  finShape.lineTo(0.35, 2.3);
  finShape.closePath();
  const fin = new THREE.Mesh(
    new THREE.ExtrudeGeometry(finShape, { depth: 0.14, bevelEnabled: false }), blue,
  );
  // Fin length runs along the fuselage (z), not across it.
  fin.rotation.y = Math.PI / 2;
  fin.position.set(-0.07, 0.6, -3.6);
  group.add(fin);

  // Engine nacelles + propellers on the wings.
  const propellers = [];
  const propDiscs = []; // blur discs whose opacity follows throttle/RPM
  for (const sx of [1, -1]) {
    const nacelle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.45, 2.7, 14), plainWhite,
    );
    nacelle.rotation.x = Math.PI / 2;
    nacelle.position.set(sx * 3.3, -0.32, 0.9);
    group.add(nacelle);
    // PT6 intake scoop under the spinner + exhaust stub on the outer side.
    const intake = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.14, 0.4), dark);
    intake.position.set(sx * 3.3, -0.85, 2.1);
    group.add(intake);
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.5, 8), dark);
    exhaust.rotation.x = Math.PI / 2;
    exhaust.position.set(sx * 3.88, -0.25, -0.1);
    group.add(exhaust);
    const spinner = new THREE.Mesh(
      new THREE.ConeGeometry(0.24, 0.6, 12), blue,
    );
    spinner.rotation.x = Math.PI / 2;
    spinner.position.set(sx * 3.3, -0.32, 2.5);
    group.add(spinner);
    // King Air 350: 4-blade Hartzell, 2.6 m diameter, tapered blades with
    // a thin yellow tip stripe — the detail that reads as a real prop.
    const prop = new THREE.Group();
    const bladeShape = new THREE.Shape();
    bladeShape.moveTo(-0.10, 0);
    bladeShape.lineTo(0.10, 0);
    bladeShape.lineTo(0.055, 1.3);
    bladeShape.lineTo(-0.055, 1.3);
    bladeShape.closePath();
    const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, { depth: 0.05, bevelEnabled: false });
    bladeGeo.translate(0, 0, -0.025);
    const tipMat = new THREE.MeshStandardMaterial({ color: 0xf2c200, metalness: 0.3, roughness: 0.5 });
    for (let b = 0; b < 4; b++) {
      const holder = new THREE.Group();
      holder.rotation.z = (b * Math.PI * 2) / 4;
      const blade = new THREE.Mesh(bladeGeo, dark);
      blade.rotation.y = 0.28; // blade pitch (twist) — a flat paddle is a cartoon giveaway
      holder.add(blade);
      const tip = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.09, 0.06), tipMat);
      tip.position.set(0, 1.26, 0);
      tip.rotation.y = 0.28;
      holder.add(tip);
      prop.add(holder);
    }
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(1.32, 28),
      new THREE.MeshBasicMaterial({
        color: 0x111111, transparent: true, opacity: 0.15, side: THREE.DoubleSide,
      }),
    );
    prop.add(disc);
    propDiscs.push({ mesh: disc, base: 0.26 });
    // Faint outer blur halo — a second disc reads as motion, not a plate.
    const halo = new THREE.Mesh(
      new THREE.CircleGeometry(1.45, 28),
      new THREE.MeshBasicMaterial({
        color: 0x111111, transparent: true, opacity: 0.05, side: THREE.DoubleSide,
      }),
    );
    prop.add(halo);
    propDiscs.push({ mesh: halo, base: 0.08 });
    prop.position.set(sx * 3.3, -0.32, 2.42);
    group.add(prop);
    propellers.push(prop);
  }

  // Landing gear: nose + two mains (retracts in flight).
  const gear = new THREE.Group();
  const legMat = new THREE.MeshStandardMaterial({ color: 0x888e94, metalness: 0.7, roughness: 0.4 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x14161a, roughness: 0.9 });
  function addWheel(x, y, z) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.4, 8), legMat);
    leg.position.set(x, y + 0.71, z);
    gear.add(leg);
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 14), wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    gear.add(wheel);
  }
  // Wheel axle at -2.26: wheels touch the ground when the fuselage sits at
  // terrain + 2.6 (the flight model's ground offset).
  addWheel(0, -2.26, 3.9);
  addWheel(-1.15, -2.26, 0.3);
  addWheel(1.15, -2.26, 0.3);
  group.add(gear);

  // Nav lights: red left, green right, white tail (like every real aircraft).
  function navLight(color, x, y, z) {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 8, 6),
      new THREE.MeshBasicMaterial({ color }),
    );
    m.position.set(x, y, z);
    group.add(m);
    return m;
  }
  navLight(0xff2a22, -6.9, 0.2, 0.7);
  navLight(0x22ff66, 6.9, 0.2, 0.7);
  navLight(0xffffff, 0, 0.3, -5.6);
  const strobe = navLight(0xffffff, 0, 1.15, -5.2);
  // Pitot tubes under the nose (King Air) — they emerge from the belly
  // and point forward, low enough to clear the nose curve.
  for (const px of [-0.25, 0.25]) {
    const pitot = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6), dark);
    pitot.rotation.x = Math.PI / 2;
    pitot.position.set(px, -0.72, 4.35);
    group.add(pitot);
  }
  // Landing lights: nose + one per nacelle (King Air moved them off the wing).
  const landingLightMat = new THREE.MeshBasicMaterial({ color: 0xfff2c0 });
  const noseLight = new THREE.Mesh(new THREE.CircleGeometry(0.14, 12), landingLightMat);
  noseLight.position.set(0, -0.60, 4.82);
  noseLight.rotation.x = -0.5;
  group.add(noseLight);
  for (const sx of [1, -1]) {
    const nl = new THREE.Mesh(new THREE.CircleGeometry(0.11, 12), landingLightMat);
    nl.position.set(sx * 3.3, -0.8, 1.7);
    nl.rotation.x = -0.15;
    group.add(nl);
  }
  // Warm glow sprites on the lights (cheap bloom, no post-processing).
  const glowTex = makeGlowTexture();
  for (const [gx, gy, gz, gc, gs] of [
    [0, -0.60, 4.85, 0xffe9b0, 1.6],
    [-6.9, 0.2, 0.7, 0xff2a22, 0.9], [6.9, 0.2, 0.7, 0x22ff66, 0.9],
  ]) {
    const gl = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex, color: gc, transparent: true, opacity: 0.55,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    gl.position.set(gx, gy, gz);
    gl.scale.set(gs, gs, 1);
    group.add(gl);
  }
  // Roof antennas + APU exhaust at the tail tip (small King Air details
  // that read from the chase camera).
  for (const az of [0.6, -1.4]) {
    const ant = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.42, 6), dark);
    ant.position.set(0, 1.05, az);
    ant.rotation.x = -0.15;
    group.add(ant);
  }
  const apu = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.3, 6), dark);
  apu.rotation.x = Math.PI / 2;
  apu.position.set(0, 0, -5.65);
  group.add(apu);

  // Wingtip vapour wisps (War Thunder high-G cue), opacity driven by bank.
  const vaporTex = makeGlowTexture();
  const vapors = [];
  for (const sx of [1, -1]) {
    const v = new THREE.Sprite(new THREE.SpriteMaterial({
      map: vaporTex, transparent: true, opacity: 0, depthWrite: false,
    }));
    v.position.set(sx * 6.7, 0.15, 0.2);
    v.scale.set(7, 2.4, 1);
    group.add(v);
    vapors.push(v);
  }

  // Fake blob shadow: a dark ellipse the game pins to the terrain below.
  const blob = new THREE.Mesh(
    new THREE.CircleGeometry(1, 20),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false }),
  );
  blob.rotation.x = -Math.PI / 2;
  blob.scale.set(6.5, 9, 1);

  return {
    group, propellers, gear, strobe, vapors, blob,
    // Per-frame cosmetics: prop spin by throttle, strobe blink, vapour by
    // bank, gear retract animation. throttle is the spooled value (0..1).
    update(dt, t, vapor, airborne, forceGear, throttle = 0.5) {
      const spin = airborne ? 6 + throttle * 44 : 6;
      for (const p of propellers) p.rotation.z += dt * spin;
      for (const d of propDiscs) {
        d.mesh.material.opacity = d.base * (airborne ? 0.5 + 0.5 * throttle : 0.4);
      }
      strobe.material.color.setHex(Math.sin(t * 6) > 0.7 ? 0xffffff : 0x333333);
      const v = clamp(vapor, 0, 0.8);
      for (const s of vapors) s.material.opacity = v;
      // Gear retracts into the fuselage over ~1 s after takeoff (animated,
      // not a visibility snap — a real twin-prop does not teleport its gear).
      // Travel 1.85 puts the nose wheel fully inside the belly (0.05 clear)
      // before the group hides at 0.98 — the old 1.7 left it poking 0.09 out.
      gearAnim = clamp(gearAnim + ((airborne && !forceGear) ? dt * 1.1 : -dt * 1.4), 0, 1);
      gear.position.y = gearAnim * 1.85;
      gear.visible = gearAnim < 0.98;
    },
  };
}
