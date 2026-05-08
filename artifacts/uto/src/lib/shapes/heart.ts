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
  defaults: { amplitude: 1, direction: 1, startAngle: 90, aspect: 1 },
  params: [
    { key: "amplitude", label: "Scale", min: 0.6, max: 1.4, step: 0.02 },
    { key: "aspect", label: "Aspect", min: 0.5, max: 2, step: 0.02 },
    { key: "direction", label: "Direction", min: -1, max: 1, step: 2, options: [
      { value: -1, label: "↺", aria: "Counter-clockwise" },
      { value: 1, label: "↻", aria: "Clockwise" },
    ]},
    { key: "startAngle", label: "Start", min: 0, max: 360, step: 5, unit: "°" },
  ],
};

export function renderHeart(state: CanvasState): ShapeRender {
  const p = { ...heartMeta.defaults, ...state.shapeParams.heart };
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2 + 10;
  const amp = p.amplitude! * 13;
  const aspect = p.aspect ?? 1;
  const direction = p.direction! >= 0 ? 1 : -1;
  const startRad = (p.startAngle! * Math.PI) / 180;

  const samples = 480;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= samples; i++) {
    const tt = i / samples;
    const t = startRad + direction * tt * Math.PI * 2;
    const s = Math.sin(t);
    const c = Math.cos(t);
    const c2 = c * c;
    const cos2t = 2 * c2 - 1;
    const cos3t = c * (4 * c2 - 3);
    const cos4t = 2 * cos2t * cos2t - 1;
    const x = 16 * s * s * s;
    const y = 13 * c - 5 * cos2t - 2 * cos3t - cos4t;
    pts.push([cx + x * amp * aspect, cy - y * amp]);
  }
  const arcLen = arcLengthPx(pts);
  const d = smoothPathPx(pts, true, 0.5);
  return {
    guide: d,
    paths: [{ id: "heart-path", d, fontScale: 1, opacity: 1, arcLen, policy: { kind: "fit-once", underfill: 0.95 } }],
  };
}
