import type { CanvasState, ShapeMeta, ShapeRender, RenderedPath } from "../types";
import { CANVAS_H, CANVAS_W } from "../types";

export const birdMeta: ShapeMeta = {
  id: "bird",
  name: "Bird",
  category: "Organic",
  blurb: "Long sweeping bezier curves sketch a bird in flight. Each wing-stroke carries text along its arc.",
  math: "Each wing-stroke is a cubic Bézier curve. Smooth interpolation by De Casteljau's algorithm keeps glyph spacing even on tight bends.",
  formula: "B(t) = (1−t)³P₀ + 3(1−t)²t P₁ + 3(1−t)t² P₂ + t³ P₃",
  defaults: { wingSpread: 1, strokes: 9, taper: 0.6, rotation: 0 },
  params: [
    { key: "wingSpread", label: "Wing spread", min: 0.6, max: 1.4, step: 0.02 },
    { key: "strokes", label: "Strokes", min: 4, max: 16, step: 1 },
    { key: "taper", label: "Taper", min: 0.2, max: 1, step: 0.02 },
    { key: "rotation", label: "Rotation", min: -180, max: 180, step: 1, unit: "°" },
  ],
};

export function renderBird(state: CanvasState): ShapeRender {
  const p = { ...birdMeta.defaults, ...state.shapeParams.bird };
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2 + 20;
  const spread = p.wingSpread!;
  const strokes = Math.max(2, Math.round(p.strokes!));
  const taper = p.taper!;
  const rotRad = ((p.rotation ?? 0) * Math.PI) / 180;
  const cosR = Math.cos(rotRad);
  const sinR = Math.sin(rotRad);

  const rot = (x: number, y: number): [number, number] => {
    const dx = x - cx;
    const dy = y - cy;
    return [cx + dx * cosR - dy * sinR, cy + dx * sinR + dy * cosR];
  };

  const paths: RenderedPath[] = [];
  for (let i = 0; i < strokes; i++) {
    const t = i / Math.max(1, strokes - 1); // 0 = top wing, 1 = bottom
    const length = 360 * spread * (1 - 0.3 * t * taper);
    const [sx, sy] = rot(cx - length * 0.55, cy - 90 + t * 30);
    const [ex, ey] = rot(cx + length * 0.4, cy - 110 + t * 220 * taper);
    const [c1x, c1y] = rot(cx - length * 0.15, cy - 90 + t * 30 + 20 - t * 80);
    const [c2x, c2y] = rot(cx + length * 0.05, cy - 110 + t * 220 * taper - 40 + t * 30);
    const d = `M ${sx.toFixed(1)} ${sy.toFixed(1)} C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${ex.toFixed(1)} ${ey.toFixed(1)}`;
    const mid = 1 - Math.abs(t - 0.5) * 1.4;
    paths.push({
      id: `bird-${i}`,
      d,
      fontScale: Math.max(0.3, 0.7 + mid * 0.45),
      opacity: Math.max(0.3, 0.55 + mid * 0.45),
    });
  }
  return { paths };
}
