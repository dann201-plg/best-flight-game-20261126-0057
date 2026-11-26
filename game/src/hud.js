/* hud.js — the lit instruments: airspeed and altitude tapes, compass strip,
   artificial horizon, score/fuel/throttle, next-ring marker and the
   title/briefing/end overlays. All DOM + canvas, so the text stays crisp in
   screenshots at any size (Ace Combat green telemetry, Infinite Flight
   attitude indicator). */

function createHud() {
  const root = document.getElementById('hud');

  function panel(id, cls) {
    const el = document.createElement('div');
    el.id = id;
    el.className = 'panel ' + cls;
    root.appendChild(el);
    return el;
  }

  const airspeed = panel('hud-airspeed', 'hud-topleft');
  airspeed.innerHTML = '<div class="hud-label">AIRSPEED</div><div class="hud-big" id="hud-ias">0</div><div class="hud-unit">KNOTS</div>';
  const altitude = panel('hud-alt', 'hud-topright');
  altitude.innerHTML = '<div class="hud-label">ALTITUDE</div><div class="hud-big" id="hud-alt-v">0</div><div class="hud-unit">FEET</div>';
  const compass = panel('hud-compass', 'hud-topcenter');
  const compassCanvas = document.createElement('canvas');
  compassCanvas.width = 420;
  compassCanvas.height = 46;
  compass.appendChild(compassCanvas);
  const compassLabel = document.createElement('div');
  compassLabel.className = 'hud-label';
  compassLabel.id = 'hud-hdg';
  compassLabel.textContent = 'HDG 360°';
  compass.appendChild(compassLabel);

  const score = panel('hud-score', 'hud-bottomleft');
  score.innerHTML = '<div class="hud-label">SCORE <span id="hud-score-v">0</span></div>'
    + '<div class="hud-sub">RINGS <span id="hud-rings">0/5</span> · LEG <span id="hud-leg">1/3</span></div>'
    + '<div class="hud-sub">FUEL <span id="hud-fuel-v">100%</span></div>'
    + '<div class="fuelbar"><div id="hud-fuel-bar"></div></div>';

  const throttle = panel('hud-throttle', 'hud-bottomright');
  throttle.innerHTML = '<div class="hud-label">THROTTLE</div><div class="thrbar"><div id="hud-thr-bar"></div></div><div class="hud-sub" id="hud-thr-v">0%</div>';

  // Artificial horizon (attitude indicator) — the "instruments lit" centrepiece.
  const attWrap = document.createElement('div');
  attWrap.id = 'hud-attitude';
  attWrap.className = 'panel';
  const attCanvas = document.createElement('canvas');
  attCanvas.width = 180;
  attCanvas.height = 180;
  attWrap.appendChild(attCanvas);
  const attLabel = document.createElement('div');
  attLabel.className = 'hud-label';
  attLabel.textContent = 'ATTITUDE';
  attWrap.appendChild(attLabel);
  root.appendChild(attWrap);

  // Centre reticle + next-ring diamond marker.
  const reticle = document.createElement('div');
  reticle.id = 'hud-reticle';
  reticle.innerHTML = '<div class="ret-dot"></div>';
  root.appendChild(reticle);
  const ringMark = document.createElement('div');
  ringMark.id = 'hud-ringmark';
  ringMark.innerHTML = '<div class="ring-diamond"></div><div class="ring-dist" id="hud-ring-dist"></div>';
  root.appendChild(ringMark);

  // Big centre message (RING +100, LANDED, CRASHED…).
  const message = document.createElement('div');
  message.id = 'hud-message';
  root.appendChild(message);
  let messageTimer = 0;

  // Overlays: title, briefing, end.
  const titleOv = document.createElement('div');
  titleOv.id = 'hud-title';
  titleOv.className = 'overlay';
  titleOv.innerHTML = '<div class="ov-inner">'
    + '<div class="ov-kicker">MAKE.FUN · BEST FLIGHT GAME</div>'
    + '<h1>LANGIT<br>NUSANTARA</h1>'
    + '<div class="ov-sub">Merpati Nusantara · Kepulauan Indonesia · Golden Hour</div>'
    + '<p class="ov-text">Fly the twin-prop island hopper through glowing rings over coast, volcano and town — then land her on runway 36. Watch your fuel: every leg ends on the runway.</p>'
    + '<div class="ov-controls">↑ ↓ pitch (hold ↑ to loop) &nbsp;·&nbsp; ← → bank (hold to roll 360°) &nbsp;·&nbsp; W / S throttle &nbsp;·&nbsp; A / D rudder &nbsp;·&nbsp; SPACE brake &nbsp;·&nbsp; P pause &nbsp;·&nbsp; mouse: hold + drag to steer</div>'
    + '<button id="hud-start" class="ov-button">TERBANG ▸</button>'
    + '<div class="ov-foot">Three.js · offline · keyboard + mouse</div>'
    + '</div>';
  root.appendChild(titleOv);

  const briefOv = document.createElement('div');
  briefOv.id = 'hud-brief';
  briefOv.className = 'overlay';
  briefOv.style.display = 'none';
  briefOv.innerHTML = '<div class="ov-inner">'
    + '<div class="ov-kicker" id="hud-brief-kicker">LEG 1 / 3</div>'
    + '<h2 id="hud-brief-title">PANTAI UTARA</h2>'
    + '<p class="ov-text" id="hud-brief-text"></p>'
    + '<div class="ov-controls" id="hud-brief-route"></div>'
    + '<button id="hud-brief-go" class="ov-button">MULAI PENERBANGAN ▸</button>'
    + '</div>';
  root.appendChild(briefOv);

  const endOv = document.createElement('div');
  endOv.id = 'hud-end';
  endOv.className = 'overlay';
  endOv.style.display = 'none';
  endOv.innerHTML = '<div class="ov-inner">'
    + '<div class="ov-kicker" id="hud-end-kicker">MISSION COMPLETE</div>'
    + '<h2 id="hud-end-title"></h2>'
    + '<p class="ov-text" id="hud-end-text"></p>'
    + '<div class="ov-controls" id="hud-end-score"></div>'
    + '<button id="hud-end-retry" class="ov-button">TERBANG LAGI ▸</button>'
    + '</div>';
  root.appendChild(endOv);

  function wrapAngle(a) {
    return ((a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
  }
  let prevDispRoll = 0; // attitude-ball bank, kept continuous across frames
  let dispRollInit = false; // first draw snaps (staged shots render once)

  function drawCompass(headingDeg) {
    const g = compassCanvas.getContext('2d');
    g.clearRect(0, 0, 420, 46);
    g.fillStyle = 'rgba(4,20,28,0.55)';
    g.fillRect(0, 0, 420, 46);
    const names = { 0: 'N', 45: 'NE', 90: 'E', 135: 'SE', 180: 'S', 225: 'SW', 270: 'W', 315: 'NW' };
    g.textAlign = 'center';
    for (let d = -90; d <= 450; d += 15) {
      const rel = ((d - headingDeg) % 360 + 540) % 360 - 180;
      const x = 210 + rel * (420 / 180);
      if (x < -10 || x > 430) continue;
      const major = ((d % 45) + 360) % 360 === 0;
      g.strokeStyle = major ? '#8ef5c0' : 'rgba(142,245,192,0.5)';
      g.lineWidth = major ? 2 : 1;
      g.beginPath();
      g.moveTo(x, major ? 8 : 16);
      g.lineTo(x, 30);
      g.stroke();
      if (major) {
        g.fillStyle = '#8ef5c0';
        g.font = 'bold 15px sans-serif';
        g.fillText(names[((d % 360) + 360) % 360] || String(((d % 360) + 360) % 360), x, 44);
      }
    }
    // Centre caret.
    g.fillStyle = '#ffd76a';
    g.beginPath();
    g.moveTo(210, 0);
    g.lineTo(202, 8);
    g.lineTo(218, 8);
    g.closePath();
    g.fill();
  }

  function drawAttitude(pitch, roll) {
    const g = attCanvas.getContext('2d');
    const W = 180;
    const H = 180;
    const cx = W / 2;
    const cy = H / 2;
    const R = 82;
    g.clearRect(0, 0, W, H);
    g.save();
    g.beginPath();
    g.arc(cx, cy, R, 0, Math.PI * 2);
    g.clip();
    // Sky / ground ball, rotated by bank and shifted by pitch. Pitch and
    // roll are unwrapped (a loop takes pitch past PI), so the displayed
    // values come from the aircraft's up/forward vectors: inverted level
    // flight (loop top) shows ground on top, a vertical climb shows all
    // sky. The ball halves are tall enough that no pitch leaves the dial
    // blank.
    const dispPitch = Math.asin(clamp(Math.sin(pitch) * Math.cos(roll), -1, 1));
    // Displayed bank is unwrapped across frames: the raw atan2 flips by
    // 2*PI as pitch passes vertical (the loop top), which used to snap the
    // horizon ball 180 deg in a single frame. Unwrapping keeps the ball
    // rotating smoothly through the loop, like a real attitude indicator.
    // A slew limit (0.15 rad per update) then tames the loop-top tumble:
    // near vertical the raw bank is hypersensitive and would otherwise
    // spin the ball ~0.9 rad in one frame. Normal flight moves far slower
    // than the limit, so the instrument never lags there. The first call
    // snaps (staged screenshots render a single frame).
    let rawRoll = Math.atan2(Math.sin(roll), Math.cos(roll) * Math.cos(pitch));
    rawRoll = prevDispRoll + wrapAngle(rawRoll - prevDispRoll);
    if (!dispRollInit) {
      prevDispRoll = rawRoll;
      dispRollInit = true;
    } else {
      const step = Math.max(-0.15, Math.min(0.15, rawRoll - prevDispRoll));
      prevDispRoll += step;
    }
    const dispRoll = prevDispRoll;
    g.translate(cx, cy);
    g.rotate(-dispRoll);
    g.translate(0, dispPitch * 140);
    const sky = g.createLinearGradient(0, -R, 0, 0);
    sky.addColorStop(0, '#2e6cb0');
    sky.addColorStop(1, '#9cc3de');
    g.fillStyle = sky;
    g.fillRect(-R - 10, -R - 360, 2 * R + 20, R + 360);
    const ground = g.createLinearGradient(0, 0, 0, R);
    ground.addColorStop(0, '#8a5a2b');
    ground.addColorStop(1, '#4a2f16');
    g.fillStyle = ground;
    g.fillRect(-R - 10, 0, 2 * R + 20, R + 360);
    // Horizon line + pitch ladder.
    g.strokeStyle = '#ffffff';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(-R - 10, 0);
    g.lineTo(R + 10, 0);
    g.stroke();
    g.lineWidth = 1;
    g.font = '11px sans-serif';
    g.textAlign = 'center';
    for (const deg of [-20, -10, 10, 20]) {
      const y = -deg * 2.4;
      g.beginPath();
      g.moveTo(-34, y);
      g.lineTo(34, y);
      g.stroke();
      g.fillStyle = '#ffffff';
      g.fillText(String(Math.abs(deg)), -44, y + 4);
    }
    g.restore();
    // Fixed aircraft symbol.
    g.strokeStyle = '#ffd76a';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(cx - 34, cy);
    g.lineTo(cx + 34, cy);
    g.moveTo(cx, cy - 8);
    g.lineTo(cx, cy + 4);
    g.stroke();
    g.fillStyle = '#ffd76a';
    g.beginPath();
    g.arc(cx, cy, 3, 0, Math.PI * 2);
    g.fill();
    // Bank pointer.
    g.strokeStyle = '#8ef5c0';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(cx, cy, R - 4, -Math.PI / 2 - 0.5, -Math.PI / 2 + 0.5);
    g.stroke();
    g.save();
    g.translate(cx, cy);
    g.rotate(-dispRoll);
    g.fillStyle = '#ffd76a';
    g.beginPath();
    g.moveTo(0, -R + 2);
    g.lineTo(-6, -R + 12);
    g.lineTo(6, -R + 12);
    g.closePath();
    g.fill();
    g.restore();
    // Rim.
    g.strokeStyle = 'rgba(142,245,192,0.6)';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(cx, cy, R, 0, Math.PI * 2);
    g.stroke();
  }

  return {
    showMessage(text, sub, sticky) {
      message.innerHTML = text + (sub ? '<div class="msg-sub">' + sub + '</div>' : '');
      message.classList.add('show');
      clearTimeout(messageTimer);
      if (!sticky) messageTimer = setTimeout(() => message.classList.remove('show'), 2600);
    },
    setOverlay(which) {
      titleOv.style.display = which === 'title' ? 'flex' : 'none';
      briefOv.style.display = which === 'brief' ? 'flex' : 'none';
      endOv.style.display = which === 'end' ? 'flex' : 'none';
      root.classList.toggle('in-flight', which === 'flight');
    },
    setBrief(leg, title, text, route) {
      document.getElementById('hud-brief-kicker').textContent = 'LEG ' + leg + ' / 3';
      document.getElementById('hud-brief-title').textContent = title;
      document.getElementById('hud-brief-text').textContent = text;
      document.getElementById('hud-brief-route').textContent = route;
    },
    setEnd(kicker, title, text, scoreLine) {
      document.getElementById('hud-end-kicker').textContent = kicker;
      document.getElementById('hud-end-title').textContent = title;
      document.getElementById('hud-end-text').textContent = text;
      document.getElementById('hud-end-score').textContent = scoreLine;
    },
    onStart(fn) { document.getElementById('hud-start').addEventListener('click', fn); },
    onBriefGo(fn) { document.getElementById('hud-brief-go').addEventListener('click', fn); },
    onRetry(fn) { document.getElementById('hud-end-retry').addEventListener('click', fn); },

    // Per-frame instrument update. camera + ringPos are used for the marker.
    update(st, camera, ringPos) {
      document.getElementById('hud-ias').textContent = String(knots(st));
      document.getElementById('hud-alt-v').textContent = String(feet(st));
      const hdg = Math.round(headingDegrees(st));
      document.getElementById('hud-hdg').textContent = 'HDG ' + String(hdg).padStart(3, '0') + '°';
      document.getElementById('hud-score-v').textContent = String(st.score);
      document.getElementById('hud-rings').textContent = st.ringsPassed + '/' + st.ringsTotal;
      document.getElementById('hud-leg').textContent = st.leg + '/3';
      document.getElementById('hud-fuel-v').textContent = Math.round(st.fuel) + '%';
      document.getElementById('hud-fuel-bar').style.width = st.fuel + '%';
      document.getElementById('hud-fuel-bar').style.background = st.fuel < 25 ? '#ff5a4e' : '#8ef5c0';
      document.getElementById('hud-thr-bar').style.height = (st.throttle * 100) + '%';
      document.getElementById('hud-thr-v').textContent = Math.round(st.throttle * 100) + '%';
      drawCompass(hdg);
      drawAttitude(st.pitch, st.roll);
      // Next-ring marker: project the ring into screen space.
      if (ringPos && camera) {
        const v = ringPos.clone().project(camera);
        const behind = v.z > 1;
        const x = (v.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-v.y * 0.5 + 0.5) * window.innerHeight;
        if (behind || x < 40 || x > window.innerWidth - 40 || y < 40 || y > window.innerHeight - 40) {
          ringMark.style.display = 'none';
        } else {
          ringMark.style.display = 'block';
          ringMark.style.left = x + 'px';
          ringMark.style.top = y + 'px';
          const dist = Math.round(st.position.distanceTo(ringPos));
          document.getElementById('hud-ring-dist').textContent = (dist / 1000).toFixed(1) + ' km';
        }
      } else {
        ringMark.style.display = 'none';
      }
    },
  };
}
