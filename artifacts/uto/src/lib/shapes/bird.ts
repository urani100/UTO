import type { CanvasState, ShapeMeta, ShapeRender, RenderedPath } from "../types";
import { CANVAS_H, CANVAS_W } from "../types";

export const birdMeta: ShapeMeta = {
  id: "bird",
  name: "Birds",
  category: "Organic",
  blurb: "Long sweeping bezier curves sketch a bird in flight. Each wing-stroke carries text along its arc.",
  math: "Each wing-stroke is a cubic Bézier curve. Smooth interpolation by De Casteljau's algorithm keeps glyph spacing even on tight bends.",
  formula: "B(t) = (1−t)³P₀ + 3(1−t)²t P₁ + 3(1−t)t² P₂ + t³ P₃",
  defaults: { wingSpread: 1.40, strokes: 9, taper: 0.6 },
  canvasDefaults: { jitter: 2.6 },
  params: [
    { key: "wingSpread", label: "Wing spread", min: 0.6, max: 2.5, step: 0.02 },
    { key: "strokes", label: "Strokes", min: 4, max: 16, step: 1 },
    { key: "taper", label: "Taper", min: 0.2, max: 1, step: 0.02 },
  ],
};

/** Numerically integrate arc length of a cubic Bézier using 50 chord samples. */
function bezierArcLen(
  x0: number, y0: number,
  x1: number, y1: number,
  x2: number, y2: number,
  x3: number, y3: number,
  steps = 50,
): number {
  let len = 0;
  let px = x0, py = y0;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;
    const nx = mt * mt * mt * x0 + 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t * x3;
    const ny = mt * mt * mt * y0 + 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t * y3;
    len += Math.hypot(nx - px, ny - py);
    px = nx; py = ny;
  }
  return len;
}

export function renderBird(state: CanvasState): ShapeRender {
  const p = { ...birdMeta.defaults, ...state.shapeParams.bird };
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2 + 20;
  const spread = p.wingSpread!;
  const strokes = Math.max(2, Math.round(p.strokes!));
  const taper = p.taper!;

  const paths: RenderedPath[] = [];
  // Body axis pivot — bird points to the right.
  for (let i = 0; i < strokes; i++) {
    const t = i / Math.max(1, strokes - 1); // 0 = top wing, 1 = bottom
    const length = 560 * spread * (1 - 0.3 * t * taper);
    const startX = cx - length * 0.55;
    const startY = cy - 90 + t * 30;
    const endX = cx + length * 0.4;
    const endY = cy - 110 + t * 220 * taper;
    const c1x = cx - length * 0.15;
    const c1y = startY + 20 - t * 80;
    const c2x = cx + length * 0.05;
    const c2y = endY - 40 + t * 30;
    const d = `M ${startX.toFixed(1)} ${startY.toFixed(1)} C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${endX.toFixed(1)} ${endY.toFixed(1)}`;
    const arcLen = bezierArcLen(startX, startY, c1x, c1y, c2x, c2y, endX, endY);
    // Stagger the starting word per stroke so adjacent feathers don't repeat identically.
    const textOffset = Math.round(i * 17);
    paths.push({
      id: `bird-${i}`,
      d,
      arcLen,
      textOffset,
      policy: { kind: "repeat-measured" },
      fontScale: 0.7 + (1 - Math.abs(t - 0.5) * 1.4) * 0.45,
      opacity: 0.55 + (1 - Math.abs(t - 0.5) * 1.4) * 0.45,
    });
  }
  return { paths };
}
