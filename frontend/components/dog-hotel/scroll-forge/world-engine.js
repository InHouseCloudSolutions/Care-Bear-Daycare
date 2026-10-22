/* ============================================================================
   scroll-forge — live WebGL scroll-scrubbed camera-flight engine
   ----------------------------------------------------------------------------
   Scroll drives a real camera through a real 3D world. Nothing is pre-rendered,
   so the failure mode that dominates video-based scroll cinematics — a visible
   "pop" where two generated clips meet — cannot occur here: there is one camera,
   on one continuous spline, in one scene graph. Seamlessness is structural, not
   something you QA for.

   WHAT IT COSTS
     Nothing. No API key, no generation credits, no subscription. The world is
     built from the declarative spec you hand it (see world-spec.md), at runtime,
     in about 150 KB of geometry. A 7-scene world is smaller than one JPEG.

   USAGE
     import { mountScrollForge } from './world-engine.js';
     mountScrollForge(document.getElementById('world'), {
       brand: { name: 'Pearl & Co.', href: '#top' },
       palette: { primary:'#C8785A', accent:'#E8B44A', ... },
       seed: 7,                     // any int — reshuffles scatter; same seed, same world
       diveScroll: 1.5,             // viewport-heights of scroll per scene dive
       connScroll: 1.0,             // ...per fly-over between scenes
       sections: [ { id, label, accent, eyebrow, title, body, tags, cta,
                     scroll, linger, focus:[x,y,z], scene:{ island, props } }, … ],
     });

   PACING (same vocabulary as the video-based skills, so it transfers)
     section.scroll  viewport-heights of scroll spent diving into this scene.
                     Bigger = longer dwell. Give the hero and the finale more.
     section.linger  0..1. Remaps time so the camera SETTLES mid-scene — exactly
                     where the copy peaks — and moves briskly at the edges.
                     Endpoints are untouched (f(0)=0, f(1)=1) so seams are
                     unaffected. Keep ≤ 0.6; 1.0 is a full stop.

   THEME (CSS custom properties on the container or :root)
     --sf-bg  --sf-ink  --sf-ink-soft  --sf-accent
     --sf-font-display  --sf-font-body

   RETURNS  { destroy, goTo(i), setProgress(p), sections, camera, scene }
   Also published as window.__scrollForge for headless QA (see SKILL Step 6).

   REQUIRES  three.js (MIT) as an ES module — vendor it locally, no CDN needed.
   ========================================================================== */

import * as THREE from 'three';
import { makeContext, buildSceneGroup, placeProp } from './kit.js';

const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

