# UTO Architecture

This document is for engineers maintaining the typography studio. It explains the layered design, the rendering pipeline, and the rules that keep the engine deterministic and testable.

## Layers

```
┌─────────────────────────────────────────────────────┐
│ pages/Studio.tsx                                    │  Owns canvas state, save/dirty, auth gating
├─────────────────────────────────────────────────────┤
│ components/editor/*                                 │  Pure presentation (Toolbar, RightInspector,
│                                                     │  LeftRail, LibrarySheet, MathPanel, …)
│                                                     │  Canvas.tsx wires shape output → SVG
├─────────────────────────────────────────────────────┤
│ lib/engine/                                         │  PURE. No React, no DOM (except measure.ts
│   path.ts, text.ts, noise.ts, measure.ts            │  helpers, which are isolated and null-safe)
├─────────────────────────────────────────────────────┤
│ lib/shapes/<id>.ts × 10                             │  Each shape: pure renderer + metadata
├─────────────────────────────────────────────────────┤
│ lib/types.ts, presets.ts, initialState.ts,          │  Data model + defaults
│ randomize.ts, export.ts                             │
└─────────────────────────────────────────────────────┘
```

**Hard rule:** code in `lib/engine` and `lib/shapes` does **not** import React, hooks, or anything from `components/`. Everything in those folders is pure and unit-testable in jsdom or node.

## State

`CanvasState` (in `lib/types.ts`) is the single source of truth for the canvas. It flows through `useUndoable` (~60-step history with coalescing). The save signature normalizes the work name (trim + "Untitled" fallback) so trailing whitespace doesn't cause a permanent dirty state.

If state grows beyond a few dozen fields, migrate to a slice-based store (Zustand + temporal middleware is the obvious choice). The `useUndoable` API is intentionally narrow so this swap is local.

## Render pipeline

Every frame goes through:

1. **State change** → debounced 50 ms in `Canvas.tsx`.
2. **Shape renderer** (`renderShape(state)` → `ShapeRender`) emits one of three output families:
   - `paths: RenderedPath[]` — text walks an SVG path via `<textPath>`.
   - `lines: RenderedLine[]` — pre-wrapped lines positioned with `x` / `y` (Cello, Moon, Mongolfière).
   - `rays: RenderedRay[]` — radial spokes (Sun).
3. **Text fill** — for `paths`, the engine computes how many characters of prose fit the path and emits the result into `<textPath>`.
4. **SVG emission** — `Canvas.tsx` mounts the resulting elements inside a single `<svg viewBox="0 0 900 560">`.

The entire pipeline is deterministic and viewBox-anchored, so SVG / PNG export at any resolution is mathematically precise.

## Typography engine (`lib/engine/`)

### `path.ts`
SVG `d`-string builders and arc-length helpers. Pure functions over point arrays. The `arcLengthPx(points)` helper is the analytical fallback when a renderer doesn't have the rendered DOM available yet.

### `text.ts`
Case transforms, prose tokenization, fixed-width wrap. **`fillToLength` repeats short prose to a target character count — it does not truncate.** Truncation, when needed, is the responsibility of the fill policy in `measure.ts`.

### `noise.ts`
Simplex noise sampler used for per-glyph jitter via `<tspan dy="…">`.

### `measure.ts`
The decision layer that turns "how much room?" + "how big are the glyphs?" + "what should happen on overflow?" into the actual string fed into `<textPath>`.

Two measurement modes coexist:

| Mode | Path length | Char advance | Use when |
|------|-------------|--------------|----------|
| **Legacy heuristic** | `cmds × 18` | `fontSize × 0.5` | The shape's existing visual is the spec. |
| **Browser-measured** | `SVGPathElement.getTotalLength()` | `SVGTextElement.getComputedTextLength()` | Correctness matters more than the legacy "always over-fill" feel. |

Three fill policies are then layered on top:

| Policy | What it does | Good for |
|--------|--------------|----------|
| `legacy` (default) | Heuristic length × heuristic glyph width × **1.05** over-fill, repeats prose. | Open paths where overflow falls off the end (spiral, bird, …). **Same behavior as before this engine extraction.** |
| `repeat-measured` | Real measurements, prose repeats with `·` separators to fill the path. | When you want spiral-style "fill the whole thing" but with sub-pixel correctness. |
| `fit-once` | Real measurements, prose fits exactly once and is truncated at a word boundary if longer. Optional `underfill` leaves a breathing gap. | Closed single-lap shapes (heart, etc.) where wrap-around causes glyph collisions. |

