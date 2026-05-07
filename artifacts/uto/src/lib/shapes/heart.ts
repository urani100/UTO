import type { CanvasState, ShapeMeta, ShapeRender } from "../types";
import { CANVAS_H, CANVAS_W } from "../types";
import { arcLengthPx, smoothPathPx } from "../engine/path";

export const heartMeta: ShapeMeta = {
  id: "heart",
  name: "Heart",
  category: "Organic",
  blurb: "A cardioid traced from a true parametric heart curve. SVG places each glyph along the arc.",
  math: "Glyphs follow the cardioid curve. Browsers handle tangential alignment by rotating each character to the path's normal.",
  formula: "x = 16 sin³ t,  y = 13 cos t − 5 cos 2t − 2 cos 3t − cos 4t",
  defaults: { amplitude: 1, direction: 1, startAngle: 90 },
  params: [
    { key: "amplitude", label: "Scale", min: 0.6, max: 1.4, step: 0.02 },
    { key: "direction", label: "Direction", min: -1, max: 1, step: 2 },
    { key: "startAngle", label: "Start", min: 0, max: 360, step: 5, unit: "°" },
  ],
};

export function renderHeart(state: CanvasState): ShapeRender {
  const p = { ...heartMeta.defaults, ...state.shapeParams.heart };
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2 + 10;
  const amp = p.amplitude! * 13;
  const direction = p.direction! >= 0 ? 1 : -1;
  const startRad = (p.startAngle! * Math.PI) / 180;

  // The cardioid has a cusp at t=0 (and t=2π). Walking the full 0..2π and closing the path
  // forces the head and tail of the textPath to meet at the cusp, where the tangent is undefined
  // — glyphs collide head-to-tail. Skip a small angle on each end so the path is open and there
  // is a clean breathing gap at the top cleavage.
  const samples = 480;
  const gap = 0.18; // radians (~10°) — angular gap at the cusp
  const span = Math.PI * 2 - gap * 2;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= samples; i++) {
    const tt = i / samples;
    const t = startRad + direction * (gap + tt * span);
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    pts.push([cx + x * amp, cy - y * amp]);
  }
  const d = smoothPathPx(pts, false, 0.5);
  const pathLen = arcLengthPx(pts);
  return {
    guide: d,
    paths: [
      {
        id: "heart-path",
        d,
        fontScale: 1,
        opacity: 1,
        pathLen,
        // Closed single-lap silhouette → under-fill so the tail never crowds the head.
        fillRatio: 0.95,
      },
    ],
  };
}
