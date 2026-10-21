---
name: scroll-forge
description: >
  Build an immersive scroll-scrubbed "fly through the world" landing page for any
  industry or brand — with no image or video generation service, no API key, and no
  subscription. As the visitor scrolls, a camera flies from outside each scene into
  it, then on to the next with no cuts: one continuous connected flight through a
  miniature diorama world. The flight is rendered live in WebGL from a declarative
  world spec you compose, so it costs nothing to generate, weighs kilobytes, and
  cannot pop at a seam. The skill interviews the user for the topic, the story
  beats, and the brand kit, composes the world, wires a portable scroll-scrub
  engine, and verifies the result in a headless browser. Use when the user wants a
  "3D world" / "browse-through-the-industry" hero, a scroll cinematic, a diorama
  landing page, or to turn a business into a scrollable world.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion, Skill
---

# scroll-forge

Produces a landing page where **scroll drives a camera**: it flies from outside a
scene into it, then out and on to the next, continuously, with no visible cuts.

The camera is real. The world is real 3D. Scroll only drives *time along a path*.

**What you produce:** a `sections[]` config where each section carries both its copy
*and* a declarative **scene spec** (an island plus props), which the engine turns
into geometry at load and flies a single spline camera through.

**Why this exists.** The well-known version of this effect pre-renders the flight
with a paid generative-video service, which means a subscription, per-run credits,
NSFW false-positives on innocuous interiors, and multi-megabyte clips. Its hardest
problem is that consecutive generated clips must be *frame-identical* at the seam or
the page visibly pops. **None of that applies here.** There is one camera on one
continuous spline in one scene graph, so a seam is not something you QA — it does
not exist. A seven-scene world builds in under a second and ships as a few hundred
lines of JSON-ish config.

