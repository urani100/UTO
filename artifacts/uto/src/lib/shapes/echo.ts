import type { CanvasState, ShapeMeta, ShapeRender, RenderedPath } from "../types";
import { CANVAS_H, CANVAS_W } from "../types";

export const echoMeta: ShapeMeta = {
  id: "echo",
  name: "Echo",
  category: "Spiral",
  blurb: "Nested arcs that fade outward like a sound rippling across still water.",
  math: "Each arc is a sub-segment of a concentric circle, rotated by a stagger so the rings march around the center. Falloff scales font size and opacity ring by ring.",
  formula: "θₙ = θ₀ + n · stagger ;   rₙ = outer − n · spacing",
  defaults: {
    rings: 8,
    arc: 240,
    outer: 240,
    spacing: 28,
    rotation: 180,
    stagger: 18,
    falloff: 0.55,
    fadeDirection: 1,
  },
  params: [
    { key: "rings", label: "Rings", min: 3, max: 14, step: 1 },
    { key: "arc", label: "Arc angle", min: 90, max: 360, step: 5, unit: "°" },
    { key: "outer", label: "Outer radius", min: 140, max: 270, step: 4, unit: "px" },
    { key: "spacing", label: "Ring spacing", min: 10, max: 50, step: 1, unit: "px" },
    { key: "rotation", label: "Rotation", min: 0, max: 360, step: 1, unit: "°" },
    { key: "stagger", label: "Stagger", min: 0, max: 60, step: 1, unit: "°" },
    { key: "falloff", label: "Falloff", min: 0, max: 1, step: 0.01 },
    { key: "fadeDirection", label: "Fade", min: -1, max: 1, step: 2 },
  ],
};

export function renderEcho(state: CanvasState): ShapeRender {
  const p = { ...echoMeta.defaults, ...state.shapeParams.echo };
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2;
  const rings = Math.max(2, Math.round(p.rings!));
  const arcDeg = Math.min(360, p.arc!);
  // back-compat with old "baseRadius"/"gap" keys
  const outer = p.outer ?? p.baseRadius ?? 240;
  const spacing = p.spacing ?? (p.baseRadius != null ? outer / rings + (p.gap ?? 0) : 28);
  const rotation = p.rotation ?? 180;
  const stagger = p.stagger ?? p.offset ?? 18;
  const falloff = Math.max(0, Math.min(1, p.falloff ?? 0.55));
  const fadeOut = (p.fadeDirection ?? 1) >= 0; // true = outer loud, inner quiet

  const paths: RenderedPath[] = [];
  for (let i = 0; i < rings; i++) {
    const r = outer - i * spacing;
    if (r < 18) continue;
    // Arc is centered around `rotation` and fans out by ±arc/2.
    const center = rotation + i * stagger;
    const startDeg = center - arcDeg / 2;
    const endDeg = center + arcDeg / 2;
    const start = polar(cx, cy, r, startDeg);
    const end = polar(cx, cy, r, endDeg);
    const largeArc = arcDeg > 180 ? 1 : 0;
    const d = `M ${start[0].toFixed(2)} ${start[1].toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${end[0].toFixed(2)} ${end[1].toFixed(2)}`;

    // t = 0 at the loud end, 1 at the quiet end.
    const t = fadeOut ? i / Math.max(1, rings - 1) : 1 - i / Math.max(1, rings - 1);
    const fontScale = 1 - falloff * 0.5 * t; // shrink up to half size at the quiet end
    const opacity = 1 - falloff * 0.7 * t;   // fade up to 70% at the quiet end
    paths.push({
      id: `echo-${i}`,
      d,
      fontScale,
      opacity,
    });
  }
  return { paths };
}

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}
