import type { CanvasState, ShapeMeta, ShapeRender } from "../types";
import { CANVAS_H, CANVAS_W } from "../types";
import { pointsToPathPx } from "../engine/path";

export const spiralMeta: ShapeMeta = {
  id: "spiral",
  name: "Spiral",
  category: "Spiral",
  blurb: "Text walks an Archimedean spiral at constant linear velocity.",
  math: "An Archimedean spiral grows linearly with the angle. A taper exponent reshapes growth (>1 flares outward, <1 packs the center denser).",
  formula: "r = a + b · θ^k",
  defaults: {
    turns: 5.5,
    pitch: 22,
    inner: 14,
    startAngle: 0,
    taper: 1,
    direction: 1,
  },
  params: [
    { key: "turns", label: "Turns", min: 1, max: 12, step: 0.25 },
    { key: "pitch", label: "Pitch", min: 8, max: 40, step: 1, unit: "px" },
    { key: "inner", label: "Inner radius", min: 6, max: 80, step: 1, unit: "px" },
    { key: "startAngle", label: "Start angle", min: 0, max: 360, step: 1, unit: "°" },
    { key: "taper", label: "Taper", min: 0.5, max: 2, step: 0.05 },
    { key: "direction", label: "Direction", min: -1, max: 1, step: 2 },
  ],
};

export function renderSpiral(state: CanvasState): ShapeRender {
  const p = { ...spiralMeta.defaults, ...state.shapeParams.spiral };
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2;
  const turns = p.turns!;
  const pitch = p.pitch ?? p.gap ?? 22; // back-compat with old "gap" key
  const b = pitch / (Math.PI * 2);
  const a = p.inner!;
  const startAngle = ((p.startAngle ?? 0) * Math.PI) / 180;
  const taper = p.taper ?? 1;
  const direction = (p.direction! >= 0 ? 1 : -1) as 1 | -1;

  const samples = 600;
  const totalTheta = turns * Math.PI * 2;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const theta = direction === 1 ? t * totalTheta : (1 - t) * totalTheta;
    // Taper reshapes the radial growth: k=1 = pure Archimedean.
    const r = a + b * Math.pow(Math.max(theta, 0), taper);
    const phi = theta + startAngle;
    pts.push([cx + r * Math.cos(phi), cy + r * Math.sin(phi)]);
  }
  const d = pointsToPathPx(pts);

  return {
    paths: [{ id: "spiral-path", d, fontScale: 1, opacity: 1 }],
  };
}