**The one rule that makes or breaks it:** the camera always enters a scene from its
**local +Z** and flies toward **−Z**, so the approach corridor must be kept clear.
Read [Composition rules](#step-3--compose-each-scene) before writing a scene spec.
Getting this wrong is the single most common failure and produces a shot that ends
with a wall filling the frame.

Do not assume a frontend framework. `references/world-engine.js` builds its own DOM
and injects its own namespaced CSS into a container you give it, so it drops into
plain HTML, Next.js, Vue, a Django template, anything. The value of this skill is
the world-composition vocabulary, the camera grammar, and the pacing model — not
the framework.

---

## Step 0 — Bootstrap

1. **Node** (any current LTS) for the vendoring step and the QA harness. Nothing
   else is required — no CLI to install, no account, no key, no credits.
2. **Vendor three.js locally.** It is MIT and the only runtime dependency. Do NOT
   load it from a CDN — the whole point is that the page has no network
   dependency at runtime.

   ```bash
   npm install three
   mkdir -p vendor
   # BOTH files. three.module.js does `import './three.core.js'` internally,
   # so shipping only the first gives a bare-specifier failure at load.
   cp node_modules/three/build/three.module.js node_modules/three/build/three.core.js vendor/
   ```

   Then map it in the page:
   ```html
   <script type="importmap">
     { "imports": { "three": "./vendor/three.module.js" } }
   </script>
   ```
   In a bundler (Next/Vite) skip the importmap entirely and just `npm install three`.

3. **Copy the engine + kit** into the project next to each other:
   `references/world-engine.js` and `references/kit.js`. The engine imports
   `./kit.js` relatively, so keep them siblings.
4. **A static server for QA** — modules will not load over `file://`. The QA
   harness in `references/qa.mjs` starts its own server, so you do not need one
   separately.
5. Optional: **Playwright or Puppeteer** for Step 6. If neither is installed and
   the user does not want it, say so and hand them the manual QA checklist instead
   of silently skipping verification.

---

## Step 1 — Interview the user

The **subject is the user's to state — ask it as an open question in plain prose**,
never a fabricated multiple-choice. A made-up list of industries biases them and
reads as you deciding their business for them; let them answer in their own words
(their real business, a client's, or any idea). Reserve structured multiple-choice
(`AskUserQuestion`) for the genuinely enumerable, lower-stakes choices — art
direction and brand-kit approach — and even there, signal they can go their own way.
Ask only what you cannot sensibly default.

1. **Subject** (open question) — "What should this world be about? Your business, a
   client's, or any idea — a word or a sentence is fine." Capture the
   industry/product, a one-line pitch ("a bubble tea company, from leaf to last
   sip"), and a brand name if they have one.
2. **Brand kit** — offer three paths:
   - They hand you a palette + name + tone.
   - You read it off an existing site/repo they point at (`Read`/`Grep` their CSS
     tokens or Tailwind config — often the fastest and most accurate route).
   - You propose a palette and they approve.

   Capture **4–6 named hex values**, a display name, and a tone word or two. These
   become the `palette` — see [Palette](#palette) for which keys matter.
3. **Art direction** — the default is soft matte **clay diorama**, isometric,
   miniature, warm light, which is what the prop kit is built for. Alternatives are
   reached by palette and lighting rather than by new geometry:
   - *clay diorama* (default) — warm light, saturated ground, `exposure: 1.05`
   - *paper / architectural* — near-white palette, low saturation, `shadows: true`
   - *night / neon* — dark `sky`, dark `--sf-bg`, `lamp` props with `cast: true`,
     high `windowGlow`
   - *toy / playful* — high-chroma primaries, bigger `scaleVary` on scatter
4. **The journey (sections)** — the ordered scenes the camera flies through.
   Propose a set derived from the subject's own value chain and let the user edit.
   **5–7 works well.** Coffee example: highlands → mill → roastery → café → the cup.
   Each section needs: an eyebrow, a headline, one line of body, 0–3 tag pills, and
   a one-line description of *what is physically in that scene*. The last section is
   usually the hero + the CTA.
5. **Scope check.** Tell them what it will cost, because the honest answer is
   surprising: **nothing, and about a minute of your time per scene.** There is no
   credit estimate to approve, no re-roll budget, no generation queue. If they were
   expecting the generative-video workflow, say plainly that this trades
   photoreal AI renders for a stylised procedural world that is free, instant,
   seam-proof, and ~200 KB. If they specifically want photoreal AI-generated
   scenery, see [Bring your own imagery](#step-5--optional-bring-your-own-imagery)
   — but do not silently substitute one for the other.

Keep the scroll mechanic fixed (continuous fly-through) — that is the point of the
skill.

---

## Step 2 — Lay out the world

You mostly do not. The engine places the islands for you along a gently serpentine
path, so consecutive scenes are visible from each other and the fly-over reads as
one connected world rather than a slideshow. The knobs, all optional:

| Config | Default | Effect |
|---|---|---|
| `gap` | `27` | World units between island edges. Raise if scenes crowd each other on screen. |
| `turn` | `0.34` | Radians the path bends per scene, alternating. `0` = a straight line. |
| `drift` | `2.2` | Vertical wander between islands. `0` = all islands coplanar. |
| `fov` | `46` | Camera field of view. Widened automatically in portrait. |
| `seed` | `7` | Any integer. Reshuffles every scattered prop; same seed always rebuilds the identical world. |

Island size is per-scene (`scene.island.radius`, default 9). **Vary it** — a uniform
world looks like a spreadsheet. Give the hero and the finale bigger islands.

---

## Step 3 — Compose each scene

This is the actual craft of the skill. A scene is an island plus a list of props,
each placed by `at: [x, z]` in the scene's local frame.

### Composition rules

**1. The camera enters from local +Z and flies toward −Z.** The engine rotates every
scene to face its own incoming camera, so this is true for every scene regardless of
where it sits in the world. Therefore:

```
        −Z  ── far side: put the hero mass here (the big building, the tower)
         │
         │   ── mid: the working props (machines, people, vehicles)
         │
        +Z  ── approach corridor: KEEP CLEAR. Low props only.
             ▲
             └── camera flies in from here
```

**2. Keep the approach corridor clear.** Nothing tall within roughly `x ∈ [-2, 2]`,
`z ∈ [0, +R]`. Ground planes (`plot`, `road`, `water`), `bush`, `crate`, `person`
are all fine there — they add foreground depth. A 4-metre building there ends the
shot as a wall.

The engine defends against this: it walks the dive's endpoint backwards until
whatever is in front of it is far enough away to actually *fit the frame*
(height / 2·tan(fov/2)). That keeps a bad composition from being unusable — but it
does so by backing the camera off, which loses the intimacy you wanted. Compose it
right and you get the close shot for free.

**3. The default dive is a medium shot, not a landing.** It ends above and outside
the scene looking in. This is deliberate: ending down among the props looks superb
when the author composed for it and terrible otherwise. When you *have* composed a
specific corridor and want the intimate arrival, say so explicitly:

```js
camera: { to: [0, 2.2, 4.5], lookAt: [0, 1.4, -3] }   // scene-local coords
```
`camera` accepts `from` (establishing), `via` (mid-dive), `to` (arrival), and
`lookAt`. All are scene-local and rotate with the scene. Any you set is respected
verbatim — the clearance walk-back is skipped for it, because you have asserted you
know what is there.

**4. Odd numbers and asymmetry.** Three trees beat four. Offset the hero building
from dead centre. Rotate props off-axis with `rotDeg`.

**5. Include people.** One or two `person` props give the whole diorama its sense of
scale, and their absence is the main reason a scene reads as a diagram.

**6. Use `scatter` for density, explicit props for meaning.** Hand-place the things
the copy refers to; scatter the trees, rocks and bushes that make it a place.

### Palette

Every prop's `color` accepts either a palette key or a raw hex. **Prefer keys** —
that is what makes the world read as one brand instead of a set of unrelated models.

| Key | Used by |
|---|---|
| `primary` | roofs, hero accents, vehicles |
| `secondary` | clothing, secondary structures |
| `accent` | awnings, signage, indicator lights |
| `dark` | posts, tyres, roof decks |
| `light` | walls, panels |
| `ground` | island tops |
| `water` | water surfaces |
| `foliage` | trees, bushes, crops |
| `metal` | towers, racks, machines |
| `wood` | trunks, crates, fences |
| `glass` | windows |

### The prop kit

Full parameter reference in `references/kit.js` (each builder is documented at its
definition). Placement fields work on every prop: `at: [x, z]` (or `[x, y, z]`),
`rotDeg`, `scale`, `lift`, `name`.

| Prop | Reads as |
|---|---|
| `island` | the ground every scene sits on (implicit — via `scene.island`) |
| `plot` / `road` / `water` | yards, lawns, paving, ponds, tanks |
| `building` | anything enclosed. `roof: flat\|gable\|hip\|dome\|saw`; `saw` = industrial instantly |
| `tower` | silo, chimney, grain bin, water tank |
| `canopy` | market stall, loading bay, patio, shed |
| `tree` (`round\|pine\|palm`), `bush`, `rock` | making it a place, not a diagram |
| `field` | agriculture, nursery, rows of anything |
| `scatter` | N copies of any prop over an `area`, `radius`, or `ring` |
| `crate`, `rack`, `conveyor` | storage, logistics, process, "a line" |
| `machine` | press, oven, mixer, server, kiosk — with glowing indicators |
| `vehicle` (`van\|truck\|cart`) | delivery, fleet, movement |
| `person` | scale, life, "someone works here" |
| `sign`, `lamp`, `fence`, `cloud` | finishing detail; `lamp` with `cast: true` emits real light |
| `group` | nest a sub-arrangement to build a compound prop |

If a subject needs something the kit lacks, **compose it from primitives with
`group`** before you consider writing a new builder. A coffee cup is a `tower` with
a `dome` cap; a solar farm is `scatter` of thin rotated `plot`s; a server hall is
`rack` repeated with `fill: true`.

When you *do* add a builder to `kit.js`: keep the footprint centred on the local
origin and **standing on y = 0**. Every placement, shadow and clearance calculation
assumes it.

---

## Step 4 — Wire the page and set the pacing

Copy `references/index-template.html` as the starting point (or adapt into the
user's framework — mount from a `useEffect`/`onMounted` ref and call `destroy()` on
unmount). `references/example-world.html` is a complete, verified five-scene build
to copy the shape from.

Pacing is where a correct world becomes a good one. Two knobs per section:

- **`scroll`** — viewport-heights of scroll spent on this scene. More = longer
  dwell. Give the hero and the finale ~2.0; keep transit scenes at ~1.4.
- **`linger`** (0–1, keep ≤ 0.6) — remaps time so the camera **settles mid-scene**,
  exactly where the copy peaks, then picks up speed toward the exit. Endpoints are
  mathematically untouched (f(0)=0, f(1)=1), so pacing never affects continuity.

Give the scenes the copy leans on a higher `scroll` *and* some `linger`; the two
compound. `connectorScroll` per section tunes the fly-over that follows it.

Remember scroll is a scrubber: visitors scroll **up** too, and every move plays in
reverse. That is free here — there is no rendered direction to get wrong.

---

## Step 5 — (Optional) Bring your own imagery

Nothing in this skill needs generated art, but if the user has imagery they want
*in* the world — a logo, a product photo, a real texture — it drops in as a
`THREE.TextureLoader` material on a `plot` or a `building` face. Do this after the
world reads correctly, not before, and keep it to a few hero surfaces: a procedural
world with two photographic accents looks intentional; one with fifteen looks like a
collage.

Do **not** reach for a paid generation service to fill a gap in the prop kit. Compose
it from primitives (Step 3) — that keeps the build free, instant and reproducible,
which is the entire premise.

---

## Step 6 — QA (don't skip)

`references/qa.mjs` is a complete harness: it serves the directory, drives the page
in a headless browser, samples the flight, and reports. Run it:

```bash
node qa.mjs            # expects `playwright` resolvable; set PW_PATH to override
```

Headless WebGL needs software rendering — the harness already passes
`--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`. Without those
the page loads and renders nothing, which looks exactly like a code bug.

What to assert:

- **`errors` is empty.** (A lone favicon 404 with an empty `failed` array is the
  browser's own request, not your page — ignore that one.)
- **`scrollDrive.cameraMoved` is well above zero.** Real scrolling must move the
  camera. Every other check drives the engine directly via `setProgress()` and so
  passes even when nothing is wired to scroll at all — this is the only assertion
  that reflects what a visitor experiences. `scrollDrive.scrollerTag` tells you
  which element is driving (`window`, or e.g. `main` inside an app shell).
- **`buriedFrames` is empty.** This is the check that matters for framing. It raycasts six axes
  from the camera at each sample; a high value means the camera is inside geometry.
  Anything listed here is a shot that renders as a flat wall of colour.
- **`continuity.ratio` under ~2.5.** The worst frame-to-frame camera hop versus the
  mean. The spline cannot teleport, so a spike means an anchor was placed
  pathologically (usually a scene whose `camera.to` override is far outside its
  island).
- **Look at the screenshots.** They land in `shots/`. This is not optional — the
  bugs that matter here are visual (a prop floating, a scene facing the wrong way, a
  hero mass cropping the frame) and no assertion catches them. Read `p000.png`
  (the landing frame) and `p100.png` (the CTA frame) at minimum.
- **`stats`** — a healthy world is a few hundred draw calls and low tens of
  thousands of triangles. If you are in the millions, something is scattering
  recursively.
- **Mobile** — the harness shoots one portrait frame. Confirm the scene is framed,
  not cropped; the engine widens FOV below 0.85 aspect to make that true.

Also check by hand: `prefers-reduced-motion` (damping off, clouds static — the
camera still tracks scroll, which is direct manipulation and appropriate), and that
the first section's copy is fully visible at rest on load and the last section's CTA
is fully visible at the very bottom.

---

## Gotchas (hard-won)

- **Everything floats one storey up** → a custom prop's geometry does not stand on
  `y = 0`. `ExtrudeGeometry` + `rotateX(-π/2)` leaves the mesh spanning
  `[-bevel, h-bevel]`, so it needs a `+bevel` lift, not an `h` one. Symptom is
  distinctive: buildings hover and their windows sit on the ground beneath them.
- **The dive ends staring at a wall** → a tall mass is in the approach corridor
  (local +Z). Move it to negative z. The engine will back the camera off to make it
  *visible*, but it cannot make a bad composition into a good shot.
- **A scene faces the wrong way** → you rotated it with `scene.rotate` to "point at
  the camera". Don't; the engine already faces every scene at its own incoming
  camera. `scene.rotate` is an *additional* offset and should almost always be 0.
- **`focus` / `camera` overrides land somewhere unexpected** → they are **scene-local
  and rotate with the scene**, like props. They are not world coordinates.
- **Bare specifier error for `three`** → you vendored `three.module.js` without
  `three.core.js` next to it, or the importmap path is wrong. Both files, same dir.
- **The world renders but will not scroll (frozen on the first scene)** → the page
  is inside an app shell whose inner `<main>` scrolls while the window does not.
  Scroll events do not bubble, so a window listener never fires. The engine
  auto-detects the nearest scrollable ancestor; pass `scroller` (element or
  selector) if detection picks the wrong one. **`setProgress()` still works in this
  state, so a QA run that only calls `setProgress()` reports all-green on a page
  that is completely frozen in a browser** — that is what `scrollDrive` in
  `qa.mjs` exists to catch. Check `scrollDrive.cameraMoved > 0`.
- **Nothing renders in CI / headless** → missing SwiftShader flags (Step 6).
- **Modules fail over `file://`** → serve over HTTP. This is not fixable with flags.
- **Hero copy is invisible on landing / CTA fades out at the bottom** → the first and
  last sections need fade windows that are fully open at u=0 and u=1 respectively;
  the shared window leaves them at ~5%. The engine handles this — if you port the
  overlay into a framework, port that special case with it.
- **Copy unreadable over a light scene** → the scrim is a `::before` on the copy
  block so it fades *with* the copy. Do not replace it with a `text-shadow`; over a
  pale sky that does nothing.
- **Scenes crowd each other on screen** → raise `gap`, or lower `turn` so the
  serpentine does not fold a later island into the current frame.
- **The fly-over shows empty sky** → the apex is too high or aimed at the midpoint.
  It should aim mostly at the *next* island; that is what makes the transition sell
  the world instead of interrupting it.
- **The world reshuffles between builds** → you changed `seed`, or you are calling
  `ctx.rng()` a different number of times (e.g. you added a prop before a `scatter`).
  Scatter positions are a function of call order; pin `seed` and expect layout to
  shift when you reorder props.
- **Frame rate drops on a phone** → too many `lamp` props with `cast: true`. Each is
  a real point light. Two or three per scene, not ten.
- **Shadows look coarse in a big world** → they are already following the camera
  (the shadow frustum retargets per frame around the look-at point). If it is still
  bad, the island radius is very large; reduce it rather than raising the map size.

---

## References

- `references/world-engine.js` — the engine: layout, camera spline, scroll→time
  mapping with `scroll`/`linger`, copy overlay, route rail, clearance walk-back,
  reduced-motion and phone handling. Config surface documented in its header.
- `references/kit.js` — every prop builder, documented at its definition, plus the
  palette/material/geometry caching context.
- `references/index-template.html` — minimal standalone page to start from.
- `references/example-world.html` — a complete, QA-verified five-scene world.
- `references/qa.mjs` — the headless verification harness from Step 6.
