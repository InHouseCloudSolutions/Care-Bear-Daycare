/* ============================================================================
   scroll-forge — parametric diorama prop kit
   ----------------------------------------------------------------------------
   Every prop is a pure function of a small JSON spec, so an agent can compose
   "a coffee farm", "a machine shop", "a data centre" by *writing data*, never
   by generating or downloading an asset. Nothing here touches the network.

   All builders share one contract:

       build(spec, ctx) -> THREE.Object3D

   positioned so that the object's FOOTPRINT is centred on the local origin and
   it stands ON the ground plane (y = 0). The caller places it.

   ctx is created by makeContext():
     ctx.THREE      the three namespace
     ctx.rng()      deterministic 0..1 (seeded — same spec always builds the
                    same world, which is what makes builds reproducible)
     ctx.mat(c)     cached material for a palette key ('primary') or hex
                    ('#8FB98A'); pass {rough, metal, flat, emissive} to vary
     ctx.geo(k, fn) geometry cache keyed by string — reuse is what keeps a
                    200-prop world at 60fps
     ctx.palette    the resolved brand palette

   COLOUR KEYS
     Any spec field named `color` accepts a palette key (primary, secondary,
     accent, dark, light, ground, water, foliage, metal, wood, glass) or a raw
     hex string. Palette keys are what make a world read as one brand.

   ADDING A PROP
     Write a builder, register it in PROPS. It is immediately available to the
     spec author. Keep the footprint centred and standing on y=0.
   ========================================================================== */

import * as THREE from 'three';

/* ---------------------------------------------------------------- utilities */

/** Deterministic PRNG (mulberry32). Same seed -> same world, every build. */
export function makeRng(seed = 1) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const DEFAULT_PALETTE = {
  primary:   '#C8785A',
  secondary: '#6E8FA8',
  accent:    '#E8B44A',
  dark:      '#3A3340',
  light:     '#F5EDE0',
  ground:    '#B9C79A',
  water:     '#7FB0C4',
  foliage:   '#7DA36B',
  metal:     '#9AA3AC',
  wood:      '#A9764C',
  glass:     '#BFDCE6',
};

/**
 * Build the shared context. One per world.
 * @param {object} palette  partial palette; missing keys fall back to defaults
 * @param {number} seed     any integer — changing it reshuffles all scatter
 */
export function makeContext(palette = {}, seed = 7) {
  const pal = { ...DEFAULT_PALETTE, ...palette };
  const matCache = new Map();
  const geoCache = new Map();
  const tracked = [];
  const rng = makeRng(seed);

  function resolve(c) {
    if (!c) return pal.primary;
    if (typeof c === 'string' && c[0] === '#') return c;
    return pal[c] || c;
  }

  function mat(c, o = {}) {
    const hex = resolve(c);
    const key = `${hex}|${o.rough ?? 0.85}|${o.metal ?? 0}|${o.flat ? 1 : 0}|${o.emissive || ''}|${o.opacity ?? 1}`;
    let m = matCache.get(key);
    if (!m) {
      m = new THREE.MeshStandardMaterial({
        color: new THREE.Color(hex),
        roughness: o.rough ?? 0.85,
        metalness: o.metal ?? 0,
        flatShading: !!o.flat,
        transparent: (o.opacity ?? 1) < 1,
        opacity: o.opacity ?? 1,
      });
      if (o.emissive) {
        m.emissive = new THREE.Color(resolve(o.emissive));
        m.emissiveIntensity = o.emissiveIntensity ?? 1;
      }
      matCache.set(key, m);
    }
    return m;
  }

  function geo(key, fn) {
    let g = geoCache.get(key);
    if (!g) { g = fn(); geoCache.set(key, g); }
    return g;
  }

  function track(material) {
    tracked.push(material);
    return material;
  }

  return {
    THREE, rng, mat, geo, palette: pal, resolve, track,
    dispose() {
      tracked.forEach((m) => {
        if (m.map) m.map.dispose();
        m.dispose();
      });
      tracked.length = 0;
      matCache.forEach((m) => m.dispose());
      geoCache.forEach((g) => g.dispose());
      matCache.clear(); geoCache.clear();
    },
  };
}

/** Rounded-rectangle shape — the basis of the soft "clay" silhouette. */
function roundedRect(w, d, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -d / 2;
  r = Math.min(r, w / 2 - 1e-4, d / 2 - 1e-4);
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + d - r);
  s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  s.lineTo(x + r, y + d);
  s.quadraticCurveTo(x, y + d, x, y + d - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/**
 * Bevelled box standing on y=0 — the workhorse. Real bevels are what separate
 * "clay diorama" from "a pile of cubes"; they catch the key light on every edge.
 */
export function boxGeo(ctx, w, h, d, r = 0.06) {
  const key = `box:${w.toFixed(3)},${h.toFixed(3)},${d.toFixed(3)},${r.toFixed(3)}`;
  return ctx.geo(key, () => {
    const bev = Math.min(r, h / 2.5, 0.14);
    const shape = roundedRect(w - bev * 2, d - bev * 2, Math.max(0.02, r));
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: Math.max(0.01, h - bev * 2),
      bevelEnabled: true,
      bevelSize: bev, bevelThickness: bev, bevelSegments: 2,
      curveSegments: 4,
    });
    // Extrude runs along +Z spanning [-bev, h-bev]; rotating maps that onto Y,
    // so a single +bev lift puts the box exactly on [0, h].
    g.rotateX(-Math.PI / 2);
    g.translate(0, bev, 0);
    g.computeVertexNormals();
    return g;
  });
}

