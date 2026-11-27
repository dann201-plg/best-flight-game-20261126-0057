/* debrief.js — Langit Nusantara v2: the landing debrief. After a
   landing, crash or timeout the board shows the grade (S/A/B/C), the
   approach trace — height against distance with the ideal 3° glidepath
   drawn beside the flown path, both from the trajectory the flight
   model recorded — and the touchdown numbers: sink rate, centerline
   offset, bank and speed. A hard landing names its cause. */

function createDebrief() {
  const root = document.getElementById('hud');

  const ov = document.createElement('div');
  ov.id = 'debrief-ov';
  ov.className = 'overlay';
  ov.style.display = 'none';
  ov.innerHTML = '<div class="ov-inner debrief-inner">'
    + '<div class="ov-kicker" id="debrief-kicker">MISSION COMPLETE</div>'
    + '<h2 id="debrief-title"></h2>'
    + '<div class="debrief-body">'
    + '<div class="debrief-grade"><div id="debrief-grade">S</div><div class="debrief-grade-cap" id="debrief-grade-cap">GREASED LANDING</div></div>'
    + '<div class="debrief-right"><canvas id="debrief-trace" width="520" height="240"></canvas>'
    + '<div class="debrief-metrics" id="debrief-metrics"></div></div>'
    + '</div>'
    + '<div class="ov-text" id="debrief-reason"></div>'
    + '<div class="ov-controls" id="debrief-score"></div>'
    + '<div><button id="debrief-retry" class="ov-button">COBA LAGI ▸</button> '
    + '<button id="debrief-dispatch" class="ov-button ov-button-ghost">PILIH MISI ▸</button></div>'
    + '<div class="ov-foot">R tekan lagi · ESC ke papan misi</div>'
    + '</div>';
  root.appendChild(ov);

  const traceCanvas = document.getElementById('debrief-trace');
  let onRetryFn = null;
  let onDispatchFn = null;

  // Height (m) against distance to the threshold (m). The ideal 3-degree
  // glidepath is a straight line; the flown path comes from the recorded
  // trajectory. Runway ground level is 4.6 m in this world.
  function drawTrace(trajectory) {
    const g = traceCanvas.getContext('2d');
    const W = 520;
    const H = 240;
    const padL = 44;
    const padB = 26;
    const padT = 14;
    g.clearRect(0, 0, W, H);
    g.fillStyle = 'rgba(4,20,28,0.55)';
    g.fillRect(0, 0, W, H);
    const maxD = 1500;
    const maxH = 300;
    const xOf = (d) => padL + (d / maxD) * (W - padL - 12);
    const yOf = (h) => (H - padB) - (h / maxH) * (H - padB - padT);
    // Grid + labels.
    g.strokeStyle = 'rgba(255,255,255,0.14)';
    g.lineWidth = 1;
    g.fillStyle = 'rgba(207,238,222,0.8)';
    g.font = '11px sans-serif';
    g.textAlign = 'center';
    for (const d of [0, 500, 1000, 1500]) {
      g.beginPath();
      g.moveTo(xOf(d), padT);
      g.lineTo(xOf(d), H - padB);
      g.stroke();
      g.fillText(d + ' m', xOf(d), H - 8);
    }
    g.textAlign = 'right';
    for (const h of [0, 100, 200, 300]) {
      g.beginPath();
      g.moveTo(padL, yOf(h));
      g.lineTo(W - 12, yOf(h));
      g.stroke();
      g.fillText(h + ' m', padL - 6, yOf(h) + 4);
    }
    g.fillStyle = '#9fc4d8';
    g.textAlign = 'left';
    g.fillText('JARAK KE THRESHOLD', padL, 12);
    // Ideal 3-degree glidepath.
    g.strokeStyle = '#8ef5c0';
    g.lineWidth = 2;
    g.setLineDash([7, 5]);
    g.beginPath();
    g.moveTo(xOf(0), yOf(0));
    g.lineTo(xOf(maxD), yOf(maxD * 0.0524));
    g.stroke();
    g.setLineDash([]);
    g.fillStyle = '#8ef5c0';
    g.fillText('IDEAL 3°', xOf(1050), yOf(1050 * 0.0524) - 8);
    // Flown path.
    const pts = (trajectory || []).filter((p) => p.z >= 450 && p.z <= 2000)
      .map((p) => ({ d: p.z - 450, h: Math.max(0, p.y - 4.6) }))
      .sort((a, b) => b.d - a.d);
    if (pts.length > 1) {
      g.strokeStyle = '#ffd76a';
      g.lineWidth = 3;
      g.beginPath();
      pts.forEach((p, i) => {
        const x = xOf(Math.min(p.d, maxD));
        const y = yOf(Math.min(p.h, maxH));
        if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
      });
      g.stroke();
      const last = pts[pts.length - 1];
      g.fillStyle = '#ffd76a';
      g.beginPath();
      g.arc(xOf(Math.min(last.d, maxD)), yOf(Math.min(last.h, maxH)), 5, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#ffd76a';
      g.fillText('DITERBANGKAN', xOf(Math.min(last.d, maxD)) + 10, yOf(Math.min(last.h, maxH)) - 8);
    }
  }

  function fmtSink(sinkMs) {
    return sinkMs.toFixed(1) + ' m/s · ' + Math.round(sinkMs * 196.85) + ' FPM';
  }

  return {
    // result: {outcome, mission, grade, points, metrics, trajectory,
    // reason, scoreLine, nextLabel}
    show(result) {
      const failed = result.outcome !== 'landed';
      document.getElementById('debrief-kicker').textContent = failed
        ? 'MISSION FAILED' : 'MISSION COMPLETE';
      document.getElementById('debrief-title').textContent = result.mission;
      const gradeEl = document.getElementById('debrief-grade');
      gradeEl.textContent = failed ? '✕' : result.grade;
      gradeEl.style.color = failed ? '#ff5a4e' : result.grade === 'S' ? '#ffd76a' : '#8ef5c0';
      document.getElementById('debrief-grade-cap').textContent = failed
        ? 'BELUM BERHASIL' : gradeCaption(result.grade);
      drawTrace(result.trajectory);
      const m = result.metrics || {};
      document.getElementById('debrief-metrics').innerHTML =
        '<div><span>SINK RATE</span><b>' + fmtSink(m.sink || 0) + '</b></div>'
        + '<div><span>CENTERLINE</span><b>' + (m.offset == null ? '—' : m.offset.toFixed(1) + ' m') + '</b></div>'
        + '<div><span>BANK</span><b>' + (m.bankDeg == null ? '—' : m.bankDeg.toFixed(1) + '°') + '</b></div>'
        + '<div><span>SPEED</span><b>' + (m.speed == null ? '—' : Math.round(m.speed * 1.944) + ' KT') + '</b></div>'
        + '<div><span>FUEL SISA</span><b>' + Math.round(m.fuel == null ? 0 : m.fuel) + '%</b></div>';
      document.getElementById('debrief-reason').textContent = result.reason || '';
      document.getElementById('debrief-score').textContent = result.scoreLine || '';
      document.getElementById('debrief-retry').textContent = result.nextLabel || 'COBA LAGI ▸';
      ov.style.display = 'flex';
    },
    hide() { ov.style.display = 'none'; },
    onRetry(fn) {
      onRetryFn = fn;
      document.getElementById('debrief-retry').addEventListener('click', () => { if (onRetryFn) onRetryFn(); });
    },
    onDispatch(fn) {
      onDispatchFn = fn;
      document.getElementById('debrief-dispatch').addEventListener('click', () => { if (onDispatchFn) onDispatchFn(); });
    },
  };
}

function gradeCaption(grade) {
  if (grade === 'S') return 'GREASED LANDING';
  if (grade === 'A') return 'HALUS SEKALI';
  if (grade === 'B') return 'MENDARAT AMAN';
  return 'MENDARAT — MASIH KASAR';
}
