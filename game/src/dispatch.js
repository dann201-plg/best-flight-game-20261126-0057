/* dispatch.js — Langit Nusantara v2: the dispatch board. The campaign
   menu: six named sorties with their goals, weather and fuel, medals
   earned, the pilot's total score, and a sketched archipelago chart with
   each mission's route. Pick a mission by click, keys 1–6, or ESC back
   to it from a briefing or debrief. Pure DOM + canvas, no borrowed art. */

function createDispatch() {
  const root = document.getElementById('hud');

  const ov = document.createElement('div');
  ov.id = 'dispatch-ov';
  ov.className = 'overlay';
  ov.style.display = 'none';
  ov.innerHTML = '<div class="ov-inner dispatch-inner">'
    + '<div class="ov-kicker">LANGIT NUSANTARA · PAPAN MISI</div>'
    + '<h2>DISPATCH BOARD</h2>'
    + '<div class="ov-sub" id="dispatch-score">SKOR PILOT 0 · 0/6 MEDALI</div>'
    + '<div class="dispatch-body">'
    + '<div class="dispatch-list" id="dispatch-list"></div>'
    + '<div class="dispatch-map"><canvas id="dispatch-map" width="420" height="340"></canvas>'
    + '<div class="dispatch-map-cap">PETA HIDROGRAFI · RUTE 6 MISI</div></div>'
    + '</div>'
    + '<div class="ov-controls">Klik misi atau tekan 1–6 untuk terbang · C ganti kamera kokpit/chase · ESC kembali ke sini</div>'
    + '</div>';
  root.appendChild(ov);

  const listEl = document.getElementById('dispatch-list');
  const mapCanvas = document.getElementById('dispatch-map');
  let progress = createPilotProgress();
  let onSelectFn = null;

  // Hydrographic chart on cream paper: pale sea wash with depth
  // contours and soundings, sand-ringed islands, red/green channel
  // markers, a compass rose and dashed mission routes — a navigator's
  // chart, not an abstract blob map. Same islands and routes as before;
  // only the rendering changed.
  function drawMap() {
    const g = mapCanvas.getContext('2d');
    const W = 420;
    const H = 340;
    g.clearRect(0, 0, W, H);
    // Cream chart paper.
    g.fillStyle = '#e9dec2';
    g.fillRect(0, 0, W, H);
    for (let i = 0; i < 260; i++) {
      g.fillStyle = Math.random() > 0.5 ? 'rgba(120,90,40,0.05)' : 'rgba(255,255,255,0.06)';
      g.fillRect(Math.random() * W, Math.random() * H, 2, 2);
    }
    // Sea wash.
    const sea = g.createLinearGradient(0, 0, 0, H);
    sea.addColorStop(0, '#c3d4da');
    sea.addColorStop(1, '#a7c2cc');
    g.fillStyle = sea;
    g.fillRect(0, 0, W, H);
    // Faint lat/long graticule.
    g.strokeStyle = 'rgba(40,80,120,0.14)';
    g.lineWidth = 1;
    for (let x = 60; x < W; x += 60) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    for (let y = 60; y < H; y += 60) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    // Islands: sand ring, green-tan land, dark coastline, depth
    // contours ringing outward into the sea.
    const islands = [
      [70, 60, 46, 30], [180, 45, 60, 34], [300, 70, 52, 30], [350, 150, 44, 60],
      [90, 160, 70, 40], [210, 140, 56, 42], [280, 220, 66, 36], [120, 250, 58, 34],
      [200, 290, 70, 30], [330, 290, 46, 26],
    ];
    for (const [x, y, rx, ry] of islands) {
      for (const k of [1.7, 1.35]) {
        g.strokeStyle = 'rgba(40,90,140,0.4)';
        g.lineWidth = 1;
        g.beginPath();
        g.ellipse(x, y, rx * k, ry * k, 0.3, 0, Math.PI * 2);
        g.stroke();
      }
      g.fillStyle = '#d8c08d';
      g.beginPath();
      g.ellipse(x, y, rx * 1.12, ry * 1.12, 0.3, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#7a9a58';
      g.beginPath();
      g.ellipse(x, y, rx, ry, 0.3, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#5d7f42';
      g.beginPath();
      g.ellipse(x - 8, y - 6, rx * 0.55, ry * 0.5, 0.3, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = '#4a3a22';
      g.lineWidth = 1.5;
      g.beginPath();
      g.ellipse(x, y, rx, ry, 0.3, 0, Math.PI * 2);
      g.stroke();
    }
    // Depth soundings in the open water.
    g.fillStyle = '#2a5a8a';
    g.font = '10px sans-serif';
    g.textAlign = 'center';
    for (const [x, y, d] of [[40, 120, '18'], [150, 210, '24'], [250, 90, '12'], [340, 240, '31'], [60, 310, '9'], [390, 90, '15']]) {
      g.fillText(d, x, y);
    }
    g.textAlign = 'left';
    // Volcano cone (mission 2) and runway strip (missions end here).
    g.fillStyle = '#7a5a3a';
    g.beginPath();
    g.moveTo(180, 118);
    g.lineTo(210, 140);
    g.lineTo(150, 140);
    g.closePath();
    g.fill();
    g.fillStyle = '#e8e8e8';
    g.beginPath();
    g.moveTo(180, 118);
    g.lineTo(188, 128);
    g.lineTo(172, 128);
    g.closePath();
    g.fill();
    g.fillStyle = '#2e2e30';
    g.fillRect(196, 268, 8, 44);
    g.fillStyle = '#1c3a5c';
    g.font = 'bold 12px sans-serif';
    g.fillText('RWY 36', 208, 316);
    // Compass rose, top-right.
    const cx = 382;
    const cy = 30;
    g.strokeStyle = '#1c3a5c';
    g.lineWidth = 1.5;
    g.beginPath();
    g.arc(cx, cy, 18, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = '#b03a2a';
    g.beginPath();
    g.moveTo(cx, cy - 16);
    g.lineTo(cx - 4, cy + 2);
    g.lineTo(cx + 4, cy + 2);
    g.closePath();
    g.fill();
    g.fillStyle = '#1c3a5c';
    g.font = 'bold 10px sans-serif';
    g.textAlign = 'center';
    g.fillText('N', cx, cy - 22);
    g.textAlign = 'left';
    // Mission routes: numbered dots joined by dashed lines.
    const routes = [
      [[70, 60], [180, 45], [300, 70], [200, 290]],
      [[180, 118], [210, 140], [150, 140], [200, 290]],
      [[90, 160], [210, 140], [280, 220], [200, 290]],
      [[300, 70], [200, 290]],
      [[70, 60], [120, 250], [200, 290]],
      [[70, 60], [180, 118], [300, 70], [200, 290]],
    ];
    const colors = ['#b03a2a', '#8a5a00', '#1c6b3a', '#1c3a5c', '#6b2a8a', '#8a4a1c'];
    routes.forEach((pts, i) => {
      g.strokeStyle = colors[i];
      g.lineWidth = 2;
      g.setLineDash([6, 5]);
      g.beginPath();
      pts.forEach(([x, y], j) => { if (j === 0) g.moveTo(x, y); else g.lineTo(x, y); });
      g.stroke();
      g.setLineDash([]);
      pts.forEach(([x, y], j) => {
        // Channel marker: red cone for port, green can for starboard.
        g.fillStyle = j === 0 ? '#b03a2a' : '#1c6b3a';
        g.beginPath();
        g.arc(x, y, j === 0 ? 7 : 5, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = '#e9dec2';
        g.lineWidth = 1;
        g.stroke();
        g.fillStyle = '#e9dec2';
        g.font = 'bold 11px sans-serif';
        g.textAlign = 'center';
        if (j === 0) g.fillText(String(i + 1), x, y + 4);
        g.textAlign = 'left';
      });
    });
  }

  function renderList() {
    listEl.innerHTML = '';
    MISSIONS.forEach((m, i) => {
      const medal = progress.medals[i + 1];
      const done = !!progress.completed[i + 1];
      const row = document.createElement('div');
      row.className = 'mission-row' + (done ? ' done' : '');
      row.innerHTML = '<div class="mission-num">' + (i + 1) + '</div>'
        + '<div class="mission-main"><div class="mission-name">' + m.name + '</div>'
        + '<div class="mission-goal">' + m.goal + '</div>'
        + '<div class="mission-meta">' + m.rings.length + ' ring · angin ' + m.windKt
        + ' kt · fuel ' + m.fuel + '% · ' + m.timeLimit + ' dtk</div></div>'
        + '<div class="mission-medal">' + (medal || '—') + '</div>';
      row.addEventListener('click', () => { if (onSelectFn) onSelectFn(i + 1); });
      listEl.appendChild(row);
    });
    const medalCount = Object.keys(progress.medals).length;
    document.getElementById('dispatch-score').textContent =
      'SKOR PILOT ' + progress.score + ' · ' + medalCount + '/6 MEDALI';
  }

  return {
    show(state) {
      if (state) progress = state;
      renderList();
      drawMap();
      ov.style.display = 'flex';
    },
    hide() { ov.style.display = 'none'; },
    onSelect(fn) { onSelectFn = fn; },
    getProgress() { return progress; },
    setProgress(state) { progress = state; },
    recordResult(missionId, grade) {
      const medal = medalForGrade(grade);
      if (medal && !progress.medals[missionId]) progress.medals[missionId] = medal;
      progress.completed[missionId] = true;
    },
  };
}