export function cylGeo(ctx, rt, rb, h, seg = 16) {
  const key = `cyl:${rt.toFixed(3)},${rb.toFixed(3)},${h.toFixed(3)},${seg}`;
  return ctx.geo(key, () => {
    const g = new THREE.CylinderGeometry(rt, rb, h, seg);
    g.translate(0, h / 2, 0);
    return g;
  });
}

export function sphereGeo(ctx, r, seg = 14) {
  return ctx.geo(`sph:${r.toFixed(3)},${seg}`, () => new THREE.SphereGeometry(r, seg, Math.max(6, seg / 2)));
}

function mesh(geometry, material) {
  const m = new THREE.Mesh(geometry, material);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** Shorthand: a bevelled box placed by its footprint centre. */
function box(ctx, w, h, d, color, opts = {}) {
  return mesh(boxGeo(ctx, w, h, d, opts.round ?? 0.06), ctx.mat(color, opts));
}

const jitter = (ctx, amount) => (ctx.rng() - 0.5) * 2 * amount;

/* ------------------------------------------------------------------ terrain */

/**
 * island — the floating slab every scene sits on. This is what makes the
 * world read as a set of miniature dioramas rather than one flat map.
 * spec: { radius, shape:'round'|'square', height, color, edge, skirt }
 */
function island(spec, ctx) {
  const g = new THREE.Group();
  const R = spec.radius ?? 9;
  const h = spec.height ?? 1.1;
  const round = spec.shape !== 'square';

  const topGeo = round
    ? ctx.geo(`isl:${R.toFixed(2)},${h.toFixed(2)}`, () => {
        const gg = new THREE.CylinderGeometry(R, R * 0.97, h, 48);
        gg.translate(0, h / 2, 0); return gg;
      })
    : boxGeo(ctx, R * 2, h, R * 2, 0.3);
  const top = mesh(topGeo, ctx.mat(spec.color || 'ground'));
  top.position.y = -h;                       // ground surface sits at y = 0
  g.add(top);

  // Underside — a tapering rock skirt sells the "torn out of the earth" look.
  if (spec.skirt !== false) {
    const sh = spec.skirtHeight ?? R * 0.55;
    const skirtGeo = ctx.geo(`skirt:${R.toFixed(2)},${sh.toFixed(2)}`, () => {
      const gg = new THREE.CylinderGeometry(R * 0.97, R * 0.12, sh, round ? 36 : 4, 3);
      const pos = gg.attributes.position;
      const rr = makeRng(99);
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        if (y > -sh / 2 + 0.01 && y < sh / 2 - 0.01) {
          pos.setX(i, pos.getX(i) * (1 + (rr() - 0.5) * 0.22));
          pos.setZ(i, pos.getZ(i) * (1 + (rr() - 0.5) * 0.22));
        }
      }
      gg.computeVertexNormals();
      gg.translate(0, -sh / 2, 0);
      return gg;
    });
    const skirt = mesh(skirtGeo, ctx.mat(spec.edge || 'wood', { rough: 1, flat: true }));
    skirt.position.y = -h;
    skirt.castShadow = false;
    g.add(skirt);
  }
  return g;
}

/**
 * plot — a flat patch of contrasting ground (a field, a yard, a rug, a lawn).
 * spec: { size:[w,d] | radius, color, y }
 */
function plot(spec, ctx) {
  const c = ctx.mat(spec.color || 'foliage');
  let m;
  if (spec.radius) {
    m = new THREE.Mesh(ctx.geo(`plotr:${spec.radius}`, () => new THREE.CircleGeometry(spec.radius, 32).rotateX(-Math.PI / 2)), c);
  } else {
    const [w, d] = spec.size || [4, 4];
    m = new THREE.Mesh(ctx.geo(`plot:${w},${d}`, () => new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2)), c);
  }
  m.receiveShadow = true;
  m.position.y = spec.y ?? 0.02;
  return m;
}

/**
 * water — a translucent pool/pond/tank surface.
 * spec: { size:[w,d] | radius, color, depth }
 */
function water(spec, ctx) {
  const g = new THREE.Group();
  const m = ctx.mat(spec.color || 'water', { rough: 0.15, metal: 0.1, opacity: 0.85 });
  let surf;
  if (spec.radius) {
    surf = new THREE.Mesh(ctx.geo(`watr:${spec.radius}`, () => new THREE.CircleGeometry(spec.radius, 32).rotateX(-Math.PI / 2)), m);
  } else {
    const [w, d] = spec.size || [5, 5];
    surf = new THREE.Mesh(ctx.geo(`wat:${w},${d}`, () => new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2)), m);
  }
  surf.position.y = spec.y ?? 0.06;
  surf.receiveShadow = true;
  g.add(surf);
  return g;
}

