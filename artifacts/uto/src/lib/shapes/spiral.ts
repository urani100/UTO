import type { CanvasState, ShapeMeta, ShapeRender } from "../types";
import { CANVAS_H, CANVAS_W } from "../types";
import { archimedeanSpiral } from "../engine/path";

export const spiralMeta: ShapeMeta = {
  id: "spiral",
  name: "Spiral",
  category: "Spiral",
  blurb: "Text walks an Archimedean spiral at constant linear velocity.",
  math: "An Archimedean spiral grows linearly with the angle. We re-parameterize by arc length so the text doesn't sprint as it travels outward.",
  formula: "r = a + b·θ",
  defaults: { turns: 5.5, gap: 22, inner: 14, direction: 1 },
  params: [
    { key: "turns", label: "Turns", min: 1, max: 12, step: 0.25 },
    { key: "gap", label: "Gap", min: 8, max: 40, step: 1, unit: "px" },
    { key: "inner", label: "Inner radius", min: 0, max: 80, step: 1, unit: "px" },
    { key: "direction", label: "Direction", min: -1, max: 1, step: 2 },
  ],
};

export function renderSpiral(state: CanvasState): ShapeRender {
  const p = { ...spiralMeta.defaults, ...state.shapeParams.spiral };
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2;
  const turns = p.turns!;
  const b = (p.gap! ?? 22) / (Math.PI * 2);
  const a = p.inner!;
  const direction = (p.direction! >= 0 ? 1 : -1) as 1 | -1;
  const d = archimedeanSpiral({ cx, cy, a, b, turns, direction });

  // Faint guide circle for visual reference.
  const r = a + b * turns * Math.PI * 2;
  const guide = `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy}`;

  return {
    guide,
    paths: [{ id: "spiral-path", d, fontScale: 1, opacity: 1 }],
  };
}
