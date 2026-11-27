// tools/probe-v2-flow.mjs — Langit Nusantara v2 browser probe (Playwright).
// RECONSTRUCTED 2026-11-27 (REALISM ROUND 2): the original /tmp probe was
// lost when /tmp was cleared between sessions, so this file rebuilds it
// with the same coverage intent — all four staged shots render clean, the
// live title -> dispatch -> brief -> flying flow works, C toggles the
// cockpit (panel + 3D interior in step), P pauses, and the R2 additions
// (bank staging, interior visibility, terrain atlas) hold in the live
// page. Saved in the repo (not /tmp) so it survives session restarts.
// Usage: node tools/probe-v2-flow.mjs  (exit 0 iff all 17 checks pass)

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('/home/hatch/workspace/.scratch-shots/node_modules/playwright-core');

const ROOT = resolve(process.cwd());
const GAME_DIR = join(ROOT, 'game');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg' };

const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = join(GAME_DIR, path === '/' ? 'index.html' : path);
    if (!file.startsWith(GAME_DIR)) { res.writeHead(403); res.end(); return; }
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await chromium.launch({
  args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--no-sandbox'],
});

let passed = 0;
let failed = 0;
function check(n, name, ok, extra = '') {
  if (ok) { passed++; console.log(`PASS ${n}. ${name}`); }
  else { failed++; console.log(`FAIL ${n}. ${name} ${extra}`); }
}
const approx = (a, b, tol) => Math.abs(a - b) <= tol;

async function newTrackedPage(url) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('requestfailed', (r) => errors.push('REQFAIL ' + r.url()));
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  return { page, errors };
}