/**
 * road — a straight paved strip. Chain several with different `rot` for a path.
 * spec: { length, width, color, markings }
 */
function road(spec, ctx) {
  const g = new THREE.Group();
  const L = spec.length ?? 14, W = spec.width ?? 2.4;
  const base = new THREE.Mesh(
    ctx.geo(`road:${L},${W}`, () => new THREE.PlaneGeometry(W, L).rotateX(-Math.PI / 2)),
    ctx.mat(spec.color || '#8C8A93', { rough: 1 }),
  );
  base.position.y = 0.03; base.receiveShadow = true;
  g.add(base);
  if (spec.markings !== false) {
    const dash = ctx.geo('dash', () => new THREE.PlaneGeometry(0.14, 0.9).rotateX(-Math.PI / 2));
    const dm = ctx.mat('light', { rough: 1 });
    for (let z = -L / 2 + 1; z < L / 2 - 0.5; z += 2.1) {
      const d = new THREE.Mesh(dash, dm);
      d.position.set(0, 0.05, z);
      g.add(d);
    }
  }
  return g;
}

/* ---------------------------------------------------------------- structures */

/**
 * building — the general-purpose structure. Roof style + window grid carry
 * most of the "what industry is this" signal.
 * spec: { size:[w,h,d], color, roof:'flat'|'gable'|'hip'|'saw'|'dome',
 *         roofColor, windows:true|false|'grid'|'strip', windowColor, floors,
 *         door:true, trim }
 */
function building(spec, ctx) {
  const g = new THREE.Group();
  const [w, h, d] = spec.size || [4, 3.2, 3.4];
  const body = box(ctx, w, h, d, spec.color || 'light', { round: 0.1 });
  g.add(body);

  const rc = spec.roofColor || 'primary';
  const roof = spec.roof || 'gable';
  if (roof === 'gable') {
    const rh = spec.roofHeight ?? Math.max(0.7, h * 0.34);
    // A prism, not a pyramid: extrude a triangle along the building's depth.
    const rg = ctx.geo(`gable:${w},${d},${rh}`, () => {
      const tri = new THREE.Shape();
      tri.moveTo(-w / 2 - 0.12, 0); tri.lineTo(w / 2 + 0.12, 0); tri.lineTo(0, rh); tri.closePath();
      const gg = new THREE.ExtrudeGeometry(tri, { depth: d + 0.24, bevelEnabled: false });
      gg.translate(0, 0, -(d + 0.24) / 2);
      return gg;
    });
    const r = mesh(rg, ctx.mat(rc));
    r.position.y = h;
    g.add(r);
  } else if (roof === 'hip') {
    const rh = spec.roofHeight ?? Math.max(0.6, h * 0.3);
    const rg = ctx.geo(`hip:${w},${d},${rh}`, () => {
      const gg = new THREE.CylinderGeometry(0.001, 0.7071, rh, 4, 1);
      gg.rotateY(Math.PI / 4);
      gg.scale((w + 0.24) / 1, 1, (d + 0.24) / 1);
      gg.translate(0, rh / 2, 0);
      return gg;
    });
    const r = mesh(rg, ctx.mat(rc)); r.position.y = h; g.add(r);
  } else if (roof === 'dome') {
    const rr = Math.min(w, d) / 2;
    const rg = ctx.geo(`dome:${rr.toFixed(2)}`, () => new THREE.SphereGeometry(rr, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2));
    const r = mesh(rg, ctx.mat(rc)); r.position.y = h; g.add(r);
  } else if (roof === 'saw') {
    // Sawtooth factory roof — instantly reads as "industrial".
    const teeth = spec.teeth ?? 3;
    const tw = w / teeth;
    for (let i = 0; i < teeth; i++) {
      const s = new THREE.Shape();
      s.moveTo(-tw / 2, 0); s.lineTo(tw / 2, 0); s.lineTo(tw / 2, tw * 0.55); s.closePath();
      const tg = ctx.geo(`saw:${tw.toFixed(2)},${d}`, () => {
        const gg = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false });
        gg.translate(0, 0, -d / 2);
        return gg;
      });
      const t = mesh(tg, ctx.mat(rc));
      t.position.set(-w / 2 + tw * (i + 0.5), h, 0);
      g.add(t);
    }
  } else {
    const r = box(ctx, w + 0.2, 0.16, d + 0.2, rc, { round: 0.04 });
    r.position.y = h; g.add(r);
  }

  // Windows — emissive so interiors glow when the camera dives in.
  if (spec.windows !== false) {
    const wc = ctx.mat(spec.windowColor || 'glass', {
      rough: 0.2, emissive: spec.windowColor || 'glass', emissiveIntensity: spec.windowGlow ?? 0.45,
    });
    const floors = spec.floors ?? Math.max(1, Math.round(h / 1.5));
    const strip = spec.windows === 'strip';
    const perFloor = strip ? 1 : Math.max(1, Math.floor(w / 1.1));
    const wgW = strip ? w * 0.82 : Math.min(0.62, (w / perFloor) * 0.55);
    const wgH = 0.5;
    const wg = ctx.geo(`win:${wgW.toFixed(2)}x${wgH}`, () => new THREE.PlaneGeometry(wgW, wgH));
    for (let f = 0; f < floors; f++) {
      const y = (h / (floors + 1)) * (f + 1) + 0.08;
      for (let i = 0; i < perFloor; i++) {
        const x = perFloor === 1 ? 0 : -w / 2 + (w / (perFloor + 1)) * (i + 1);
        const front = new THREE.Mesh(wg, wc);
        front.position.set(x, y, d / 2 + 0.02);
        g.add(front);
        const back = new THREE.Mesh(wg, wc);
        back.position.set(x, y, -d / 2 - 0.02); back.rotation.y = Math.PI;
        g.add(back);
      }
      const sideCount = Math.max(1, Math.floor(d / 1.4));
      for (let i = 0; i < sideCount; i++) {
        const z = -d / 2 + (d / (sideCount + 1)) * (i + 1);
        const l = new THREE.Mesh(wg, wc);
        l.position.set(-w / 2 - 0.02, y, z); l.rotation.y = -Math.PI / 2; g.add(l);
        const r2 = new THREE.Mesh(wg, wc);
        r2.position.set(w / 2 + 0.02, y, z); r2.rotation.y = Math.PI / 2; g.add(r2);
      }
    }
  }

  if (spec.door !== false) {
    const dr = box(ctx, 0.8, 1.25, 0.12, spec.doorColor || 'accent', { round: 0.04 });
    dr.position.set(0, 0, d / 2 + 0.01);
    g.add(dr);
  }
  return g;
}

