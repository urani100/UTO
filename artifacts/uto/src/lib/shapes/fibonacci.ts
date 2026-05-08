import type { CanvasState, ShapeMeta, ShapeRender, RenderedPath } from "../types";
import { CANVAS_H, CANVAS_W } from "../types";

const PHI = (1 + Math.sqrt(5)) / 2;

export const fibonacciMeta: ShapeMeta = {
  id: "fibonacci",
  name: "Fibonacci",
  category: "Spiral",
  blurb: "Concentric rings whose radii follow the golden ratio. Font size and opacity recede toward the center.",
  math: "Each ring's radius shrinks by the golden ratio φ. Font size and opacity recede with distance from origin to suggest natural growth.",
  formula: "rₙ = R · φ⁻ⁿ",
  defaults: { rings: 5, baseRadius: 230, gap: 6, scaleIntensity: 1 },
  params: [
    { key: "rings", label: "Rings", min: 3, max: 9, step: 1 },
    { key: "baseRadius", label: "Base radius", min: 120, max: 270, step: 4, unit: "px" },
    { key: "gap", label: "Ring gap", min: 0, max: 18, step: 1, unit: "px" },
    { key: "scaleIntensity", label: "φ scaling", min: 0.4, max: 1.4, step: 0.05 },
  ],
};

export function renderFibonacci(state: CanvasState): ShapeRender {
  const p = { ...fibonacciMeta.defaults, ...state.shapeParams.fibonacci };
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2;
  const rings = Math.max(2, Math.round(p.rings!));
  const base = p.baseRadius!;
  const gap = p.gap!;
  const intensity = p.scaleIntensity!;

  const paths: RenderedPath[] = [];
  for (let i = 0; i < rings; i++) {
    const shrink = Math.pow(PHI, -i * intensity);
    const r = base * shrink - i * gap;
    if (r < 14) continue;
    // Full circle as a textPath: M (cx-r) cy A r r 0 1 0 (cx+r) cy A r r 0 1 0 (cx-r) cy
    const d = `M ${cx - r} ${cy} A ${r} ${r} 0 1 ${i % 2 === 0 ? 1 : 0} ${cx + r} ${cy} A ${r} ${r} 0 1 ${i % 2 === 0 ? 1 : 0} ${cx - r} ${cy}`;
    paths.push({
      id: `fib-${i}`,
      d,
      fontScale: shrink * 1.05,
      opacity: 0.35 + 0.65 * shrink,
      arcLen: 2 * Math.PI * r,
      policy: { kind: "repeat-measured" },
    });
  }
  return { paths };
}
