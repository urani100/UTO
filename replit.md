# UTO — Text Shape Studio

A precision typographic design studio. Type prose, pick from ten parametric shapes (Spiral, Fibonacci, Echo, Heart, Star, Sun, Moon, Bird, Cello, Mongolfière), tune parameters in a right-side inspector, and export clean SVG / PNG.

## Stack

- React + Vite + TypeScript (strict)
- Tailwind v4 + shadcn/ui (already in `src/components/ui/`)
- wouter (routes: `/`, `/sign-in/*?`, `/sign-up/*?`)
- framer-motion (panel transitions, shape morph)
- lucide-react (iconography)
- simplex-noise (Perlin-style jitter)
- @clerk/react for auth (Google + Apple + GitHub once enabled in the Auth pane)
- @tanstack/react-query + generated `@workspace/api-client-react` hooks
- Backend: `artifacts/api-server` (Express + @clerk/express) talking to Postgres via `lib/db` (drizzle). Two tables: `users` (Clerk id ↔ profile) and `works` (jsonb canvas state).

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
    │   ├── Studio.tsx                 # The whole editor — owns save/dirty state
    │   ├── SignInPage.tsx             # Branded Clerk SignIn at /sign-in
    │   └── SignUpPage.tsx             # Branded Clerk SignUp at /sign-up
    ├── components/editor/
    │   ├── Logo.tsx                   # UtoMark + UtoWordmark
    │   ├── Toolbar.tsx                # Top bar — Library · Save · Export · AccountChip
    │   ├── SaveControls.tsx           # Save button + status pill (dirty/saving/saved + ⌘S hint)
    │   ├── AccountChip.tsx            # Sign-in CTA → UserButton when signed in
    │   ├── LibrarySheet.tsx           # Right-side sheet — list/load/delete saved works
    │   ├── LeftRail.tsx               # FORM rail — 10 shape icons
    │   ├── Canvas.tsx                 # 900×560 SVG artboard, debounced 50ms
    │   ├── RightInspector.tsx         # TONE inspector — text/shape/composition/color
    │   ├── InspectorSection.tsx       # Collapsible section
    │   ├── SliderInput.tsx            # Slider + numeric input pair (per spec)
    │   ├── MathPanel.tsx              # "Behind the curve" slide-over
    │   └── StatusStrip.tsx            # Bottom status bar
    ├── hooks/
    │   └── useUndoable.ts             # Undo/redo stack (~60 steps, with coalescing + replace())
    └── lib/
        ├── clerkAppearance.ts         # Aubergine-on-parchment Clerk theme
        ├── queryClient.ts             # Shared TanStack QueryClient
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
- `⌘S` / `Ctrl-S` — save (gates anonymous users to /sign-in)
- `R` — randomize
- `E` — export SVG
- `[` / `]` — cycle shapes
- `Space` — toggle grid

## Auth + persistence

- Soft auth gate: anonymous users can edit freely. Saving (button or `⌘S`) AND exporting (SVG / Copy SVG / PNG) both redirect anonymous users to `/sign-in`. Library is hidden until they sign in.
- Two split gates in `Studio.tsx`:
  - `requireAuthForApi` — used by save. Lets clicks through during the brief Clerk hydration window because the API enforces auth on its end.
  - `requireAuthForExport` — used by exports. Exports run entirely client-side, so this gate must wait for `clerkLoaded` before deciding; while loading it shows a "Checking session…" toast and aborts.