/**
 * tower — silo / chimney / grain bin / water tank. spec:
 * { radius, height, color, cap:'cone'|'dome'|'flat', bands }
 */
function tower(spec, ctx) {
  const g = new THREE.Group();
  const r = spec.radius ?? 1.1, h = spec.height ?? 5;
  const body = mesh(cylGeo(ctx, r * (spec.taper ?? 1), r, h, 20), ctx.mat(spec.color || 'metal', { rough: 0.6, metal: 0.25 }));
  g.add(body);
  const cap = spec.cap || 'cone';
  if (cap === 'cone') {
    const c = mesh(ctx.geo(`cone:${r},${r * 0.9}`, () => { const gg = new THREE.ConeGeometry(r * 1.06, r * 0.95, 20); gg.translate(0, r * 0.475, 0); return gg; }), ctx.mat(spec.capColor || 'primary'));
    c.position.y = h; g.add(c);
  } else if (cap === 'dome') {
    const c = mesh(ctx.geo(`hemi:${r}`, () => new THREE.SphereGeometry(r * 1.02, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2)), ctx.mat(spec.capColor || 'primary'));
    c.position.y = h; g.add(c);
  }
  const bands = spec.bands ?? 2;
  for (let i = 1; i <= bands; i++) {
    const b = mesh(cylGeo(ctx, r * 1.04, r * 1.04, 0.12, 20), ctx.mat(spec.bandColor || 'dark', { rough: 0.7 }));
    b.position.y = (h / (bands + 1)) * i;
    g.add(b);
  }
  return g;
}

/**
 * canopy — an open-sided shelter: market stall, loading bay, patio, shed.
 * spec: { size:[w,h,d], color, legColor, awning }
 */
function canopy(spec, ctx) {
  const g = new THREE.Group();
  const [w, h, d] = spec.size || [3.4, 2.4, 3];
  const legG = boxGeo(ctx, 0.16, h, 0.16, 0.03);
  const legM = ctx.mat(spec.legColor || 'wood');
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    const l = mesh(legG, legM);
    l.position.set(sx * (w / 2 - 0.14), 0, sz * (d / 2 - 0.14));
    g.add(l);
  });
  const roof = box(ctx, w, 0.18, d, spec.color || 'accent', { round: 0.05 });
  roof.position.y = h; g.add(roof);
  if (spec.awning !== false) {
    const stripes = Math.max(3, Math.round(w / 0.5));
    const sg = ctx.geo(`stripe:${(w / stripes).toFixed(3)}`, () => new THREE.PlaneGeometry(w / stripes, 0.42));
    for (let i = 0; i < stripes; i++) {
      const s = new THREE.Mesh(sg, ctx.mat(i % 2 ? (spec.color || 'accent') : 'light', { rough: 1 }));
      s.position.set(-w / 2 + (w / stripes) * (i + 0.5), h - 0.2, d / 2 + 0.01);
      g.add(s);
    }
  }
  return g;
}

/* -------------------------------------------------------------------- nature */

/**
 * tree — 'round' (deciduous), 'pine', 'palm'. The single most useful prop for
 * making a scene feel inhabited rather than diagrammatic.
 * spec: { height, color, trunkColor, kind }
 */