try {
  // 1. Index loads clean.
  {
    const { page, errors } = await newTrackedPage(`http://127.0.0.1:${port}/index.html`);
    await page.waitForTimeout(1500);
    check(1, 'index loads with no console/page/request errors', errors.length === 0, JSON.stringify(errors));
    await page.close();
  }

  // 2-4. Cover shot: ready, bank staging, interior hidden in chase.
  {
    const { page, errors } = await newTrackedPage(`http://127.0.0.1:${port}/index.html?shot=play&seed=1`);
    await page.waitForFunction(() => window.__shotReady === true, { timeout: 60000 });
    check(2, 'shot play reaches SHOT-READY clean', errors.length === 0, JSON.stringify(errors));
    const st = await page.evaluate(() => ({ roll: flight.roll, heading: flight.heading, mode: cameraMode }));
    check(3, 'cover mid-roll pose roll ~-0.87, heading ~-1.58', approx(st.roll, -0.87, 0.12) && approx(st.heading, -1.58, 0.12) && st.mode === 'chase',
      JSON.stringify(st));
    const interiorHidden = await page.evaluate(() => {
      const g = camera.children.find((c) => c.type === 'Group');
      return g ? g.visible === false : false;
    });
    check(4, 'interior hidden in chase mode', interiorHidden);
    await page.close();
  }

  // 5-6. Cockpit shot: ready, cockpit mode, interior visible, 9 gauges.
  {
    const { page, errors } = await newTrackedPage(`http://127.0.0.1:${port}/index.html?shot=cockpit&seed=1`);
    await page.waitForFunction(() => window.__shotReady === true, { timeout: 60000 });
    check(5, 'shot cockpit reaches SHOT-READY clean', errors.length === 0, JSON.stringify(errors));
    const st = await page.evaluate(() => ({
      mode: cameraMode,
      interiorVisible: (() => { const g = camera.children.find((c) => c.type === 'Group'); return g ? g.visible : null; })(),
      panelDisplay: document.getElementById('cockpit-panel').style.display,
      gauges: document.querySelectorAll('.ck-gauge').length,
    }));
    check(6, 'cockpit mode + interior visible + panel flex + 9 gauges',
      st.mode === 'cockpit' && st.interiorVisible === true && st.panelDisplay === 'flex' && st.gauges === 9, JSON.stringify(st));
    await page.close();
  }

  // 7. Dispatch shot: ready, board visible, 6 missions.
  {
    const { page, errors } = await newTrackedPage(`http://127.0.0.1:${port}/index.html?shot=dispatch&seed=1`);
    await page.waitForFunction(() => window.__shotReady === true, { timeout: 60000 });
    const st = await page.evaluate(() => {
      const ov = document.getElementById('dispatch-ov');
      const text = ov ? ov.innerText : '';
      return {
        visible: ov && ov.style.display !== 'none',
        missions: ['POS MERPATI', 'KAWAH BERAPI', 'BADAI PENYELAMAT', 'ANGIN SAMPING', 'MEDEVAC SENJA', 'LINTAS PULAU']
          .filter((n) => text.includes(n)).length,
      };
    });
    check(7, 'shot dispatch ready, board visible, 6 missions listed', errors.length === 0 && st.visible && st.missions === 6, JSON.stringify({ ...st, errors }));
    await page.close();
  }

  // 8. Debrief shot: ready, grade shown.
  {
    const { page, errors } = await newTrackedPage(`http://127.0.0.1:${port}/index.html?shot=debrief&seed=1`);
    await page.waitForFunction(() => window.__shotReady === true, { timeout: 60000 });
    const st = await page.evaluate(() => {
      const ov = document.getElementById('debrief-ov');
      const g = document.getElementById('debrief-grade');
      return { visible: ov && ov.style.display !== 'none', grade: g ? g.textContent : null };
    });
    check(8, 'shot debrief ready, board visible, grade S/A/B/C shown',
      errors.length === 0 && st.visible && ['S', 'A', 'B', 'C', '✕'].includes(st.grade), JSON.stringify({ ...st, errors }));
    await page.close();
  }

  // 9-14. Live flow on one page.
  {
    const { page, errors } = await newTrackedPage(`http://127.0.0.1:${port}/index.html`);
    await page.waitForTimeout(1500);
    const title = await page.evaluate(() => ({
      mode,
      titleVisible: document.getElementById('hud-title').style.display,
    }));
    check(9, 'live title screen shows, mode title', title.mode === 'title' && title.titleVisible === 'flex', JSON.stringify(title));
    await page.keyboard.press('Enter');
    await page.waitForTimeout(400);
    const disp = await page.evaluate(() => ({
      mode,
      visible: document.getElementById('dispatch-ov').style.display !== 'none',
    }));
    check(10, 'Enter from title opens dispatch board', disp.mode === 'dispatch' && disp.visible, JSON.stringify(disp));
    await page.keyboard.press('Digit1');
    await page.waitForTimeout(400);
    const brief = await page.evaluate(() => ({
      mode,
      visible: document.getElementById('hud-brief').style.display !== 'none',
    }));
    check(11, 'Digit1 on dispatch opens mission brief', brief.mode === 'brief' && brief.visible, JSON.stringify(brief));
    await page.evaluate(() => startLeg(1));
    await page.waitForTimeout(500);
    const flying = await page.evaluate(() => ({ mode, status: flight.status }));
    check(12, 'startLeg(1) enters flying', flying.mode === 'flying' && flying.status === 'flying', JSON.stringify(flying));
    // C cycles chase -> cockpit -> near -> chase, panel follows.
    await page.keyboard.press('KeyC');
    await page.waitForTimeout(300);
    const c1 = await page.evaluate(() => ({ mode: cameraMode, panel: document.getElementById('cockpit-panel').style.display }));
    await page.keyboard.press('KeyC');
    await page.waitForTimeout(300);
    const c2 = await page.evaluate(() => ({ mode: cameraMode, panel: document.getElementById('cockpit-panel').style.display }));
    await page.keyboard.press('KeyC');
    await page.waitForTimeout(300);
    const c3 = await page.evaluate(() => ({ mode: cameraMode, panel: document.getElementById('cockpit-panel').style.display }));
    check(13, 'KeyC cycles chase->cockpit->near->chase with panel',
      c1.mode === 'cockpit' && c1.panel === 'flex' && c2.mode === 'near' && c2.panel === 'none' && c3.mode === 'chase' && c3.panel === 'none',
      JSON.stringify({ c1, c2, c3 }));
    await page.keyboard.press('KeyP');
    await page.waitForTimeout(300);
    const p1 = await page.evaluate(() => paused);
    await page.keyboard.press('KeyP');
    await page.waitForTimeout(300);
    const p2 = await page.evaluate(() => paused);
    check(14, 'KeyP pauses and resumes, live flow stays error-free', p1 === true && p2 === false && errors.length === 0, JSON.stringify({ p1, p2, errors }));
    await page.close();
  }

  // 15. Terrain atlas applied on the live mesh (220 segments, map set).
  {
    const { page, errors } = await newTrackedPage(`http://127.0.0.1:${port}/index.html?shot=play&seed=1`);
    await page.waitForFunction(() => window.__shotReady === true, { timeout: 60000 });
    const st = await page.evaluate(() => {
      let terrain = null;
      scene.traverse((o) => {
        if (o.isMesh && o.geometry && o.geometry.attributes && o.geometry.attributes.position
          && o.geometry.attributes.position.count === 221 * 221) terrain = o;
      });
      if (!terrain) return { found: false };
      return {
        found: true,
        hasMap: !!terrain.material.map,
        hasUv: !!terrain.geometry.attributes.uv,
        hasBump: !!terrain.material.bumpMap,
      };
    });
    check(15, 'terrain mesh 221x221 with atlas map + UVs + bump', st.found && st.hasMap && st.hasUv && st.hasBump, JSON.stringify({ ...st, errors }));
    await page.close();
  }

  // 16. Screenshots on disk: 4 JPEGs, each <= 256 KiB.
  {
    let okAll = true;
    const detail = [];
    for (const name of ['1-cover', '2-cockpit', '3-dispatch', '4-debrief']) {
      const f = join(ROOT, 'screenshots', name + '.jpg');
      try {
        const buf = await readFile(f);
        const { size } = await stat(f);
        const isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
        detail.push(`${name}:${size}`);
        if (!isJpeg || size > 262144 || size < 10000) okAll = false;
      } catch { okAll = false; detail.push(name + ':MISSING'); }
    }
    check(16, '4 screenshots are valid JPEGs <= 256 KiB', okAll, detail.join(' '));
  }

  // 17. Fuel: staged cover shows 82%.
  {
    const { page } = await newTrackedPage(`http://127.0.0.1:${port}/index.html?shot=play&seed=1`);
    await page.waitForFunction(() => window.__shotReady === true, { timeout: 60000 });
    const st = await page.evaluate(() => ({ fuel: flight.fuel, textHas82: document.body.innerText.includes('82%') }));
    // Staging burns fuel: 45 steps at throttle 0.75 take 82 -> ~81.64;
    // the HUD rounds to 82%. Assert the value, not the exact staging.
    check(17, 'cover staging fuel ~82% shown in HUD', Math.abs(st.fuel - 81.64) < 0.5 && st.textHas82, JSON.stringify(st));
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}

console.log(`\nprobe: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