A renderer opts into a non-default policy by setting `policy` on its `RenderedPath`. The field is wired through `Canvas.tsx` → `buildShapeText({ ..., policy: p.policy })`. **No shape currently sets `policy`, so today's visible output is bit-identical.** Migrating a shape is a localized change to that shape's renderer.

### Defensive guarantees
`computeFilledText` is hardened against pathological inputs:

- `pathLenPx` and `avgCharPx` that are `0`, `NaN`, `Infinity`, or negative fall back to safe defaults (400 px and 7 px respectively — the historical legacy values for the default 14 px font).
- Generated character count is clamped to `CHAR_HARD_CAP = 100_000` to prevent runaway allocations if measurements ever go off the rails.
- `policy.overfill` and `policy.underfill` that are `0`, `NaN`, `Infinity`, or negative fall back to `1.0`.

These guards exist because `getTotalLength()` and `getComputedTextLength()` can return `0` on detached / hidden elements, and we never want a single bad frame to hang the renderer.

### Measuring from React (when adopting `repeat-measured` / `fit-once`)
`SVGPathElement.getTotalLength()` and `SVGTextElement.getComputedTextLength()` require the element to be mounted. The React pattern when wiring a shape to the measured engine:

1. Render `<defs>` with the path; render `<text>` with the legacy heuristic as a first-paint estimate.
2. In `useLayoutEffect`, grab the path via `ref`, call `measurePathLengthPx()`, store in state.
3. Re-render with the measured value via `computeFilledText({ ..., pathLenPx: measured, policy: { kind: "fit-once" } })`.

Two paints, one tick. The 50-ms debounce already absorbs the flash.

The hook is **not yet implemented** in `Canvas.tsx` — it's the next step when the first shape opts in to the measured engine. Don't add it pre-emptively; it's overkill for shapes whose legacy behavior is the spec.

## Shapes (`lib/shapes/`)

Each shape file exports `<shapeId>Meta: ShapeMeta` and `render<Shape>(state): ShapeRender`. They are pure functions and registered in `lib/shapes/index.ts`. To add a new shape:

1. Create `lib/shapes/myshape.ts` with the meta + render function.
2. Add the id to `ShapeId` in `types.ts` and the registry in `shapes/index.ts`.
3. Add a default param object to `initialState.ts` if the shape has params.
4. Add an icon/entry to `LeftRail` (and the `Toolbar` shape dropdown on mobile).

Renderers are unit-testable: hand them a `CanvasState` and assert on the shape of the returned `ShapeRender`.

## Auth + persistence

Cookie-based Clerk sessions through the workspace proxy (same-origin). Two split gates in `Studio.tsx`:

- `requireAuthForApi` — used by save. Lets clicks through during Clerk hydration because the API enforces auth on its end.
- `requireAuthForExport` — used by exports. Exports are entirely client-side, so this gate must wait for `clerkLoaded`.

Save flow uses a `useRef` mutex to prevent duplicate creates from rapid double-fires, and falls back from `PUT /api/works/:id` 404 to `POST /api/works` when the loaded work was deleted from another surface.

## Testing

Unit tests live next to source under `__tests__/` and run via Vitest:

```sh
pnpm --filter @workspace/uto run test       # watch mode
pnpm --filter @workspace/uto run test:run   # single run, CI-style
```

The `engine/` and `shapes/` layers should aim for high coverage because they are pure. UI components are covered by the Playwright-based testing skill (see `.local/skills/testing`).

## Coding rules

- **`lib/engine/` and `lib/shapes/` cannot import React.** If you need DOM measurement, the helper goes in `measure.ts` and is null-safe.
- **No `console.log` in shipped code.** Use the runtime error overlay or temporary `console.warn` only during development.
- **Every slider has a paired numeric input.** This is a brand spec, not a convention.
- **The canvas opens already alive with the Cathedral preset** — never an empty placeholder.
- **No emojis in the UI.**