function tree(spec, ctx) {
  const g = new THREE.Group();
  const h = spec.height ?? 2.6;
  const kind = spec.kind || 'round';
  const trunkH = kind === 'palm' ? h * 0.72 : h * 0.38;
  const tr = mesh(cylGeo(ctx, h * 0.045, h * 0.065, trunkH, 8), ctx.mat(spec.trunkColor || 'wood', { rough: 1 }));
  g.add(tr);
  const fol = ctx.mat(spec.color || 'foliage', { flat: true, rough: 1 });
  if (kind === 'pine') {
    for (let i = 0; i < 3; i++) {
      const s = 1 - i * 0.26;
      const c = mesh(ctx.geo(`pine:${(h * 0.42 * s).toFixed(2)}`, () => {
        const gg = new THREE.ConeGeometry(h * 0.26 * s, h * 0.42, 9); gg.translate(0, h * 0.21, 0); return gg;
      }), fol);
      c.position.y = trunkH + i * h * 0.22;
      g.add(c);
    }
  } else if (kind === 'palm') {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const frond = mesh(boxGeo(ctx, h * 0.42, 0.07, 0.3, 0.05), fol);
      frond.position.set(Math.cos(a) * h * 0.2, trunkH, Math.sin(a) * h * 0.2);
      frond.rotation.set(0, -a, -0.42);
      g.add(frond);
    }
  } else {
    const blobs = spec.blobs ?? 3;
    for (let i = 0; i < blobs; i++) {
      const r = h * (0.3 - i * 0.045);
      const b = mesh(sphereGeo(ctx, r, 12), fol);
      b.position.set(jitter(ctx, h * 0.09), trunkH + h * 0.22 + i * h * 0.13, jitter(ctx, h * 0.09));
      g.add(b);
    }
  }
  return g;
}

/** bush / crop clump / shrub. spec: { radius, color } */
function bush(spec, ctx) {
  const g = new THREE.Group();
  const r = spec.radius ?? 0.45;
  const m = ctx.mat(spec.color || 'foliage', { flat: true, rough: 1 });
  for (let i = 0; i < 3; i++) {
    const b = mesh(sphereGeo(ctx, r * (0.7 + ctx.rng() * 0.4), 10), m);
    b.position.set(jitter(ctx, r * 0.7), r * 0.5 + jitter(ctx, r * 0.2), jitter(ctx, r * 0.7));
    g.add(b);
  }
  return g;
}

/** rock / boulder. spec: { radius, color } */
function rock(spec, ctx) {
  const r = spec.radius ?? 0.5;
  const g = ctx.geo(`rock:${r.toFixed(2)}`, () => {
    const gg = new THREE.IcosahedronGeometry(r, 0);
    const pos = gg.attributes.position, rr = makeRng(31);
    for (let i = 0; i < pos.count; i++) {
      pos.setXYZ(i, pos.getX(i) * (0.8 + rr() * 0.5), pos.getY(i) * (0.6 + rr() * 0.4), pos.getZ(i) * (0.8 + rr() * 0.5));
    }
    gg.computeVertexNormals(); gg.translate(0, r * 0.5, 0);
    return gg;
  });
  return mesh(g, ctx.mat(spec.color || '#9A9187', { flat: true, rough: 1 }));
}

/**
 * field — rows of crops/plants. Reads instantly as agriculture, nursery, farm.
 * spec: { size:[w,d], rows, color, plantHeight, rowColor }
 */
function field(spec, ctx) {
  const g = new THREE.Group();
  const [w, d] = spec.size || [7, 5];
  const rows = spec.rows ?? 6;
  g.add(plot({ size: [w, d], color: spec.rowColor || '#8E7A55' }, ctx));
  const ph = spec.plantHeight ?? 0.5;
  const pg = sphereGeo(ctx, ph * 0.42, 8);
  const pm = ctx.mat(spec.color || 'foliage', { flat: true, rough: 1 });
  const perRow = Math.max(2, Math.floor(w / 0.7));
  const im = new THREE.InstancedMesh(pg, pm, rows * perRow);
  im.castShadow = true;
  const dummy = new THREE.Object3D();
  let n = 0;
  for (let r = 0; r < rows; r++) {
    for (let i = 0; i < perRow; i++) {
      dummy.position.set(
        -w / 2 + (w / (perRow + 1)) * (i + 1) + jitter(ctx, 0.08),
        ph * 0.5,
        -d / 2 + (d / (rows + 1)) * (r + 1),
      );
      const s = 0.8 + ctx.rng() * 0.45;
      dummy.scale.set(s, s * 1.2, s);
      dummy.updateMatrix();
      im.setMatrixAt(n++, dummy.matrix);
    }
  }
  im.count = n;
  g.add(im);
  return g;
}

/**
 * scatter — N copies of any prop spread over an area or ring. The cheap way to
 * make a scene dense. spec: { of:{...propSpec}, count, area:[w,d]|radius,
 *                             ring:{inner,outer}, scaleVary, avoid }
 */
