/* scroll-forge QA — proves the camera actually flies and nothing errors. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const PW = process.env.PW_PATH || 'playwright';
const { chromium } = await import(PW);

// Point QA_URL at an already-running app (Next/Vite dev server, staging) to QA
// the world where it actually lives. Otherwise we serve this directory.
const TARGET_URL = process.env.QA_URL;

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css' };
let server = null;
if (!TARGET_URL) {
  server = http.createServer((req, res) => {
    const p = path.join(DIR, decodeURIComponent(req.url.split('?')[0]) === '/' ? '/index.html' : decodeURIComponent(req.url.split('?')[0]));
    fs.readFile(p, (e, buf) => {
      if (e) { res.writeHead(404); return res.end('nope'); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
      res.end(buf);
    });
  });
  await new Promise((r) => server.listen(0, r));
}
const url = TARGET_URL || `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch({
  channel: process.env.PW_CHANNEL || 'chrome',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
const failed = [];
page.on('response', (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });

await page.goto(url, { waitUntil: 'load' });
// `__scrollForge` is published by the engine at mount; `__built` only exists if
// the page wired an onReady hook, so wait on the engine itself and treat the
// build time as optional. A dev server may also compile on first hit — hence
// the generous timeout.
await page.waitForFunction(
  // `segments` stays undefined until buildPath() runs, which is a frame or two
  // after the api object is published — so optional-chain the whole path.
  () => (window.__scrollForge?.segments?.length ?? 0) > 0,
  null,
  { timeout: 90000 },
);
const buildMs = await page.evaluate(() => window.__built ?? null);

// Sample the whole flight, including the exact seam between every scene and
// fly-over — the frames a video-based build would pop at.
const shots = [0, 0.08, 0.16, 0.25, 0.34, 0.42, 0.5, 0.58, 0.66, 0.74, 0.82, 0.9, 1.0];
const outDir = path.join(DIR, 'shots');
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const positions = [];
for (const p of shots) {
  const info = await page.evaluate((prog) => {
    const sf = window.__scrollForge;
    sf.setProgress(prog);
    const c = sf.camera;
    return {
      x: +c.position.x.toFixed(2), y: +c.position.y.toFixed(2), z: +c.position.z.toFixed(2),
      enclosure: sf.enclosure(),
    };
  }, p);
  positions.push({ p, ...info });
  await page.waitForTimeout(340);   // let the copy cross-fade settle before shooting
  await page.screenshot({ path: path.join(outDir, `p${String(Math.round(p * 100)).padStart(3, '0')}.png`) });
}
const buried = positions.filter((q) => q.enclosure >= 0.83);

// Continuity: no frame-to-frame teleport. A jump far larger than its neighbours
// means the spline is broken (which is the only way this engine can "pop").
const hops = [];
for (let i = 1; i < positions.length; i++) {
  const a = positions[i - 1], b = positions[i];
  hops.push(Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z));
}
const mean = hops.reduce((s, h) => s + h, 0) / hops.length;
const worst = Math.max(...hops);

// Does REAL scrolling actually drive the camera? setProgress() above calls the
// engine directly and so passes even when nothing is wired to scroll — which is
// exactly how a page mounted in an app shell (inner scroll container, window
// never scrolls) reports all-green while being completely frozen in a browser.
const scrollDrive = await page.evaluate(async () => {
  const sf = window.__scrollForge;
  const host = sf.scroller || window;
  const setTop = (v) => { if (sf.scroller) sf.scroller.scrollTop = v; else window.scrollTo(0, v); };
  const getTop = () => (sf.scroller ? sf.scroller.scrollTop : window.scrollY);
  const maxTop = sf.scroller
    ? sf.scroller.scrollHeight - sf.scroller.clientHeight
    : document.documentElement.scrollHeight - window.innerHeight;

  setTop(0);
  await new Promise((r) => setTimeout(r, 260));
  const a = sf.camera.position.clone();

  setTop(Math.round(maxTop * 0.5));
  await new Promise((r) => setTimeout(r, 700));   // let the damping settle
  const b = sf.camera.position.clone();

  return {
    scrollerTag: sf.scroller ? sf.scroller.tagName.toLowerCase() : 'window',
    scrollable: Math.round(maxTop),
    reachedTop: getTop(),
    cameraMoved: +a.distanceTo(b).toFixed(2),
    listening: host !== undefined,
  };
});

const stats = await page.evaluate(() => {
  const r = window.__scrollForge.renderer.info;
  return { drawCalls: r.render.calls, triangles: r.render.triangles, geometries: r.memory.geometries, textures: r.memory.textures };
});

// Mobile pass: portrait viewport must still frame each scene.
await page.setViewportSize({ width: 390, height: 844 });
await page.evaluate(() => window.dispatchEvent(new Event('resize')));
await page.evaluate(() => window.__scrollForge.setProgress(0.16));
await page.screenshot({ path: path.join(outDir, 'mobile-p016.png') });

console.log(JSON.stringify({
  buildMs, errors, failed, stats, scrollDrive,
  buriedFrames: buried.map((q) => q.p),
  camera: positions,
  continuity: { meanHop: +mean.toFixed(2), worstHop: +worst.toFixed(2), ratio: +(worst / mean).toFixed(2) },
}, null, 2));

await browser.close();
server?.close();
