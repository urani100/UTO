# UTO — Text Shape Studio

A precision typographic design studio. Type prose, pick from ten parametric shapes (Spiral, Fibonacci, Echo, Heart, Star, Sun, Moon, Bird, Cello, Mongolfière), tune parameters in a right-side inspector, and export clean SVG / PNG.

## Stack

- React + Vite + TypeScript (strict)
- Tailwind v4 + shadcn/ui (already in `src/components/ui/`)
- wouter (single route at `/`)
- framer-motion (panel transitions, shape morph)
- lucide-react (iconography)
- simplex-noise (Perlin-style jitter)
- No backend — entirely client-side, exports happen in the browser

## Project layout

```
artifacts/uto/
├── index.html                         # Title, fonts (Inter, EB Garamond, Cormorant, Playfair, Space Grotesk, JetBrains Mono)
├── public/favicon.svg
└── src/
    ├── main.tsx                       # Entry
    ├── App.tsx                        # Wouter route → /pages/Studio
    ├── index.css                      # UTO palette: sage / aubergine / hot-pink / parchment
    ├── pages/
    │   └── Studio.tsx                 # The whole editor
    ├── components/editor/
    │   ├── Logo.tsx                   # UtoMark + UtoWordmark
    │   ├── Toolbar.tsx                # Top bar (52px) — undo/redo, randomize, presets, export
    │   ├── LeftRail.tsx               # FORM rail — 10 shape icons
    │   ├── Canvas.tsx                 # 900×560 SVG artboard, debounced 50ms
    │   ├── RightInspector.tsx         # TONE inspector — text/shape/composition/color
    │   ├── InspectorSection.tsx       # Collapsible section
    │   ├── SliderInput.tsx            # Slider + numeric input pair (per spec)
    │   ├── MathPanel.tsx              # "Behind the curve" slide-over
    │   └── StatusStrip.tsx            # Bottom status bar
    ├── hooks/
    │   └── useUndoable.ts             # Undo/redo stack (~60 steps, with coalescing)
    └── lib/
        ├── types.ts                   # ShapeId, CanvasState, ShapeRender, CANVAS_W/H
        ├── initialState.ts            # Default state = Cathedral preset
        ├── presets.ts                 # Cathedral, Atrium, Lullaby, Field Notes, Manifesto, Aubade, Solstice, Murmuration
        ├── randomize.ts               # Random params + shape cycle
        ├── export.ts                  # SVG / PNG / clipboard export
        ├── engine/
        │   ├── path.ts                # Archimedean spiral, smoothPath, arc length
        │   ├── text.ts                # Case, fillToLength, shape-aware wrap
        │   └── noise.ts               # Simplex-noise sampler
        └── shapes/
            ├── index.ts               # Shape registry + renderShape
            ├── spiral.ts              # Archimedean (path-following)
            ├── fibonacci.ts           # Concentric rings × φ⁻ⁿ
            ├── echo.ts                # Nested arcs with stagger
            ├── heart.ts               # Cardioid (path-following)
            ├── star.ts                # Star polyline
            ├── sun.ts                 # Spiral body + radial rays
            ├── moon.ts                # Crescent fill (shape-aware wrap)
            ├── bird.ts                # Bezier wing-strokes
            ├── cello.ts               # Body silhouette fill
            └── mongolfiere.ts         # Balloon bulb + ropes + basket
```

## Design language

- **Palette** — derived from the UTO mark: sage green (U/O), aubergine purple (T), hot pink (the dot), parchment (paper), slate ink. Hot pink is the 10% accent only — used for active states and the export button.
- **Typography** — Inter for chrome, real serifs (EB Garamond / Cormorant Garamond / Georgia / Playfair) for the canvas.
- **Layout** — three-zone Bauhaus: ~68px left rail · canvas · 336px right inspector. 8-pt grid, generous whitespace, `glass` / `glass-strong` utilities for translucent panels.
- **Aesthetic** — Apple pro app meets Bauhaus design manual. The art on the canvas is the protagonist; the chrome is the stagehand.

## Shape engine

- All geometry is computed in pixel space against the fixed 900×560 viewBox so exports stay mathematically precise at any resolution.
- **Path-following shapes** (Spiral, Heart, Star, Echo, Fibonacci, Bird) emit `RenderedPath[]` and the canvas wires each up to `<text><textPath/></text>`. The browser handles arc-length-aware glyph placement.
- **Shape-fill shapes** (Cello, Moon, Mongolfière) compute width per row and emit `RenderedLine[]`.
- **Sun** is a hybrid: a central spiral body + an array of radial rays.
- **Jitter** samples a 2-D simplex noise field via per-glyph `tspan dy`, so neighboring glyphs flow rather than scatter.
- **Render is debounced 50 ms** so dragging sliders never janks the canvas.

## Keyboard shortcuts

- `⌘Z` / `⌘⇧Z` — undo / redo
- `R` — randomize
- `E` — export SVG
- `[` / `]` — cycle shapes
- `Space` — toggle grid

## User preferences

- No emojis anywhere in the UI.

## Notable conventions

- Every slider has a paired numeric input field (per spec).
- The canvas opens already alive with the Cathedral preset (Dickinson + Spiral) — never an empty placeholder.
- Project name in the toolbar is editable inline.
- Math panel ("Behind the curve") explains each shape's formula in plain language.