function scatter(spec, ctx) {
  const g = new THREE.Group();
  const count = spec.count ?? 8;
  const avoid = spec.avoid ?? 0;
  for (let i = 0; i < count; i++) {
    let x, z, guard = 0;
    do {
      if (spec.ring) {
        const a = ctx.rng() * Math.PI * 2;
        const rr = spec.ring.inner + ctx.rng() * (spec.ring.outer - spec.ring.inner);
        x = Math.cos(a) * rr; z = Math.sin(a) * rr;
      } else if (spec.radius) {
        const a = ctx.rng() * Math.PI * 2, rr = Math.sqrt(ctx.rng()) * spec.radius;
        x = Math.cos(a) * rr; z = Math.sin(a) * rr;
      } else {
        const [w, d] = spec.area || [10, 10];
        x = (ctx.rng() - 0.5) * w; z = (ctx.rng() - 0.5) * d;
      }
    } while (Math.hypot(x, z) < avoid && guard++ < 24);

    const child = buildProp(spec.of || { type: 'tree' }, ctx);
    child.position.set(x, 0, z);
    child.rotation.y = ctx.rng() * Math.PI * 2;
    if (spec.scaleVary) {
      const s = 1 + (ctx.rng() - 0.5) * 2 * spec.scaleVary;
      child.scale.setScalar(s);
    }
    g.add(child);
  }
  return g;
}

/* ------------------------------------------------------------- things & work */

/** crate / pallet / box stack. spec: { size, color, stack } */
function crate(spec, ctx) {
  const g = new THREE.Group();
  const s = spec.size ?? 0.8;
  const stack = spec.stack ?? 1;
  for (let i = 0; i < stack; i++) {
    const b = box(ctx, s, s * 0.8, s, spec.color || 'wood', { round: 0.05 });
    b.position.set(jitter(ctx, s * 0.08), i * s * 0.82, jitter(ctx, s * 0.08));
    b.rotation.y = jitter(ctx, 0.2);
    g.add(b);
    const band = box(ctx, s * 1.02, 0.06, s * 1.02, spec.bandColor || 'accent', { round: 0.02 });
    band.position.y = i * s * 0.82 + s * 0.5;
    g.add(band);
  }
  return g;
}

/** vehicle — van/truck/cart. spec: { length, color, cabColor, kind:'van'|'truck'|'cart' } */
function vehicle(spec, ctx) {
  const g = new THREE.Group();
  const L = spec.length ?? 3.2, W = L * 0.42, H = L * 0.34;
  const kind = spec.kind || 'van';
  if (kind === 'truck') {
    const cab = box(ctx, W, H, L * 0.3, spec.cabColor || spec.color || 'primary', { round: 0.09 });
    cab.position.z = L * 0.32; cab.position.y = 0.28; g.add(cab);
    const bed = box(ctx, W, H * 1.15, L * 0.62, spec.color || 'light', { round: 0.07 });
    bed.position.z = -L * 0.16; bed.position.y = 0.28; g.add(bed);
  } else if (kind === 'cart') {
    const body = box(ctx, W, H * 0.7, L * 0.8, spec.color || 'wood', { round: 0.06 });
    body.position.y = 0.26; g.add(body);
  } else {
    const body = box(ctx, W, H, L * 0.9, spec.color || 'primary', { round: 0.14 });
    body.position.y = 0.28; g.add(body);
    const win = box(ctx, W * 1.01, H * 0.34, L * 0.34, 'glass', { round: 0.05, rough: 0.2 });
    win.position.set(0, 0.28 + H * 0.5, L * 0.22); g.add(win);
  }
  const wg = ctx.geo(`wheel:${(L * 0.1).toFixed(2)}`, () => {
    const gg = new THREE.CylinderGeometry(L * 0.1, L * 0.1, L * 0.07, 12);
    gg.rotateZ(Math.PI / 2); return gg;
  });
  const wm = ctx.mat('dark', { rough: 1 });
  [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([sx, sz]) => {
    const wheel = mesh(wg, wm);
    wheel.position.set(sx * W / 2, L * 0.1, sz * L * 0.3);
    g.add(wheel);
  });
  return g;
}

/** person — a soft abstract figure. Scale gives the whole diorama its sense of size. */
function person(spec, ctx) {
  const g = new THREE.Group();
  const h = spec.height ?? 1.7;
  const body = mesh(ctx.geo(`pbody:${h.toFixed(2)}`, () => {
    const gg = new THREE.CapsuleGeometry(h * 0.14, h * 0.42, 4, 10);
    gg.translate(0, h * 0.14 + h * 0.21 + h * 0.2, 0); return gg;
  }), ctx.mat(spec.color || 'secondary'));
  g.add(body);
  const head = mesh(sphereGeo(ctx, h * 0.115, 12), ctx.mat(spec.skin || '#D8A883'));
  head.position.y = h * 0.88; g.add(head);
  const legG = cylGeo(ctx, h * 0.05, h * 0.05, h * 0.36, 8);
  const legM = ctx.mat(spec.legColor || 'dark');
  [-1, 1].forEach((s) => { const l = mesh(legG, legM); l.position.x = s * h * 0.07; g.add(l); });
  return g;
}

