import type { CanvasState, ShapeMeta, ShapeRender, RenderedPath } from "../types";
import { CANVAS_H, CANVAS_W } from "../types";

export const echoMeta: ShapeMeta = {
  id: "echo",
  name: "Echo",
  category: "Spiral",
  blurb: "Nested arcs that alternate weight and case to suggest a sound rippling outward.",
  math: "Each arc is a sub-segment of a concentric circle, rotated by an offset so the rings stagger like an audio echo.",
  formula: "θₙ = θ₀ + n·Δθ",
  defaults: { rings: 8, arc: 240, baseRadius: 240, offset: 18, gap: 4 },
  params: [
    { key: "rings", label: "Rings", min: 3, max: 14, step: 1 },
    { key: "arc", label: "Arc angle", min: 90, max: 320, step: 5, unit: "°" },
    { key: "baseRadius", label: "Outer radius", min: 140, max: 270, step: 4, unit: "px" },
    { key: "offset", label: "Stagger", min: 0, max: 60, step: 1, unit: "°" },
    { key: "gap", label: "Ring gap", min: 0, max: 30, step: 1, unit: "px" },
  ],
};

export function renderEcho(state: CanvasState): ShapeRender {
  const p = { ...echoMeta.defaults, ...state.shapeParams.echo };
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2 + 20;
  const rings = Math.max(2, Math.round(p.rings!));
  const arcDeg = p.arc!;
  const baseR = p.baseRadius!;
  const offDeg = p.offset!;
  const gap = p.gap!;

  const paths: RenderedPath[] = [];
  for (let i = 0; i < rings; i++) {
    const r = baseR - i * (baseR / rings + gap);
    if (r < 18) continue;
    const startDeg = -arcDeg / 2 + i * offDeg;
    const endDeg = startDeg + arcDeg;
    const start = polar(cx, cy, r, startDeg);
    const end = polar(cx, cy, r, endDeg);
    const largeArc = arcDeg > 180 ? 1 : 0;
    const d = `M ${start[0].toFixed(2)} ${start[1].toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${end[0].toFixed(2)} ${end[1].toFixed(2)}`;
    paths.push({
      id: `echo-${i}`,
      d,
      fontScale: 0.7 + (1 - i / rings) * 0.45,
      opacity: 0.45 + (1 - i / rings) * 0.55,
    });
  }
  return { paths };
}

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}
