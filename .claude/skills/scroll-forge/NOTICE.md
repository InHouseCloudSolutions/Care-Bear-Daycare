# Attribution

**scroll-forge** is an independent implementation, but it is openly derivative in
concept and it should say so.

The idea of a landing page where scroll drives a camera continuously from outside
one scene into it and on to the next — plus the interview → story-beats →
scrub-engine workflow shape, and the `sections` / `scroll` / `linger` pacing
vocabulary — come from **[scroll-world](https://github.com/oso95/scroll-world)** by
cyw, MIT licensed. The pacing vocabulary is kept deliberately identical so that
knowledge transfers between the two in either direction.

Everything under `references/` is original work. The difference is architectural:

| | scroll-world | scroll-forge |
|---|---|---|
| Camera flight | pre-rendered clips from a generative video service | rendered live in WebGL from a declarative spec |
| Requires | a Higgsfield subscription, or Codex CLI on a ChatGPT plan | nothing |
| Cost per build | image + video generation credits, plus re-rolls | zero |
| Seams | must be frame-identical; the dominant failure mode | structurally impossible — one camera, one spline, one scene graph |
| Payload | multi-megabyte video per scene | ~200 KB of geometry for a whole world |
| Iteration | minutes per clip, re-render to change anything | instant; it is a config file |
| Look | photoreal / AI-illustrated | stylised procedural clay diorama |

Neither strictly dominates: if the goal is photoreal AI-generated scenery, the
generative pipeline is the one that produces it. scroll-forge exists for everyone
who wants the *effect* without the subscription, the credit budget, or the
seam-matching problem.

## Third-party runtime dependency

- **three.js** — MIT License, Copyright © 2010-2026 three.js authors.
  Vendored locally by design; the published page makes no network requests.