/** machine — a generic industrial unit: press, server rack, oven, mixer, kiosk. */
function machine(spec, ctx) {
  const g = new THREE.Group();
  const [w, h, d] = spec.size || [1.6, 2, 1.2];
  g.add(box(ctx, w, h, d, spec.color || 'metal', { round: 0.08, rough: 0.55, metal: 0.35 }));
  const panel = box(ctx, w * 0.6, h * 0.3, 0.08, spec.panelColor || 'dark', { round: 0.03 });
  panel.position.set(0, h * 0.62, d / 2 + 0.02); g.add(panel);
  const lights = spec.lights ?? 3;
  const lg = sphereGeo(ctx, 0.07, 8);
  for (let i = 0; i < lights; i++) {
    const c = [ctx.palette.accent, '#7ED47E', '#E0645C'][i % 3];
    const l = new THREE.Mesh(lg, ctx.mat(c, { emissive: c, emissiveIntensity: 1.4, rough: 0.3 }));
    l.position.set(-w * 0.22 + i * 0.22, h * 0.62, d / 2 + 0.07);
    g.add(l);
  }
  if (spec.pipe !== false) {
    const p = mesh(cylGeo(ctx, 0.12, 0.12, h * 0.5, 10), ctx.mat('metal', { metal: 0.5, rough: 0.4 }));
    p.position.set(w * 0.3, h, 0); g.add(p);
  }
  return g;
}

/** rack — shelving / server racks / warehouse storage. spec:{ size, levels, color, fill } */
function rack(spec, ctx) {
  const g = new THREE.Group();
  const [w, h, d] = spec.size || [3, 2.6, 1];
  const levels = spec.levels ?? 3;
  const postG = boxGeo(ctx, 0.1, h, 0.1, 0.02);
  const postM = ctx.mat(spec.color || 'metal', { metal: 0.4, rough: 0.5 });
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    const p = mesh(postG, postM);
    p.position.set(sx * (w / 2 - 0.06), 0, sz * (d / 2 - 0.06));
    g.add(p);
  });
  for (let i = 0; i < levels; i++) {
    const y = (h / levels) * i + 0.1;
    const shelf = box(ctx, w, 0.08, d, spec.shelfColor || 'metal', { round: 0.02 });
    shelf.position.y = y; g.add(shelf);
    if (spec.fill !== false) {
      const items = Math.max(1, Math.floor(w / 0.75));
      for (let k = 0; k < items; k++) {
        if (ctx.rng() < 0.18) continue;
        const bw = w / items * 0.78;
        const b = box(ctx, bw, 0.5, d * 0.72, spec.fillColor || (ctx.rng() < 0.5 ? 'wood' : 'secondary'), { round: 0.03 });
        b.position.set(-w / 2 + (w / items) * (k + 0.5), y + 0.08, 0);
        g.add(b);
      }
    }
  }
  return g;
}

/** conveyor — a moving line. The clearest visual shorthand for "process". */
function conveyor(spec, ctx) {
  const g = new THREE.Group();
  const L = spec.length ?? 6, W = spec.width ?? 0.9, H = spec.height ?? 0.9;
  const belt = box(ctx, W, 0.14, L, spec.color || 'dark', { round: 0.04 });
  belt.position.y = H; g.add(belt);
  const legG = boxGeo(ctx, 0.1, H, 0.1, 0.02);
  const legM = ctx.mat('metal', { metal: 0.4, rough: 0.5 });
  for (let z = -L / 2 + 0.4; z <= L / 2 - 0.4; z += 1.8) {
    [-1, 1].forEach((s) => { const l = mesh(legG, legM); l.position.set(s * (W / 2 - 0.08), 0, z); g.add(l); });
  }
  const items = spec.items ?? 4;
  for (let i = 0; i < items; i++) {
    const b = box(ctx, W * 0.5, 0.36, W * 0.5, spec.itemColor || 'accent', { round: 0.05 });
    b.position.set(0, H + 0.25, -L / 2 + (L / items) * (i + 0.5));
    g.add(b);
  }
  return g;
}

/** sign / banner — the only place text-like shape is allowed; keep it abstract. */
function sign(spec, ctx) {
  const g = new THREE.Group();
  const w = spec.width ?? 2.4, h = spec.height ?? 1.1, post = spec.post ?? 1.6;
  const p = mesh(cylGeo(ctx, 0.08, 0.09, post, 10), ctx.mat('dark'));
  g.add(p);
  const board = box(ctx, w, h, 0.14, spec.color || 'primary', { round: 0.08 });
  board.position.y = post + h / 2; g.add(board);
  const bars = spec.bars ?? 2;
  for (let i = 0; i < bars; i++) {
    const b = box(ctx, w * (0.66 - i * 0.22), 0.12, 0.05, spec.inkColor || 'light', { round: 0.02 });
    b.position.set(0, post + h * (0.62 - i * 0.3), 0.09);
    g.add(b);
  }
  return g;
}

/** lamp — a light post with a real glow. Essential for night/interior scenes. */
function lamp(spec, ctx) {
  const g = new THREE.Group();
  const h = spec.height ?? 3;
  g.add(mesh(cylGeo(ctx, 0.07, 0.1, h, 10), ctx.mat(spec.color || 'dark')));
  const c = spec.lightColor || '#FFE3A8';
  const head = new THREE.Mesh(sphereGeo(ctx, 0.22, 12), ctx.mat(c, { emissive: c, emissiveIntensity: 2, rough: 0.3 }));
  head.position.y = h; g.add(head);
  if (spec.cast) {
    const pl = new THREE.PointLight(new THREE.Color(c), spec.intensity ?? 6, spec.distance ?? 9, 2);
    pl.position.y = h; g.add(pl);
  }
  return g;
}

