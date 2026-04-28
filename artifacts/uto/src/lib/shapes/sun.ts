import type { CanvasState, ShapeMeta, ShapeRender, RenderedRay } from "../types";
import { CANVAS_H, CANVAS_W } from "../types";
import { archimedeanSpiral } from "../engine/path";
import { tokenize } from "../engine/text";

export const sunMeta: ShapeMeta = {
  id: "sun",
  name: "Sun",
  category: "Field",
  blurb: "A central spiral of body text radiates into rays. Each ray is a vector originating from the center.",
  math: "Rays are angle-distributed around the center. Each ray's direction is θᵢ = 2π·i/N, with `spread` adding rotational offset.",
  formula: "θᵢ = (i / N)·2π",
  defaults: { rays: 18, rayLength: 170, innerRadius: 110, spiralTurns: 3, spread: 0 },
  params: [
    { key: "rays", label: "Rays", min: 6, max: 36, step: 1 },
    { key: "innerRadius", label: "Body radius", min: 60, max: 180, step: 2, unit: "px" },
    { key: "rayLength", label: "Ray length", min: 60, max: 240, step: 2, unit: "px" },
    { key: "spiralTurns", label: "Body turns", min: 1.5, max: 6, step: 0.25 },
    { key: "spread", label: "Spread", min: 0, max: 30, step: 1, unit: "°" },
  ],
};

export function renderSun(state: CanvasState): ShapeRender {
  const p = { ...sunMeta.defaults, ...state.shapeParams.sun };
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2;
  const rays = Math.max(4, Math.round(p.rays!));
  const inner = p.innerRadius!;
  const len = p.rayLength!;
  const turns = p.spiralTurns!;
  const spread = (p.spread! * Math.PI) / 180;

  // Body: tight inward spiral.
  const b = inner / (turns * Math.PI * 2);
  const bodyD = archimedeanSpiral({ cx, cy, a: 4, b, turns, direction: 1, samples: 480 });

  // Rays: split text by words; assign one word per ray, repeat as needed.
  const words = tokenize(state.text);
  const corpus = words.length ? words : ["—"];
  const renderedRays: RenderedRay[] = [];
  for (let i = 0; i < rays; i++) {
    const baseAngle = (i / rays) * Math.PI * 2 - Math.PI / 2;
    const angle = baseAngle + (i % 2 === 0 ? spread : -spread);
    renderedRays.push({
      id: `sun-ray-${i}`,
      cx,
      cy,
      angle,
      length: len,
      text: (corpus[i % corpus.length] ?? "•").toUpperCase(),
      fontScale: 0.55 + (i % 3) * 0.06,
    });
  }

  return {
    paths: [{ id: "sun-body", d: bodyD, fontScale: 0.95, opacity: 1 }],
    rays: renderedRays,
  };
}
