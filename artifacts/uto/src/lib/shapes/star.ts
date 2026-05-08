import type { CanvasState, ShapeMeta, ShapeRender } from "../types";
import { CANVAS_H, CANVAS_W } from "../types";
import { pointsToPathPx } from "../engine/path";

export const starMeta: ShapeMeta = {
  id: "star",
  name: "Star",
  category: "Geometric",
  blurb: "Text follows a star polyline. Tighten the inner radius for sharper points, loosen for softer petals.",
  math: "A regular star is the alternation between an outer and inner radius around the same center. Glyphs rotate around each vertex automatically.",
  formula: "(rᵢ, θᵢ) = (R or r, i·π/n)",
  defaults: { points: 5, inner: 0.42, rotation: -90, outer: 220 },
  params: [
    { key: "points", label: "Points", min: 3, max: 14, step: 1 },
    { key: "inner", label: "Inner ratio", min: 0.18, max: 0.85, step: 0.01 },
    { key: "outer", label: "Outer radius", min: 110, max: 270, step: 2, unit: "px" },
    { key: "rotation", label: "Rotation", min: -180, max: 180, step: 1, unit: "°" },
  ],
};

export function renderStar(state: CanvasState): ShapeRender {
  const p = { ...starMeta.defaults, ...state.shapeParams.star };
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2;
  const points = Math.max(3, Math.round(p.points!));
  const outer = p.outer!;
  const inner = outer * p.inner!;
  const rot = (p.rotation! * Math.PI) / 180;

  const verts: Array<[number, number]> = [];
  const total = points * 2;
  for (let i = 0; i <= total; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = rot + (i * Math.PI) / points;
    verts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  const d = pointsToPathPx(verts, true);
  return {
    guide: d,
    paths: [{ id: "star-path", d, fontScale: 1, opacity: 1 }],
  };
}
