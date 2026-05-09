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
  defaults: { rings: 5, baseRadius: 230, gap: 6 },
  params: [
    { key: "rings", label: "Rings", min: 3, max: 9, step: 1 },
    { key: "baseRadius", label: "Base radius", min: 120, max: 270, step: 4, unit: "px" },
    { key: "gap", label: "Ring gap", min: 0, max: 18, step: 1, unit: "px" },
  ],
};

export function renderFibonacci(state: CanvasState): ShapeRender {
  const p = { ...fibonacciMeta.defaults, ...state.shapeParams.fibonacci };
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2;
  const rings = Math.max(2, Math.round(p.rings!));
  const base = p.baseRadius!;
  const gap = p.gap!;
  // Compute the largest φ-exponent that keeps every ring above minRadius.
  // Solves: base × φ^(−(n−1) × intensity) − (n−1) × gap ≥ minRadius
  // ⟹  intensity ≤ ln(base / (minRadius + (n−1)×gap)) / ((n−1) × ln φ)
  // Capped at 1 so the true golden ratio is used whenever it fits.
  const minRadius = 18;
  const safeIntensity =
    rings > 1
      ? Math.log(base / (minRadius + 2 + (rings - 1) * gap)) /
        ((rings - 1) * Math.log(PHI))
      : 1;
  const intensity = Math.min(1, Math.max(0.1, safeIntensity));

  const paths: RenderedPath[] = [];
  for (let i = 0; i < rings; i++) {
    const shrink = Math.pow(PHI, -i * intensity);
    const r = base * shrink - i * gap;
    if (r < minRadius) continue; // safety net; intensity formula prevents this
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
