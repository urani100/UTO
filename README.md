What it is: A typographic art studio. You type or paste prose, wrap it around one of 10 parametric shapes, fine-tune it, and export clean SVG/PNG artwork. The text is the artwork — it flows along mathematical curves rather than sitting in ordinary lines.

The 10 shapes: Spiral, Fibonacci, Echo, Heart, Star, Sun, Moon, Bird, Cello, and Mongolfière (hot-air balloon) — each with its own tunable parameters.

What you can do:

Shape it: pick a form; each has its own sliders (turns, radius, points, etc.)
Style the type: 7 fonts (Garamond, Cormorant, Playfair, Inter, Space Grotesk, JetBrains Mono, Georgia), size, weight, tracking, case, italic
Compose: rotation, scale, offset, and organic "jitter" driven by simplex noise
Color: ink and paper pickers, plus a transparent-background mode
Save & revisit: name compositions into a personal Library (load/delete), gated behind Clerk sign-in
Export: SVG, copy-to-clipboard, or PNG at 1×/2×/4×
Undo/redo (~60 steps), light/dark theme, keyboard shortcuts, and a "Behind the Curve" panel explaining each shape's math

The look: Warm parchment background, slate ink, sage-green as the action color, with hot pink reserved as a rare accent — an "Apple pro app meets Bauhaus" aesthetic where the chrome stays quiet and the artwork leads.

Under the hood: React + Vite + TypeScript, Tailwind v4 + shadcn/ui, live 900×560 SVG canvas, with an Express + Postgres backend for saved works. It also ships as a native iOS/Android app via Capacitor.
