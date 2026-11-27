/* cockpit.js — Langit Nusantara v2: the cockpit view. A lit instrument
   panel (airspeed, attitude, altimeter, compass, throttle, fuel) plus a
   yoke that banks with the aircraft, all drawn live from the same flight
   model the chase HUD reads — nothing here is a pasted picture. The 3D
   camera itself is positioned by game.js (pilot seat, looking forward
   over the nose); this module owns only the panel. Toggle with C. */

function createCockpit() {
  const root = document.getElementById('hud');

  const panel = document.createElement('div');
  panel.id = 'cockpit-panel';
  panel.style.display = 'none';
  root.appendChild(panel);

  function gaugeBlock(id, label, bigId, unit) {
    const el = document.createElement('div');
    el.className = 'ck-gauge';
    el.innerHTML = '<div class="hud-label">' + label + '</div>'
      + '<div class="hud-big" id="' + bigId + '">0</div>'
      + '<div class="hud-unit">' + unit + '</div>';
    panel.appendChild(el);
    return el;
  }

  gaugeBlock('ck-ias', 'AIRSPEED', 'ck-ias-v', 'KNOTS');

  // Attitude indicator (own canvas, same up/forward-vector maths as the
  // chase HUD: inverted level flight shows ground on top).
  const attWrap = document.createElement('div');
  attWrap.className = 'ck-gauge';
  attWrap.innerHTML = '<div class="hud-label">ATTITUDE</div>';
  const attCanvas = document.createElement('canvas');
  attCanvas.width = 150;
  attCanvas.height = 150;
  attWrap.appendChild(attCanvas);
  panel.appendChild(attWrap);

  gaugeBlock('ck-alt', 'ALTITUDE', 'ck-alt-v', 'FEET');

  // Vertical speed — the flight model's real descent rate (m/s -> FPM),
  // the number a pilot watches on final.
  gaugeBlock('ck-vs', 'VERT SPEED', 'ck-vs-v', 'FPM');

  // Prop RPM — derived from the spooled throttle (PT6 prop, 600-1700 RPM),
  // the same power the throttle bar shows, as a dial a pilot reads.
  gaugeBlock('ck-rpm', 'PROP RPM', 'ck-rpm-v', 'RPM');

  // Compass strip — top-centre, not in the panel: it frees a whole panel
  // slot and reads like the heading tape above a real glareshield.
  const compassStrip = document.createElement('div');
  compassStrip.id = 'cockpit-compass';
  compassStrip.style.display = 'none';
  compassStrip.innerHTML = '<div class="hud-label" id="ck-hdg">HDG 360°</div>';
  const hdgCanvas = document.createElement('canvas');
  hdgCanvas.width = 300;
  hdgCanvas.height = 40;
  compassStrip.appendChild(hdgCanvas);
  root.appendChild(compassStrip);

  // Yoke: a simple column + crossbar + grips, drawn on canvas and tilted
  // with the bank so the pilot's hands-on feel reads in the shot.
  const yokeWrap = document.createElement('div');
  yokeWrap.className = 'ck-gauge';
  yokeWrap.innerHTML = '<div class="hud-label">YOKE</div>';
  const yokeCanvas = document.createElement('canvas');
  yokeCanvas.width = 170;
  yokeCanvas.height = 84;
  yokeWrap.appendChild(yokeCanvas);
  panel.appendChild(yokeWrap);

  // Throttle lever position.
  const thrWrap = document.createElement('div');
  thrWrap.className = 'ck-gauge';
  thrWrap.innerHTML = '<div class="hud-label">THROTTLE</div>'
    + '<div class="thrbar"><div id="ck-thr-bar"></div></div>'
    + '<div class="hud-sub" id="ck-thr-v">0%</div>';
  panel.appendChild(thrWrap);

  // Fuel — its own gauge with a bar, not a footnote under the throttle.
  const fuelWrap = document.createElement('div');
  fuelWrap.className = 'ck-gauge';
  fuelWrap.innerHTML = '<div class="hud-label">FUEL</div>'
    + '<div class="hud-big" id="ck-fuel-v">100%</div>'
    + '<div class="ck-fuelbar"><div id="ck-fuel-bar"></div></div>';
  panel.appendChild(fuelWrap);

  // Gear — three lights (nose, left, right), the state the flight model
  // actually flies: down on the ground or on final, up once airborne.
  const gearWrap = document.createElement('div');
  gearWrap.className = 'ck-gauge';
  gearWrap.innerHTML = '<div class="hud-label">GEAR</div>'
    + '<div class="ck-gear-dots"><span id="ck-gear-n"></span><span id="ck-gear-l"></span><span id="ck-gear-r"></span></div>'
    + '<div class="hud-sub" id="ck-gear-v">DOWN</div>';
  panel.appendChild(gearWrap);

  function wrapAngle(a) {
    return ((a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
  }

  function drawAttitude(pitch, roll) {
    const g = attCanvas.getContext('2d');
    const W = 150;
    const H = 150;
    const cx = W / 2;
    const cy = H / 2;
    const R = 68;
    g.clearRect(0, 0, W, H);
    g.save();
    g.beginPath();
    g.arc(cx, cy, R, 0, Math.PI * 2);
    g.clip();
    const dispPitch = Math.asin(clamp(Math.sin(pitch) * Math.cos(roll), -1, 1));
    const dispRoll = Math.atan2(Math.sin(roll), Math.cos(roll) * Math.cos(pitch));
    g.translate(cx, cy);
    g.rotate(-dispRoll);
    g.translate(0, dispPitch * 120);
    const sky = g.createLinearGradient(0, -R, 0, 0);
    sky.addColorStop(0, '#2e6cb0');
    sky.addColorStop(1, '#9cc3de');
    g.fillStyle = sky;
    g.fillRect(-R - 10, -R - 300, 2 * R + 20, R + 300);
    const ground = g.createLinearGradient(0, 0, 0, R);
    ground.addColorStop(0, '#8a5a2b');
    ground.addColorStop(1, '#4a2f16');
    g.fillStyle = ground;
    g.fillRect(-R - 10, 0, 2 * R + 20, R + 300);
    g.strokeStyle = '#ffffff';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(-R - 10, 0);
    g.lineTo(R + 10, 0);
    g.stroke();
    g.restore();
    g.strokeStyle = '#ffd76a';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(cx - 28, cy);
    g.lineTo(cx + 28, cy);
    g.moveTo(cx, cy - 7);
    g.lineTo(cx, cy + 3);
    g.stroke();
    g.strokeStyle = 'rgba(255,183,71,0.7)';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(cx, cy, R, 0, Math.PI * 2);
    g.stroke();
  }

  function drawCompass(headingDeg) {
    const g = hdgCanvas.getContext('2d');
    g.clearRect(0, 0, 300, 40);
    g.fillStyle = 'rgba(26,18,8,0.6)';
    g.fillRect(0, 0, 300, 40);
    const names = { 0: 'N', 45: 'NE', 90: 'E', 135: 'SE', 180: 'S', 225: 'SW', 270: 'W', 315: 'NW' };
    g.textAlign = 'center';
    for (let d = -90; d <= 450; d += 15) {
      const rel = ((d - headingDeg) % 360 + 540) % 360 - 180;
      const x = 150 + rel * (300 / 180);
      if (x < -10 || x > 310) continue;
      const major = ((d % 45) + 360) % 360 === 0;
      g.strokeStyle = major ? '#ffb347' : 'rgba(255,179,71,0.5)';
      g.lineWidth = major ? 2 : 1;
      g.beginPath();
      g.moveTo(x, major ? 6 : 13);
      g.lineTo(x, 26);
      g.stroke();
      if (major) {
        g.fillStyle = '#ffd76a';
        g.font = 'bold 13px sans-serif';
        g.fillText(names[((d % 360) + 360) % 360] || String(((d % 360) + 360) % 360), x, 38);
      }
    }
    g.fillStyle = '#ffd76a';
    g.beginPath();
    g.moveTo(150, 0);
    g.lineTo(143, 7);
    g.lineTo(157, 7);
    g.closePath();
    g.fill();
  }

  function drawYoke(roll) {
    const g = yokeCanvas.getContext('2d');
    g.clearRect(0, 0, 170, 84);
    g.save();
    g.translate(85, 46);
    g.rotate(-clamp(wrapAngle(roll), -0.9, 0.9) * 0.5);
    // Column.
    g.fillStyle = '#3a2a16';
    g.fillRect(-7, 0, 14, 38);
    // Crossbar — brass, like the real yoke.
    g.strokeStyle = '#c9a227';
    g.lineWidth = 9;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(-62, -6);
    g.lineTo(62, -6);
    g.stroke();
    // Grips — warm amber.
    g.fillStyle = '#e8b64c';
    g.beginPath();
    g.arc(-62, -6, 11, 0, Math.PI * 2);
    g.arc(62, -6, 11, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#06231a';
    g.beginPath();
    g.arc(-62, -6, 4, 0, Math.PI * 2);
    g.arc(62, -6, 4, 0, Math.PI * 2);
    g.fill();
    g.restore();
    // Centre hub.
    g.fillStyle = '#ffd76a';
    g.beginPath();
    g.arc(85, 40, 6, 0, Math.PI * 2);
    g.fill();
  }

  return {
    setVisible(on) {
      panel.style.display = on ? 'flex' : 'none';
      compassStrip.style.display = on ? 'block' : 'none';
      document.getElementById('hud').classList.toggle('cockpit-mode', on);
    },
    update(st) {
      document.getElementById('ck-ias-v').textContent = String(knots(st));
      document.getElementById('ck-alt-v').textContent = String(feet(st));
      // Vertical speed: real descent rate, signed so a descent reads negative.
      const vsFpm = Math.round((st.vy || 0) * 196.85);
      document.getElementById('ck-vs-v').textContent = (vsFpm >= 0 ? '+' : '') + vsFpm;
      // Prop RPM from the spooled throttle (PT6 prop 600-1700 RPM).
      document.getElementById('ck-rpm-v').textContent = String(Math.round(600 + st.throttle * 1100));
      const hdg = Math.round(headingDegrees(st));
      document.getElementById('ck-hdg').textContent = 'HDG ' + String(hdg).padStart(3, '0') + '°';
      document.getElementById('ck-thr-bar').style.height = (st.throttle * 100) + '%';
      document.getElementById('ck-thr-v').textContent = Math.round(st.throttle * 100) + '%';
      document.getElementById('ck-fuel-v').textContent = Math.round(st.fuel) + '%';
      const fuelBar = document.getElementById('ck-fuel-bar');
      fuelBar.style.width = st.fuel + '%';
      fuelBar.style.background = st.fuel < 25 ? '#ff5a4e' : '#ffb347';
      // Gear: the state the model flies (st.gearDown, set by game.js from
      // the same on-final rule as the 3D gear); fall back to the same rule
      // from the flight state alone if a caller never set it.
      const gearDown = st.gearDown !== undefined ? st.gearDown
        : !st.airborne || (st.airborne && st.speed < 48
          && Math.abs(st.position.x) < 80 && st.position.z > -450 && st.position.z < 1400);
      for (const id of ['ck-gear-n', 'ck-gear-l', 'ck-gear-r']) {
        document.getElementById(id).className = gearDown ? 'on' : 'off';
      }
      const gearText = document.getElementById('ck-gear-v');
      gearText.textContent = gearDown ? 'DOWN' : 'UP';
      gearText.style.color = gearDown ? '#8ef5c0' : '#ffd76a';
      drawAttitude(st.pitch, st.roll);
      drawCompass(hdg);
      drawYoke(st.roll);
    },
  };
}