/** fence — a run of posts + rails. spec:{ length, height, color, rot } */
function fence(spec, ctx) {
  const g = new THREE.Group();
  const L = spec.length ?? 8, h = spec.height ?? 0.9;
  const postG = boxGeo(ctx, 0.1, h, 0.1, 0.02);
  const m = ctx.mat(spec.color || 'wood', { rough: 1 });
  const n = Math.max(2, Math.round(L / 1.2));
  for (let i = 0; i <= n; i++) {
    const p = mesh(postG, m);
    p.position.z = -L / 2 + (L / n) * i;
    g.add(p);
  }
  [0.35, 0.72].forEach((f) => {
    const r = mesh(boxGeo(ctx, 0.07, 0.09, L, 0.02), m);
    r.position.y = h * f; g.add(r);
  });
  return g;
}

/** cloud — soft blobs that sell the "island floating in sky" read. */
function cloud(spec, ctx) {
  const g = new THREE.Group();
  const s = spec.size ?? 3;
  const m = ctx.mat(spec.color || '#FFFFFF', { rough: 1, opacity: spec.opacity ?? 0.92, flat: false });
  for (let i = 0; i < 4; i++) {
    const b = new THREE.Mesh(sphereGeo(ctx, s * (0.28 + ctx.rng() * 0.22), 12), m);
    b.position.set(jitter(ctx, s * 0.6), jitter(ctx, s * 0.12), jitter(ctx, s * 0.35));
    g.add(b);
  }
  return g;
}

/**
 * diorama — a cut-out illustration facing local +Z (the incoming camera).
 * spec: { src, height, aspect, width }
 * The plane stands on y = 0 and is centred on the local origin.
 */
function diorama(spec, ctx) {
  const THREE = ctx.THREE;
  const aspect = spec.aspect ?? (1536 / 1024);
  const height = spec.height ?? 7.2;
  const width = spec.width ?? height * aspect;
  const g = new THREE.Group();

  const geo = ctx.geo(
    `diorama:${width.toFixed(2)}x${height.toFixed(2)}`,
    () => new THREE.PlaneGeometry(width, height),
  );
  // alphaTest drops the transparent margin so the illustration reads as a
  // cut-out model, not a card pasted on a slab.
  const mat = ctx.track(new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 1,
    metalness: 0,
    transparent: true,
    alphaTest: 0.08,
    side: THREE.DoubleSide,
  }));
  const plane = new THREE.Mesh(geo, mat);
  plane.position.set(0, height / 2, 0);
  plane.visible = false;
  g.add(plane);

  if (spec.src) {
    new THREE.TextureLoader().load(spec.src, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      mat.map = tex;
      mat.needsUpdate = true;
      plane.visible = true;
      if (ctx.requestRender) ctx.requestRender();
    });
  }

  return g;
}

/** group — nest a sub-arrangement so a spec can build compound props. */
function groupProp(spec, ctx) {
  const g = new THREE.Group();
  (spec.props || []).forEach((p) => g.add(placeProp(p, ctx)));
  return g;
}

/* ------------------------------------------------------------------ registry */

export const PROPS = {
  island, plot, water, road,
  building, tower, canopy,
  tree, bush, rock, field, scatter,
  crate, vehicle, person, machine, rack, conveyor,   sign, lamp, fence, cloud, diorama,
  group: groupProp,
};

/** Build a prop from its spec (no placement applied). */
export function buildProp(spec, ctx) {
  const fn = PROPS[spec.type];
  if (!fn) {
    console.warn(`[scroll-forge] unknown prop type "${spec.type}" — skipped`);
    return new THREE.Group();
  }
  return fn(spec, ctx);
}

/**
 * Build a prop AND apply its placement fields:
 *   at:[x,z] | at:[x,y,z]   rot (radians, Y) | rotDeg   scale   lift
 */
export function placeProp(spec, ctx) {
  const o = buildProp(spec, ctx);
  const at = spec.at || [0, 0];
  if (at.length === 3) o.position.set(at[0], at[1], at[2]);
  else o.position.set(at[0], spec.lift || 0, at[1]);
  if (spec.rotDeg != null) o.rotation.y = (spec.rotDeg * Math.PI) / 180;
  else if (spec.rot != null) o.rotation.y = spec.rot;
  if (spec.scale != null) {
    if (Array.isArray(spec.scale)) o.scale.set(...spec.scale);
    else o.scale.setScalar(spec.scale);
  }
  o.name = spec.name || spec.type;
  return o;
}

/**
 * Build one complete scene (island + all its props) as a single group whose
 * origin is the island centre at ground level.
 *
 * sceneSpec: { island:{...}, props:[ {type, at, ...}, ... ] }
 */
export function buildSceneGroup(sceneSpec, ctx) {
  const g = new THREE.Group();
  const isl = sceneSpec.island === false ? null : island(sceneSpec.island || {}, ctx);
  if (isl) g.add(isl);
  (sceneSpec.props || []).forEach((p) => g.add(placeProp(p, ctx)));
  return g;
}
