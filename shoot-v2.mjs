// shoot-v2.mjs — Langit Nusantara v2: render the 4 staged screenshots
// headless (1280x800, JPEG q82) from the game's own code. Serves game/
// on localhost, opens each ?shot= from shots.json, waits for the page's
// SHOT-READY signal, and writes screenshots/<name>.jpg. Exits 1 when a
// shot errors, times out, or reports console errors.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('/home/hatch/workspace/.scratch-shots/node_modules/playwright-core');

const ROOT = resolve(process.cwd());
const GAME_DIR = join(ROOT, 'game');
const SHOTS = JSON.parse(await readFile(join(ROOT, 'shots.json'), 'utf8'));
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
let failed = false;
for (const shot of SHOTS) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('requestfailed', (r) => errors.push('REQFAIL ' + r.url()));
  await page.goto(`http://127.0.0.1:${port}/index.html${shot.query}`, { waitUntil: 'load', timeout: 60000 });
  try {
    await page.waitForFunction(() => window.__shotReady === true, { timeout: 60000 });
  } catch {
    errors.push('TIMEOUT waiting for SHOT-READY (title=' + (await page.title()) + ')');
  }
  await page.waitForTimeout(400);
  const out = join(ROOT, 'screenshots', shot.name + '.jpg');
  await page.screenshot({ path: out, type: 'jpeg', quality: 82 });
  const { size } = await import('node:fs').then((fs) => fs.promises.stat(out));
  console.log(`${shot.name}.jpg  ${size} bytes  ${errors.length ? 'ERRORS: ' + errors.join(' | ') : 'clean'}`);
  if (errors.length) failed = true;
  await page.close();
}
await browser.close();
server.close();
if (failed) process.exit(1);
console.log('all shots rendered');