export function mountScrollForge(container, config) {
  const SECTIONS = config.sections || [];
  const N = SECTIONS.length;
  if (!N) { console.warn('[scroll-forge] no sections'); return null; }

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  const smallMQ = window.matchMedia('(max-width: 860px)');
  const isMobile = () => coarse || smallMQ.matches;

  const DIVE_W = config.diveScroll ?? 1.5;
  const CONN_W = config.connScroll ?? 1.0;
  const ctx = makeContext(config.palette || {}, config.seed ?? 7);
  const P = ctx.palette;

  injectCSS();
  container.classList.add('sf-root');

  /* ------------------------------------------------------------------ DOM */
  const stage = el('div', 'sf-stage');
  const canvas = document.createElement('canvas');
  canvas.className = 'sf-canvas';
  stage.appendChild(canvas);
  const loader = el('div', 'sf-loader');
  loader.innerHTML = '<span class="sf-loader__dot"></span><span class="sf-loader__dot"></span><span class="sf-loader__dot"></span>';
  stage.appendChild(loader);
  container.appendChild(stage);

  const copyLayer = el('div', 'sf-copy');
  container.appendChild(copyLayer);

  const ui = el('div', 'sf-ui');
  container.appendChild(ui);

  // Top bar: brand + section rail
  const topbar = el('div', 'sf-topbar');
  if (config.brand) {
    const b = el('a', 'sf-brand');
    b.href = config.brand.href || '#';
    b.innerHTML = `<span class="sf-brand__mark"></span><span>${esc(config.brand.name || '')}</span>`;
    topbar.appendChild(b);
  }
  const railDots = [];
  if (config.rail !== false) {
    const rail = el('nav', 'sf-rail');
    SECTIONS.forEach((s, i) => {
      const d = el('button', 'sf-rail__dot');
      d.type = 'button';
      d.setAttribute('aria-label', `Go to ${s.label || s.id || `scene ${i + 1}`}`);
      d.innerHTML = `<i></i><span>${esc(s.label || s.id || '')}</span>`;
      d.addEventListener('click', () => goTo(i));
      rail.appendChild(d);
      railDots.push(d);
    });
    topbar.appendChild(rail);
  }
  if (config.cta) {
    const c = el('a', 'sf-topcta');
    c.href = config.cta.href || '#';
    c.textContent = config.cta.label || 'Get started';
    topbar.appendChild(c);
  }
  if (topbar.childElementCount) ui.appendChild(topbar);

  const progress = el('div', 'sf-progress');
  const progressFill = el('span');
  progress.appendChild(progressFill);
  ui.appendChild(progress);

  const hint = el('div', 'sf-hint');
  hint.textContent = config.hint || 'scroll to fly in';
  ui.appendChild(hint);

  // Per-section copy blocks (cross-faded, pinned — the page never scrolls text)
  const copyBlocks = SECTIONS.map((s, i) => {
    const c = el('article', 'sf-block');
    c.id = s.id || `scene-${i}`;
    let html = '';
    if (s.eyebrow) html += `<p class="sf-eyebrow">${esc(s.eyebrow)}</p>`;
    if (s.title) html += `<h2 class="sf-title">${esc(s.title)}</h2>`;
    if (s.body) html += `<p class="sf-body">${esc(s.body)}</p>`;
    if (s.tags && s.tags.length) {
      html += `<ul class="sf-tags">${s.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
    }
    if (s.cta) {
      const p = s.cta.primary, sec = s.cta.secondary;
      html += '<div class="sf-cta">';
      if (p) html += linkHtml('sf-btn sf-btn--primary', p);
      if (sec) html += linkHtml('sf-btn', sec);
      html += '</div>';
    }
    c.innerHTML = html;
    copyLayer.appendChild(c);
    return c;
  });

  const spacer = el('div', 'sf-scroll');
  container.appendChild(spacer);

  /* --------------------------------------------------------------- three */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile() ? 2 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = config.exposure ?? 1.05;
  renderer.shadowMap.enabled = config.shadows !== false;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(config.fov ?? 46, 1, 0.1, 900);

  const skyTop = config.sky?.top || '#BFD8E8';
  const skyBottom = config.sky?.bottom || P.light;
  scene.add(makeSky(skyTop, skyBottom));
  scene.fog = new THREE.Fog(new THREE.Color(skyBottom), config.fog?.near ?? 60, config.fog?.far ?? 320);

  const hemi = new THREE.HemisphereLight(new THREE.Color(skyTop), new THREE.Color(P.ground), 0.75);
  scene.add(hemi);
  scene.add(new THREE.AmbientLight(0xffffff, 0.22));

  const sun = new THREE.DirectionalLight(0xfff4e2, 1.9);
  sun.castShadow = config.shadows !== false;
  sun.shadow.mapSize.set(isMobile() ? 1024 : 2048, isMobile() ? 1024 : 2048);
  sun.shadow.bias = -0.0009;
  sun.shadow.normalBias = 0.02;
  const sunTarget = new THREE.Object3D();
  scene.add(sun, sunTarget);
  sun.target = sunTarget;

  /* ----------------------------------------------------- world layout */
  // Islands are laid along a gently serpentine path so that consecutive scenes
  // are visible from each other — that mutual visibility is what makes the
  // fly-over read as one connected world rather than a slideshow.
  const layout = [];
  {
    let pos = V3(0, 0, 0);
    let theta = 0;
    for (let i = 0; i < N; i++) {
      const sc = SECTIONS[i].scene || {};
      const R = (sc.island && sc.island.radius) || config.islandRadius || 9;
      layout.push({ center: pos.clone(), radius: R, heading: theta });
      if (i < N - 1) {
        const nextSc = SECTIONS[i + 1].scene || {};
        const R2 = (nextSc.island && nextSc.island.radius) || config.islandRadius || 9;
        const gap = config.gap ?? 27;
        const dist = R + R2 + gap;
        const turn = ((i % 2 === 0) ? 1 : -1) * (config.turn ?? 0.34);
        theta += turn;
        pos = pos.clone().add(V3(Math.sin(theta) * dist, 0, -Math.cos(theta) * dist));
        // Gentle vertical drift keeps the fly-over from feeling like a tram line.
        pos.y = Math.sin(i * 1.3) * (config.drift ?? 2.2);
      }
    }
  }

  const worldRoot = new THREE.Group();
  scene.add(worldRoot);

  /* -------------------------------------------------- camera anchor path */
  // Per scene: A (outside, high) -> M (mid dive) -> B (inside, low).
  // Between scenes: L (lift), the apex of the fly-over.
  const pts = [];      // camera positions
  const tgts = [];     // matching look-at targets
  const anchors = [];  // { kind:'A'|'M'|'B'|'L', si, index }

  function approachDir(i) {
    // Direction the camera travels as it enters scene i.
    const c = layout[i].center;
    const prev = i > 0 ? layout[i - 1].center : null;
    const next = i < N - 1 ? layout[i + 1].center : null;
    let d;
    if (prev) d = c.clone().sub(prev);
    else if (next) d = next.clone().sub(c);
    else d = V3(0, 0, -1);
    d.y = 0;
    if (d.lengthSq() < 1e-6) d = V3(0, 0, -1);
    return d.normalize();
  }

  // How far in the dive stops, as a fraction of island radius. The camera must
  // NOT reach the island centre: that is where authors naturally put the tallest
  // building, and a camera that arrives there ends the shot inside a wall.
  // Everything between STOP*R and the centre is the "keep clear" core.
  // Deliberately a MEDIUM shot, not a landing. Ending the dive down among the
  // props looks great when the author composed for it and terrible otherwise
  // (you end up nose-first in a fence). Holding above the scene reads as "flew
  // in and arrived" for any composition. Authors who want the intimate shot say
  // so explicitly with `camera: { to: [...] }`.
  const STOP = config.diveStop ?? 0.95;

  /** Scene i's world rotation — must match what buildWorld() applies. */
  function sceneYaw(i) {
    const d = approachDir(i);
    return Math.atan2(-d.x, -d.z) + ((SECTIONS[i].scene || {}).rotate ?? 0);
  }

  function anchorsFor(i) {
    const s = SECTIONS[i];
    const { center: C, radius: R } = layout[i];
    const dir = approachDir(i);
    // `focus` and `camera` are authored in the SAME local frame as the props,
    // so they get the same yaw the scene group does.
    const yaw = sceneYaw(i);
    const rel = (v) => C.clone().add(V3(v[0], v[1], v[2]).applyAxisAngle(V3(0, 1, 0), yaw));
    const cam = s.camera || {};
    return {
      dir, R, C,
      focus: s.focus ? rel(s.focus) : C.clone().add(V3(0, R * 0.16, 0)),
      A: cam.from ? rel(cam.from) : C.clone().add(dir.clone().multiplyScalar(-R * 2.5)).add(V3(0, R * 1.40, 0)),
      M: cam.via ? rel(cam.via) : C.clone().add(dir.clone().multiplyScalar(-R * 1.65)).add(V3(0, R * 0.88, 0)),
      B: cam.to ? rel(cam.to) : C.clone().add(dir.clone().multiplyScalar(-R * STOP)).add(V3(0, R * 0.55, 0)),
    };
  }

  function push(p, t, kind, si) {
    anchors.push({ kind, si, index: pts.length });
    pts.push(p); tgts.push(t);
  }

  // The fixed-fraction stop above is only a first guess — it knows the island's
  // radius but not what the author actually built on it. A scene with a tall
  // mass near its centre needs the dive to end further out, or the shot ends as
  // a wall filling the frame. So: walk the anchor back until it has real
  // clearance from real geometry. Runs once, after the world exists, which is
  // why the path is built AFTER buildWorld() rather than alongside the layout.
  const _rc = new THREE.Raycaster();
  const _bb = new THREE.Box3();
  function clearAnchor(p, target, minBase) {
    const fwd = target.clone().sub(p).normalize();
    const tanV = Math.tan((camera.fov * Math.PI) / 360);
    for (let k = 0; k < 8; k++) {
      _rc.set(p, fwd);
      _rc.far = 60;
      const hit = _rc.intersectObject(worldRoot, true)[0];
      if (!hit) break;
      // The requirement isn't "don't touch it" — it's "you can SEE it". A mass
      // of height h needs h/(2·tan(fov/2)) of distance just to fit the frame;
      // anything closer reads as a wall even though nothing is clipping.
      _bb.setFromObject(hit.object);
      const h = Math.max(_bb.max.y - _bb.min.y, 1);
      const need = Math.max(minBase, (h / (2 * tanV)) * 1.15);
      if (hit.distance >= need) break;
      p.addScaledVector(fwd, -(need - hit.distance + 0.25));
    }
    return p;
  }

  let posCurve, tgtCurve, LAST, SEGMENTS, TOTAL_W;
  const tAt = (index) => index / LAST;
  const idxOf = (kind, si) => anchors.find((a) => a.kind === kind && a.si === si).index;

  function buildPath() {
    pts.length = 0; tgts.length = 0; anchors.length = 0;

    for (let i = 0; i < N; i++) {
      const s = SECTIONS[i];
      const { A, M, B, C, R, dir, focus } = anchorsFor(i);
      const cam = s.camera || {};
      const lookAt = cam.lookAt
        ? C.clone().add(V3(...cam.lookAt).applyAxisAngle(V3(0, 1, 0), sceneYaw(i)))
        : null;
      // The dive ends already looking PAST the focus, along the direction of
      // travel, so the fly-over that follows continues the motion instead of
      // reversing it — a reversal at a boundary is what reads as a stutter.
      const tM = lookAt || focus.clone();
      const tB = (lookAt || focus).clone().add(dir.clone().multiplyScalar(R * 0.9));

      // An explicit `camera.via` / `camera.to` is the author's call — respect it.
      if (!cam.via) clearAnchor(M, tM, R * 0.40);
      if (!cam.to) clearAnchor(B, tB, R * 0.55);

      const tA = lookAt || C.clone().add(V3(0, R * 0.05, 0));
      push(A, tA, 'A', i);
      push(M, tM, 'M', i);
      push(B, tB, 'B', i);

      if (i < N - 1) {
        const { center: C2, radius: R2 } = layout[i + 1];
        const A2 = anchorsFor(i + 1).A;
        // Apex of the fly-over. Kept fairly low and aimed mostly at the NEXT
        // island: a high apex aimed at the midpoint just shows empty sky, which
        // is the one moment the world stops selling itself.
        const L = B.clone().lerp(A2, 0.5).add(V3(0, Math.max(R, R2) * (config.flyLift ?? 1.25), 0));
        push(L, C.clone().lerp(C2, 0.72), 'L', i);
      }
    }

    // Centripetal Catmull-Rom passes exactly through every anchor and cannot
    // cusp or overshoot on unevenly spaced points — both matter when the camera
    // is threading between buildings.
    posCurve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.5);
    tgtCurve = new THREE.CatmullRomCurve3(tgts, false, 'centripetal', 0.5);
    LAST = pts.length - 1;

    /* ------------------------------------------------ scroll segment map */
    // Interleaved: dive0, conn0, dive1, conn1, … diveN-1
    SEGMENTS = [];
    for (let i = 0; i < N; i++) {
      SEGMENTS.push({
        kind: 'dive', si: i,
        t0: tAt(idxOf('A', i)), t1: tAt(idxOf('B', i)),
        w: SECTIONS[i].scroll ?? DIVE_W,
        linger: SECTIONS[i].linger ?? 0,
      });
      if (i < N - 1) {
        SEGMENTS.push({
          kind: 'conn', si: i,
          t0: tAt(idxOf('B', i)), t1: tAt(idxOf('A', i + 1)),
          w: SECTIONS[i].connectorScroll ?? CONN_W,
          linger: 0,
        });
      }
    }
    TOTAL_W = SEGMENTS.reduce((a, s) => a + s.w, 0);
    let acc = 0;
    SEGMENTS.forEach((s) => { s.p0 = acc / TOTAL_W; acc += s.w; s.p1 = acc / TOTAL_W; });
  }

  /**
   * Linger easing. f(0)=0, f(1)=1 always, so segment boundaries never move —
   * only the pacing inside a scene changes.
   */
  function lingerEase(u, amount) {
    if (!amount) return u;
    const k = 1 + 2 * Math.min(0.95, amount);
    const x = 2 * u - 1;
    return 0.5 + 0.5 * Math.sign(x) * Math.pow(Math.abs(x), k);
  }

  /** Global scroll progress 0..1 -> curve parameter t, plus which scene we're in. */
  function progressToT(p) {
    p = clamp(p, 0, 1);
    let seg = SEGMENTS[SEGMENTS.length - 1];
    for (const s of SEGMENTS) { if (p <= s.p1 || s === seg) { seg = s; break; } }
    const span = Math.max(1e-6, seg.p1 - seg.p0);
    const u = clamp((p - seg.p0) / span, 0, 1);
    const eased = lingerEase(u, seg.linger);
    return { t: seg.t0 + (seg.t1 - seg.t0) * eased, seg, u };
  }

  /* ------------------------------------------------------- build the world */
  const clouds = [];
  function buildWorld() {
    for (let i = 0; i < N; i++) {
      const sc = SECTIONS[i].scene || {};
      const g = buildSceneGroup(sc, ctx);
      g.position.copy(layout[i].center);
      // Face every scene at its own incoming camera. Without this, a scene's
      // local axes have no relation to the approach — so a building the author
      // put "at the back" lands wherever the global serpentine happens to point,
      // and the dive can stop inside it. With it, authoring is deterministic:
      //   the camera ALWAYS enters from local +Z and flies toward local -Z.
      // So: hero mass at negative z, approach corridor around (0, 0..+R) clear.
      const d = approachDir(i);
      g.rotation.y = Math.atan2(-d.x, -d.z) + (sc.rotate ?? 0);
      worldRoot.add(g);
      SECTIONS[i]._group = g;
    }
    if (config.clouds !== false) {
      const count = config.cloudCount ?? Math.min(26, N * 5);
      for (let i = 0; i < count; i++) {
        const host = layout[Math.floor(ctx.rng() * N)];
        const c = placeProp({
          type: 'cloud',
          size: 3 + ctx.rng() * 5,
          opacity: 0.55 + ctx.rng() * 0.3,
          at: [
            host.center.x + (ctx.rng() - 0.5) * 90,
            host.center.y + 14 + ctx.rng() * 26,
            host.center.z + (ctx.rng() - 0.5) * 90,
          ],
        }, ctx);
        c.userData.drift = 0.15 + ctx.rng() * 0.35;
        clouds.push(c);
        scene.add(c);
      }
    }
  }

  /* -------------------------------------------------------------- driving */
  let targetP = 0;   // where scroll says we are
  let currentP = 0;  // damped
  let needsRender = true;
  let running = true;
  const _p = V3(), _t = V3();

  /**
   * Which element actually scrolls.
   *
   * A page mounted inside an app shell (Next/MUI/Angular/admin chrome) very
   * often scrolls an inner `<main overflow-y:auto>` while the window itself
   * does not scroll at all. Scroll events do NOT bubble, so listening on
   * `window` in that case never fires and the world sits frozen at t=0 — with
   * a correctly-sized spacer, which makes it look like a rendering bug rather
   * than a plumbing one.
   *
   * Pass `config.scroller` (element or selector) to be explicit; otherwise walk
   * up and take the first scrollable ancestor. `null` means the window scrolls.
   */
  function findScroller() {
    if (config.scroller) {
      return typeof config.scroller === 'string'
        ? document.querySelector(config.scroller)
        : config.scroller;
    }
    let el = container.parentElement;
    while (el && el !== document.body && el !== document.documentElement) {
      const oy = getComputedStyle(el).overflowY;
      if (oy === 'auto' || oy === 'scroll') return el;
      el = el.parentElement;
    }
    return null;
  }

  let scroller = null;
  const viewportH = () => (scroller ? scroller.clientHeight : window.innerHeight);

  function readScroll() {
    const rect = spacer.getBoundingClientRect();
    // Measure the spacer against whatever is doing the scrolling. For the
    // window that origin is 0; for an inner element it is that element's top.
    const originTop = scroller ? scroller.getBoundingClientRect().top : 0;
    const scrollable = Math.max(1, rect.height - viewportH());
    targetP = clamp((originTop - rect.top) / scrollable, 0, 1);
  }

  function applyCamera(p) {
    const { t, seg } = progressToT(p);
    posCurve.getPoint(t, _p);
    tgtCurve.getPoint(t, _t);
    camera.position.copy(_p);
    camera.lookAt(_t);

    // Keep the shadow frustum tight around wherever we're looking, so a
    // 7-island world gets the same shadow quality as a single one.
    const R = layout[seg.si].radius;
    sunTarget.position.copy(_t);
    sun.position.copy(_t).add(V3(R * 1.2, R * 2.4, R * 1.6));
    const cam = sun.shadow.camera;
    const span = R * 1.9;
    cam.left = -span; cam.right = span; cam.top = span; cam.bottom = -span;
    cam.near = 0.5; cam.far = R * 7;
    cam.updateProjectionMatrix();

    updateUI(p, seg);
  }

  function updateUI(p, seg) {
    progressFill.style.transform = `scaleX(${p})`;
    const active = seg.si + (seg.kind === 'conn' ? 0.5 : 0);
    railDots.forEach((d, i) => d.classList.toggle('is-on', Math.round(active) === i));

    // Copy is tied to its own dive segment: fades up as the camera commits to
    // the scene, holds through the settle, fades out before the fly-over.
    SEGMENTS.forEach((s) => {
      if (s.kind !== 'dive') return;
      const block = copyBlocks[s.si];
      const span = Math.max(1e-6, s.p1 - s.p0);
      const u = (p - s.p0) / span;
      // The first and last scenes have no room to fade: the page opens already
      // inside scene 0's dive and ends inside the finale's, so those two use
      // windows that are fully open at u=0 / u=1 respectively. Anything else
      // leaves the hero copy at ~5% on landing and the CTA at ~7% at the end.
      const first = s.si === 0, lastS = s.si === N - 1;
      const a = clamp(Math.min(
        smoothstep(first ? -0.40 : -0.05, first ? 0.02 : 0.32, u),
        1 - smoothstep(lastS ? 0.98 : 0.74, lastS ? 1.50 : 1.05, u),
      ), 0, 1);
      block.style.opacity = a;
      block.style.transform = blockTransform(a);
      block.style.pointerEvents = a > 0.5 ? 'auto' : 'none';
      block.setAttribute('aria-hidden', a > 0.05 ? 'false' : 'true');
      if (a > 0.05) {
        const accent = SECTIONS[s.si].accent;
        if (accent) block.style.setProperty('--sf-accent', accent);
      }
    });
    // The opening frame is already settled on the first scene, so the hint
    // cannot key off p ≈ 0. Keep it up until the flight into the last scene.
    const onLast = Math.round(active) >= N - 1;
    hint.style.opacity = onLast ? 0 : 1;
  }

  let last = performance.now();
  function tick(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    // Damping turns a jittery wheel/trackpad into a cinematic glide. Under
    // reduced-motion, and while a snap flight is easing the scroll position
    // itself, track that position exactly so the ease curve is the motion.
    const damp = (reduce || config.snap) ? 1 : 1 - Math.pow(1 - (config.smoothing ?? 0.14), dt * 60);
    const next = currentP + (targetP - currentP) * damp;
    if (Math.abs(next - currentP) > 1e-5) { currentP = next; needsRender = true; }

    if (!reduce && clouds.length) {
      const s = now / 1000;
      for (const c of clouds) c.position.x += Math.sin(s * 0.08 + c.userData.drift * 9) * 0.004;
      needsRender = true;
    }

    if (needsRender) {
      applyCamera(currentP);
      renderer.render(scene, camera);
      needsRender = false;
    }
    requestAnimationFrame(tick);
  }

  /* --------------------------------------------------------------- layout */
  let lastW = window.innerWidth;
  // Desktop is any viewport at least 1200px wide. Tablet landscape is a wide
  // landscape viewport that is still below that. Portrait tablets and phones
  // keep the full-bleed overlay.
  let splitLayout = false;
  function isSplitLayout(rect) {
    if (rect.width >= 1200) return true;
    return rect.width >= 1024 && rect.width > rect.height;
  }
  function illustrationFrame() {
    for (let i = 0; i < N; i += 1) {
      const props = SECTIONS[i].scene?.props || [];
      for (let j = 0; j < props.length; j += 1) {
        const prop = props[j];
        if (prop.type !== 'diorama') continue;
        const aspect = prop.aspect || (1536 / 1024);
        const height = prop.height || 7.2;
        return { width: height * aspect };
      }
    }
    return null;
  }
  function closestSettleDistance() {
    let distance = Infinity;
    for (let i = 0; i < N; i += 1) {
      const z = SECTIONS[i].camera?.to?.[2];
      if (Number.isFinite(z)) distance = Math.min(distance, Math.abs(z));
    }
    return distance;
  }
  // A half-width column is often taller than the landscape illustration.
  // Widen the vertical FOV so the settled shot still fits the column.
  function fovForColumn(columnAspect) {
    const base = config.fov ?? 46;
    const frame = illustrationFrame();
    const distance = closestSettleDistance();
    if (!frame || !Number.isFinite(distance) || columnAspect <= 0) return base;
    const visibleW = frame.width * 1.12;
    const visibleH = visibleW / columnAspect;
    const fitted = (2 * Math.atan(visibleH / (2 * distance)) * 180) / Math.PI;
    return Math.min(90, Math.max(base, fitted));
  }
  function blockTransform(opacity) {
    const rise = (1 - opacity) * 22;
    if (splitLayout) return `translateY(calc(-50% + ${rise}px))`;
    return `translateY(${rise}px)`;
  }
  function overlayRect() {
    if (scroller) {
      const r = scroller.getBoundingClientRect();
      return { top: r.top, left: r.left, width: r.width, height: r.height };
    }
    return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
  }
  function pinOverlay(node, rect) {
    node.style.inset = 'auto';
    node.style.top = `${rect.top}px`;
    node.style.left = `${rect.left}px`;
    node.style.width = `${rect.width}px`;
    node.style.height = `${rect.height}px`;
  }
  function resize() {
    const rect = overlayRect();
    const split = isSplitLayout(rect);
    splitLayout = split;
    container.classList.toggle('sf-root--split', split);
    const half = rect.width / 2;
    const textRect = split ? { ...rect, width: half } : rect;
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    pinOverlay(stage, rect);
    pinOverlay(copyLayer, textRect);
    pinOverlay(ui, rect);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // A phone in portrait sees far less horizontally; widening the FOV keeps
    // each scene framed instead of cropping it to its centre.
    const portrait = !split && camera.aspect < 0.85;
    if (split) {
      // Frame the illustration for the right half, but paint the sky across
      // the whole stage. A quarter-width shift parks that framing on the right.
      camera.fov = fovForColumn((w / 2) / h);
      camera.setViewOffset(w, h, -Math.round(w / 4), 0, w, h);
    } else {
      camera.fov = (config.fov ?? 46) * (portrait ? 1.32 : 1);
      if (portrait) {
        // Copy is pinned to the bottom of the screen. Shift the projection so
        // the diorama sits above that block instead of behind it.
        const lift = Math.round(h * 0.18);
        camera.setViewOffset(w, h, 0, lift, w, h);
      } else {
        camera.clearViewOffset();
      }
    }
    for (let i = 0; i < copyBlocks.length; i += 1) {
      const block = copyBlocks[i];
      const a = Number.parseFloat(block.style.opacity || '0') || 0;
      block.style.transform = blockTransform(a);
    }
    // The spacer is sized from the scroll viewport, so it has to be recomputed
    // whenever that changes. Guarded: TOTAL_W does not exist until buildPath().
    if (TOTAL_W) applyScrollHeight();
    needsRender = true;
  }
  function onResize() {
    // Mobile URL-bar show/hide fires resize with an unchanged width. Reacting to
    // it makes the page jump mid-scroll, so height-only changes are ignored.
    if (coarse && window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    resize();
  }

  function applyScrollHeight() {
    // Sized against the ACTUAL scrolling viewport, not `vh` — inside a shell the
    // scroll container is shorter than the window, and using vh would make every
    // section's `scroll` value quietly mean something different than documented.
    spacer.style.height = `${TOTAL_W * viewportH()}px`;
  }

  /* ------------------------------------------------------------------ API */
  function setProgress(p) {
    targetP = clamp(p, 0, 1);
    currentP = targetP;
    applyCamera(currentP);
    renderer.render(scene, camera);
    needsRender = false;
  }

  let snapIndex = 0;
  let snapAnim = 0;
  let snapLockUntil = 0;
  let touchStartY = null;
  let wheelBucket = 0;
  let wheelBucketAt = 0;

  function sectionProgress(i) {
    const seg = SEGMENTS.find((s) => s.kind === 'dive' && s.si === i);
    if (!seg) return 0;
    return seg.p0 + (seg.p1 - seg.p0) * 0.55;
  }

  function sectionScrollTop(i) {
    const mid = sectionProgress(i);
    const rect = spacer.getBoundingClientRect();
    const offset = mid * Math.max(1, rect.height - viewportH());
    if (!scroller) return window.scrollY + rect.top + offset;
    const delta = rect.top - scroller.getBoundingClientRect().top;
    return scroller.scrollTop + delta + offset;
  }

  function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2;
  }

  function flyTo(i) {
    if (!SEGMENTS || !scroller) return;
    const next = clamp(Math.round(i), 0, N - 1);
    if (next === snapIndex && !snapAnim) return;
    snapIndex = next;
    const from = scroller.scrollTop;
    const to = sectionScrollTop(next);
    const duration = reduce ? 0 : (config.snapDuration ?? 2000);
    const t0 = performance.now();
    if (snapAnim) cancelAnimationFrame(snapAnim);
    const step = (now) => {
      if (!running) return;
      const u = duration === 0 ? 1 : clamp((now - t0) / duration, 0, 1);
      scroller.scrollTop = from + (to - from) * easeInOut(u);
      if (u < 1) snapAnim = requestAnimationFrame(step);
      else snapAnim = 0;
    };
    snapAnim = requestAnimationFrame(step);
  }

  function goTo(i, behavior = 'smooth') {
    if (config.snap && behavior !== 'auto') {
      flyTo(i);
      return;
    }
    const seg = SEGMENTS.find((s) => s.kind === 'dive' && s.si === i);
    if (!seg) return;
    const mid = seg.p0 + (seg.p1 - seg.p0) * 0.55;
    const rect = spacer.getBoundingClientRect();
    const offset = mid * (rect.height - viewportH());
    const opts = { behavior: reduce ? 'auto' : behavior };
    if (scroller) {
      const delta = rect.top - scroller.getBoundingClientRect().top;
      scroller.scrollTo({ top: scroller.scrollTop + delta + offset, ...opts });
    } else {
      window.scrollTo({ top: window.scrollY + rect.top + offset, ...opts });
    }
  }

  function wheelDelta(event) {
    let dy = event.deltaY;
    if (event.deltaMode === 1) dy *= 16;
    else if (event.deltaMode === 2) dy *= viewportH();
    return dy;
  }

  function blockedByOverlay(event) {
    return event.target.closest && event.target.closest('.MuiDrawer-root, .MuiModal-root');
  }

  // The canvas is position:fixed over an app shell whose window cannot scroll.
  // A wheel over that canvas scrolls the document, which is locked, so the
  // inner scroller never moves and the flight stays on the first scene.
  // With snap, one gesture flies to the neighbouring scene instead of scrubbing.
  function onWheel(event) {
    if (!scroller || event.ctrlKey) return;
    if (blockedByOverlay(event)) return;
    const dy = wheelDelta(event);
    if (!dy) return;
    event.preventDefault();
    if (!config.snap) {
      const max = scroller.scrollHeight - scroller.clientHeight;
      if (max <= 0) return;
      const next = Math.max(0, Math.min(max, scroller.scrollTop + dy));
      if (next !== scroller.scrollTop) scroller.scrollTop = next;
      return;
    }
    if (performance.now() < snapLockUntil) return;
    const now = performance.now();
    if (now - wheelBucketAt > 180) wheelBucket = 0;
    wheelBucket += dy;
    wheelBucketAt = now;
    if (Math.abs(wheelBucket) < 28) return;
    const dir = wheelBucket > 0 ? 1 : -1;
    wheelBucket = 0;
    if (snapIndex + dir < 0 || snapIndex + dir > N - 1) return;
    const duration = reduce ? 0 : (config.snapDuration ?? 2000);
    snapLockUntil = performance.now() + duration + 420;
    flyTo(snapIndex + dir);
  }

  function onKey(event) {
    if (!config.snap || !scroller) return;
    if (event.target.closest && event.target.closest('input, textarea, select, a, button')) return;
    const dir = ({ ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1 })[event.key];
    if (!dir) return;
    event.preventDefault();
    if (performance.now() < snapLockUntil) return;
    if (snapIndex + dir < 0 || snapIndex + dir > N - 1) return;
    const duration = reduce ? 0 : (config.snapDuration ?? 2000);
    snapLockUntil = performance.now() + duration + 420;
    flyTo(snapIndex + dir);
  }

  function onTouchStart(event) {
    if (!config.snap || !event.touches || event.touches.length !== 1) return;
    touchStartY = event.touches[0].clientY;
  }

  function onTouchMove(event) {
    if (!config.snap || touchStartY == null) return;
    if (blockedByOverlay(event)) return;
    event.preventDefault();
  }

  function onTouchEnd(event) {
    if (!config.snap || touchStartY == null || !event.changedTouches) return;
    const dy = touchStartY - event.changedTouches[0].clientY;
    touchStartY = null;
    if (blockedByOverlay(event)) return;
    if (Math.abs(dy) < 42) return;
    if (performance.now() < snapLockUntil) return;
    const dir = dy > 0 ? 1 : -1;
    if (snapIndex + dir < 0 || snapIndex + dir > N - 1) return;
    const duration = reduce ? 0 : (config.snapDuration ?? 2000);
    snapLockUntil = performance.now() + duration + 420;
    flyTo(snapIndex + dir);
  }

  function destroy() {
    running = false;
    if (snapAnim) cancelAnimationFrame(snapAnim);
    (scroller || window).removeEventListener('scroll', onScroll);
    window.removeEventListener('wheel', onWheel, { capture: true });
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('touchstart', onTouchStart, { capture: true });
    window.removeEventListener('touchmove', onTouchMove, { capture: true });
    window.removeEventListener('touchend', onTouchEnd, { capture: true });
    window.removeEventListener('resize', onResize);
    window.removeEventListener('orientationchange', resize);
    scene.traverse((o) => { if (o.isInstancedMesh) o.dispose?.(); });
    ctx.dispose();
    renderer.dispose();
    container.innerHTML = '';
    container.classList.remove('sf-root', 'sf-root--split');
    if (window.__scrollForge === api) delete window.__scrollForge;
  }

  const onScroll = () => { readScroll(); needsRender = true; };

  /* ----------------------------------------------------------- boot it up */
  resize();
  // Build after a paint so the loader is actually visible on slower machines.
  ctx.requestRender = () => { needsRender = true; };

  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (!running) return;
    const t0 = performance.now();
    buildWorld();
    buildPath();          // needs the geometry to exist — see clearAnchor()
    scroller = findScroller();          // needs the container to be in the DOM
    (scroller || window).addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: false, capture: true });
    if (config.snap) {
      window.addEventListener('keydown', onKey);
      window.addEventListener('touchstart', onTouchStart, { passive: true, capture: true });
      window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });
      window.addEventListener('touchend', onTouchEnd, { passive: true, capture: true });
    }
    resize();             // stage was sized to the window before the scroller existed
    applyScrollHeight();  // needs TOTAL_W and the resolved scroller height
    if (config.snap && scroller) {
      snapIndex = 0;
      scroller.scrollTop = sectionScrollTop(0);
    }
    readScroll();
    currentP = targetP;
    applyCamera(currentP);
    renderer.render(scene, camera);
    loader.classList.add('is-done');
    container.classList.add('is-ready');
    if (config.onReady) config.onReady({ buildMs: Math.round(performance.now() - t0) });
    requestAnimationFrame(tick);
  }));

  // NB: the scroll listener is attached at boot, once `scroller` is resolved.
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', resize);

  /**
   * How enclosed the camera is right now: the fraction of 6 axis rays that hit
   * geometry within `range`. ~1 means the camera is inside a wall — the one
   * failure this engine can still produce, and what QA asserts against.
   */
  function enclosure(range = 1.6) {
    const ray = new THREE.Raycaster();
    ray.far = range;
    const dirs = [V3(1, 0, 0), V3(-1, 0, 0), V3(0, 1, 0), V3(0, -1, 0), V3(0, 0, 1), V3(0, 0, -1)];
    let hits = 0;
    for (const d of dirs) {
      ray.set(camera.position, d);
      if (ray.intersectObject(worldRoot, true).length) hits++;
    }
    return hits / dirs.length;
  }

  const api = {
    destroy, goTo, setProgress, enclosure,
    sections: SECTIONS,
    get segments() { return SEGMENTS; },   // not built until buildPath() runs
    /** The element driving scroll — `null` when that is the window. */
    get scroller() { return scroller; },
    scene, camera, renderer, ctx, THREE,
  };
  window.__scrollForge = api;   // headless QA hook — see SKILL Step 6
  return api;
}

/* ------------------------------------------------------------------ helpers */

function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function smoothstep(a, b, x) {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}
function el(tag, cls) { const n = document.createElement(tag); if (cls) n.className = cls; return n; }
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function linkHtml(cls, link) {
  const ext = link.external ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `<a class="${cls}" href="${esc(link.href || '#')}"${ext}>${esc(link.label || '')}</a>`;
}

/** Vertical gradient sky as an inverted sphere — cheaper and softer than a cubemap. */
function makeSky(top, bottom) {
  const geo = new THREE.SphereGeometry(600, 24, 16);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(top) }, bottom: { value: new THREE.Color(bottom) } },
    vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      uniform vec3 top; uniform vec3 bottom; varying vec3 vP;
      void main(){
        float h = clamp(normalize(vP).y * 0.5 + 0.5, 0.0, 1.0);
        // Band chosen so the sky reads as sky within ~20° of the horizon —
        // a diorama camera spends most of its time looking slightly DOWN, so a
        // gradient centred on the zenith would never actually be seen.
        gl_FragColor = vec4(mix(bottom, top, smoothstep(0.42, 0.68, h)), 1.0);
      }`,
  });
  const m = new THREE.Mesh(geo, mat);
  m.frustumCulled = false;
  return m;
}

let cssInjected = false;
function injectCSS() {
  if (cssInjected) return;
  cssInjected = true;
  const css = `
@layer sf {
.sf-root{--sf-bg:#F5EDE0;--sf-ink:#241d2b;--sf-ink-soft:#6a6072;--sf-accent:#C8785A;
  --sf-font-display:'Instrument Serif',Georgia,serif;--sf-font-body:ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;
  position:relative;background:var(--sf-bg);color:var(--sf-ink);font-family:var(--sf-font-body);}
.sf-stage{position:fixed;inset:0;z-index:0;background:var(--sf-bg);pointer-events:none;}
.sf-canvas{display:block;width:100%;height:100%;pointer-events:none;}
.sf-loader{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:.5rem;
  background:var(--sf-bg);transition:opacity .5s ease;}
.sf-loader.is-done{opacity:0;pointer-events:none;}
.sf-loader__dot{width:.5rem;height:.5rem;border-radius:50%;background:var(--sf-accent);opacity:.35;
  animation:sf-pulse 1.1s ease-in-out infinite;}
.sf-loader__dot:nth-child(2){animation-delay:.15s}.sf-loader__dot:nth-child(3){animation-delay:.3s}
@keyframes sf-pulse{0%,100%{opacity:.25;transform:translateY(0)}50%{opacity:1;transform:translateY(-.3rem)}}

.sf-scroll{position:relative;z-index:1;pointer-events:none;}

.sf-copy{position:fixed;inset:0;z-index:2;pointer-events:none;
  padding:clamp(1.25rem,4vw,4rem);
  padding-bottom:calc(clamp(3rem,10vh,7rem) + env(safe-area-inset-bottom,0px));
  display:flex;align-items:flex-end;}
.sf-block{position:absolute;left:clamp(1.25rem,4vw,4rem);bottom:calc(clamp(3rem,10vh,7rem) + env(safe-area-inset-bottom,0px));
  max-width:min(34rem,60vw);opacity:0;transition:opacity .28s ease,transform .28s ease;isolation:isolate;}
/* The scene behind the copy is arbitrary and often light, so the copy needs its
   own scrim rather than a text-shadow. It lives on the block so it fades in and
   out with the copy instead of permanently dimming the world. */
.sf-block::before{content:'';position:absolute;z-index:-1;
  inset:-3.5rem -8rem -4rem -8rem;
  background:radial-gradient(115% 130% at 12% 88%,
    color-mix(in srgb,var(--sf-bg) 94%,transparent) 0%,
    color-mix(in srgb,var(--sf-bg) 72%,transparent) 38%,
    transparent 76%);}
.sf-eyebrow{margin:0 0 .6rem;font-size:.75rem;letter-spacing:.14em;text-transform:uppercase;
  font-weight:600;color:var(--sf-accent);}
.sf-title{margin:0 0 .7rem;font-family:var(--sf-font-display);font-weight:400;line-height:1.05;
  font-size:clamp(2rem,5.2vw,3.9rem);letter-spacing:-.02em;}
.sf-body{margin:0;max-width:32rem;font-size:clamp(.95rem,1.35vw,1.1rem);line-height:1.6;color:var(--sf-ink-soft);}
.sf-tags{display:flex;flex-wrap:wrap;gap:.45rem;margin:1rem 0 0;padding:0;list-style:none;}
.sf-tags li{font-size:.75rem;line-height:1.35;padding:.68rem 1.2rem;border-radius:999px;
  border:1px solid color-mix(in srgb,var(--sf-ink) 16%,transparent);
  background:color-mix(in srgb,var(--sf-bg) 62%,transparent);backdrop-filter:blur(6px);}
.sf-cta{display:flex;flex-wrap:wrap;gap:.6rem;margin-top:.85rem;}
.sf-btn{display:inline-block;box-sizing:border-box;padding:.9rem 1.55rem;border-radius:999px;text-decoration:none;
  font-size:.9rem;font-weight:600;line-height:1.3;color:var(--sf-ink);
  border:1px solid var(--sf-ink);
  background:var(--sf-bg);transition:transform .2s ease;}
.sf-btn--primary{background:var(--sf-ink);border-color:var(--sf-ink);color:var(--sf-bg);}
.sf-btn:hover{transform:translateY(-2px);}

.sf-ui{position:fixed;inset:0;z-index:3;pointer-events:none;}
.sf-topbar{position:absolute;top:0;left:0;right:0;display:flex;align-items:center;gap:1.5rem;
  padding:clamp(.9rem,2.2vw,1.5rem) clamp(1.25rem,4vw,4rem);}
.sf-brand{display:flex;align-items:center;gap:.55rem;pointer-events:auto;text-decoration:none;
  color:var(--sf-ink);font-weight:650;letter-spacing:-.01em;}
.sf-brand__mark{width:.7rem;height:.7rem;border-radius:50%;background:var(--sf-accent);}
.sf-rail{display:flex;gap:.4rem;margin-left:auto;pointer-events:auto;}
.sf-rail__dot{display:flex;align-items:center;gap:.4rem;background:none;border:0;cursor:pointer;
  padding:.3rem .5rem;border-radius:999px;color:var(--sf-ink-soft);font:inherit;font-size:.78rem;}
.sf-rail__dot i{width:.42rem;height:.42rem;border-radius:50%;
  background:color-mix(in srgb,var(--sf-ink) 28%,transparent);transition:background .25s,transform .25s;}
.sf-rail__dot span{display:none;}
.sf-rail__dot.is-on{color:var(--sf-ink);}
.sf-rail__dot.is-on i{background:var(--sf-accent);transform:scale(1.4);}
.sf-rail__dot.is-on span{display:inline;}
.sf-topcta{pointer-events:auto;text-decoration:none;font-size:.85rem;font-weight:600;
  padding:.55rem 1.05rem;border-radius:999px;background:var(--sf-accent);color:#fff;}
.sf-progress{position:absolute;left:0;right:0;bottom:0;height:2px;
  background:color-mix(in srgb,var(--sf-ink) 10%,transparent);}
.sf-progress span{display:block;height:100%;background:var(--sf-accent);
  transform-origin:0 50%;transform:scaleX(0);}
.sf-hint{position:absolute;left:0;right:0;text-align:center;white-space:nowrap;
  bottom:calc(1.4rem + env(safe-area-inset-bottom,0px));font-size:.72rem;letter-spacing:.16em;
  text-transform:uppercase;color:var(--sf-ink-soft);transition:opacity .4s ease;}

.sf-root--split .sf-block{top:50%;bottom:auto;
  left:clamp(1.5rem,4vw,4.5rem);right:clamp(1.25rem,3vw,3rem);max-width:none;}
.sf-root--split .sf-block::before{display:none;}
.sf-root--split .sf-hint{right:50%;}

@media (max-width:860px), (max-width:1199px) and (orientation:portrait){
  .sf-block{max-width:calc(100vw - 2.5rem);}
  .sf-rail__dot.is-on span{display:none;}
  .sf-topcta{display:none;}
}
@media (max-width:320px){
  .sf-hint{white-space:normal;padding:0 .75rem;}
}
@media (prefers-reduced-motion:reduce){
  .sf-block{transition:none;}
  .sf-loader__dot{animation:none;}
}
}
/* Unlayered so these beat MUI's anchor color, which otherwise sits on the accent fill. */
.sf-tags li{padding:.68rem 1.2rem;line-height:1.35;}
.sf-tags{margin-top:.75rem;margin-bottom:.85rem;}
.sf-cta{margin-top:.85rem;}
a.sf-btn{color:var(--sf-ink);background:var(--sf-bg);border-color:var(--sf-ink);padding:.9rem 1.55rem;line-height:1.3;}
a.sf-btn.sf-btn--primary{color:var(--sf-bg);background:var(--sf-ink);border-color:var(--sf-ink);}
`;
  const tag = document.createElement('style');
  tag.setAttribute('data-scroll-forge', '');
  tag.textContent = css;
  document.head.appendChild(tag);
}

export default mountScrollForge;
