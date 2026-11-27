/* interior.js — Langit Nusantara v2, REALISM ROUND 2: the cockpit interior.
   A glareshield brow and two A-pillars, built as simple dark geometry
   parented to the CAMERA so they frame every cockpit shot exactly like
   a real King Air's cabin does — the shot reads as "inside the aircraft
   looking out", not a camera floating above a white dome. The 9-gauge
   brass/amber DOM panel (cockpit.js) is untouched. Toggle with the
   cockpit view: game.js calls setVisible in step with cockpit.setVisible.
   Camera FOV is 58 deg (29 deg half): the glareshield at y 0.55, z -1.35
   sits ~22 deg above the view axis, just inside the top edge; the
   pillars sit ~35 deg off-axis at the frame edges. No centre pillar
   (it bisected the runway) and no side frames (they sat outside the
   frustum and read as slabs) — both tried in v2 and removed. */

function createCockpitInterior(camera, scene) {
  // The camera must be in the scene graph for its children to render.
  scene.add(camera);
  const group = new THREE.Group();
  group.visible = false;

  const walnut = new THREE.MeshStandardMaterial({
    color: 0x1a120a, metalness: 0.05, roughness: 0.92,
  });
  const seamWalnut = new THREE.MeshStandardMaterial({
    color: 0x4a3220, metalness: 0.05, roughness: 0.85,
  });
  // FINAL POLISH: low metalness + high roughness so both pillars read
  // the same mid-dark grey — the old metalness 0.5 made the left pillar
  // nearly black and the right one light grey under the same sun.
  const frameDark = new THREE.MeshStandardMaterial({
    color: 0x1c2126, metalness: 0.1, roughness: 0.9, emissive: 0x05070a,
  });
  const rivetSteel = new THREE.MeshStandardMaterial({
    color: 0x9aa0a8, metalness: 0.85, roughness: 0.35,
  });

  // Glareshield: a padded walnut brow across the top of the windshield,
  // tilted so its top edge leans away from the pilot — the dark band a
  // pilot sees above the panel in every real cockpit. FINAL POLISH:
  // thinner (0.055, was 0.07) and shallower (0.17, was 0.20) so less
  // shelf shows, with a lighter seam strip along its lower front edge
  // (the padded edge of a real glareshield) — built as a group so the
  // strip follows the tilt.
  const shieldGroup = new THREE.Group();
  shieldGroup.position.set(0, 0.55, -1.35);
  shieldGroup.rotation.x = -0.4;
  const shield = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.055, 0.17), walnut);
  shieldGroup.add(shield);
  const seam = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.012, 0.02), seamWalnut);
  seam.position.set(0, -0.03, 0.085);
  shieldGroup.add(seam);
  group.add(shieldGroup);

  // A-pillars: from the glareshield ends down to the panel sides,
  // framing the windshield left and right. v3: thin (0.045), further out
  // (x 0.98, z -1.35) and tops leaning INWARD (real windshields taper
  // toward the top) with a slight 0.10 lean — each pillar is ~2 deg of
  // the frame edge, not a wall. v4: taller (0.95, was 0.70) so the tops
  // meet the glareshield's underside — the v3 gap between pillar tops
  // and shield read as a floating plank. No side frames (v2's sat outside
  // the frustum and read as slabs) and NO centre pillar (v2's bisected
  // the runway — a real King Air's centre post is thinner than the
  // contact-sheet can show, so it is left out rather than faked thick).
  // FINAL POLISH: each pillar is a group — the box plus 4 small rivet
  // dots on its inner face (toward the centreline) so the slab reads as
  // a fastened frame, not a flat plank. Rivets are children of the group
  // so they follow the pillar's lean.
  for (const sx of [-1, 1]) {
    const pillarGroup = new THREE.Group();
    pillarGroup.position.set(sx * 0.98, 0.08, -1.35);
    pillarGroup.rotation.z = sx * 0.10; // tops lean inward
    pillarGroup.rotation.y = sx * 0.10;
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.95, 0.08), frameDark);
    pillarGroup.add(pillar);
    for (const ry of [-0.32, -0.12, 0.08, 0.28]) {
      const rivet = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), rivetSteel);
      rivet.position.set(-sx * 0.024, ry, 0);
      pillarGroup.add(rivet);
    }
    group.add(pillarGroup);
  }

  camera.add(group);

  return {
    setVisible(on) {
      group.visible = on;
    },
  };
}