- Cookie-based Clerk session (same-origin via the workspace proxy). Never call `setAuthTokenGetter` — web is cookie-auth only.
- Save flow uses a `useRef` mutex to prevent duplicate creates from rapid double-fires, and falls back from `PUT /api/works/:id` 404 to `POST /api/works` when the loaded work was deleted from another surface.
- First save of a piece (or any save when the toolbar name is empty / "Untitled") opens a `SaveDialog` modal that requires a real name; subsequent saves are silent with a small "Saved" toast. Changing the Form clears the saved-work id so the next save creates a new library entry.
- Dirty-state signature normalizes the work name (trim + fallback to "Untitled") so trailing whitespace doesn't get the user stuck in a permanent dirty state.
- API server CORS: explicit allowlist of `REPLIT_DEV_DOMAIN` + `REPLIT_DOMAINS` (no wildcard reflection while sending credentials).
- Clerk sign-in/up appearance: minimal — only `colorPrimary` (sage) and `fontFamily` (EB Garamond) at the global level, plus `headerTitle` / `headerSubtitle` styled to Inter / 15px / 12px / `#716e6e` / letter-spacing 1.10px / weight 500.

## Theme toggle

- The moon icon in the toolbar is a single action that does two things in one undoable step: it toggles the `dark` class on `html` (drives the chrome) **and** swaps `state.textColor` ↔ `state.backgroundColor` on the canvas, so the artwork tracks the chrome. ⌘Z reverts the color swap (the `dark` class stays on, but a second click of the toggle returns to light).

## Responsive / mobile

- `useIsMobile()` (`<768px`) drives a single branch in `Studio.tsx` and `Toolbar.tsx`. Initial value is read synchronously from `matchMedia` so phones never see a desktop-layout flash on first paint.
- Mobile shell (`< 768px`):
  - **Top bar** — compact `MobileToolbar` (logo + name input + Save + `⋯` overflow). The overflow menu holds Undo, Redo, Library, Export submenu (SVG / Copy / PNG @1×/2×/4×), theme toggle, and the AccountChip.
  - **Canvas** — fills the viewport; padding is `px-3 py-3` instead of the desktop `px-12 py-10`.
  - **Right inspector** — hidden in the layout flow; rendered inside a bottom Sheet at `h-[78vh]` via `<RightInspector embedded />` (the `embedded` prop drops the desktop `aside` chrome — no fixed width, no left border).
  - **Bottom bar** — 56px nav with two large tap targets: `Form` (opens a bottom Sheet with the 2-col shape grid) and `Settings` (opens the inspector sheet). The Form button shows the current shape name.
  - **Status strip** — hidden on mobile (its info is in the inspector header).
  - **Library sheet** — `w-full sm:w-[400px]` so it covers the full width on phones.
- Desktop layout (`≥768px`) is unchanged.

## Client-side hardening

- `useDisableInspection` in `App.tsx` blocks `contextmenu` and the common DevTools shortcuts (F12, Ctrl/Cmd+U, Ctrl/Cmd+Shift+I/J/C, Ctrl/Cmd+S). This is a deterrent against casual inspection only — it does NOT prevent a determined user from opening DevTools via the browser menu, viewing network traffic, or reading the publicly-served bundle. Treat anything shipped to the client as public.

## User preferences

- No emojis anywhere in the UI.

## Notable conventions

- Every slider has a paired numeric input field (per spec).
- The canvas opens already alive with the Cathedral preset (Dickinson + Spiral) — never an empty placeholder.
- Project name in the toolbar is editable inline.
- Math panel ("Behind the curve") explains each shape's formula in plain language.

## Engine + tests

- The typography engine lives in `src/lib/engine/` (`path.ts`, `text.ts`, `noise.ts`, `measure.ts`) and has no React dependency. See `ARCHITECTURE.md` for the layered design and the per-`RenderedPath` `FillPolicy` model (`legacy` / `repeat-measured` / `fit-once`). Default policy is `legacy`, which preserves bit-identical output for every existing shape; new shapes opt in to the measured engine without affecting others.
- `measure.ts` exposes both the legacy heuristics (`legacyApproxLen`, `legacyAvgCharPx`) and industry-standard browser measurement (`measurePathLengthPx` via `getTotalLength`, `measureAvgCharAdvancePx` via `getComputedTextLength`).
- Vitest + jsdom unit tests live under `src/lib/engine/__tests__/`. Run with `pnpm --filter @workspace/uto run test` (watch) or `test:run` (CI). Engine modules should keep their coverage high — they are pure.
