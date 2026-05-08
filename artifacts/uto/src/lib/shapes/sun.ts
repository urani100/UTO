import type { CanvasState, ShapeMeta, ShapeRender, RenderedRay } from "../types";
import { CANVAS_H, CANVAS_W } from "../types";
import { archimedeanSpiral } from "../engine/path";
import { tokenize } from "../engine/text";

export const sunMeta: ShapeMeta = {
  id: "sun",
  name: "Sun",
  category: "Field",
  blurb: "A central spiral of prose, ringed by radiating phrases — each ray carries a fragment of your text outward.",
  math: "Body is an Archimedean spiral. Rays are angle-distributed vectors starting at body radius + gap. Each ray carries a sequential slice of the prose, length and angle gently jittered by a seeded hash for an organic feel.",
  formula: "θᵢ = (i / N)·2π + jitter(i)",
  defaults: {
    rays: 18,
    body: 110,
    bodyTurns: 3,
    bodyDirection: -1,
    wordsPerRay: 4,
    rayLength: 140,
    rayLengthJitter: 0.25,
    angleJitter: 6,
    rayGap: 12,
  },
  params: [
    { key: "rays", label: "Rays", min: 6, max: 36, step: 1 },
    { key: "body", label: "Body radius", min: 60, max: 180, step: 2, unit: "px" },
    { key: "bodyTurns", label: "Body turns", min: 1.5, max: 6, step: 0.25 },
    { key: "bodyDirection", label: "Body direction", min: -1, max: 1, step: 2, options: [
      { value: -1, label: "↺", aria: "Counter-clockwise" },
      { value: 1, label: "↻", aria: "Clockwise" },
    ]},
    { key: "wordsPerRay", label: "Words per ray", min: 1, max: 8, step: 1 },
    { key: "rayLength", label: "Ray length", min: 60, max: 240, step: 2, unit: "px" },
    { key: "rayLengthJitter", label: "Length variance", min: 0, max: 1, step: 0.05 },
    { key: "angleJitter", label: "Angle jitter", min: 0, max: 20, step: 1, unit: "°" },
    { key: "rayGap", label: "Ray gap", min: 0, max: 40, step: 1, unit: "px" },
  ],
};

// Stable per-index pseudo-random in [0, 1). Same i always returns the same value.
function hash01(i: number, salt: number): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function renderSun(state: CanvasState): ShapeRender {
  // Back-compat: pull old keys if present.
  const raw = { ...sunMeta.defaults, ...state.shapeParams.sun };
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2;
  const rays = Math.max(4, Math.round(raw.rays!));
  const body = raw.body ?? raw.innerRadius ?? 110;
  const bodyTurns = raw.bodyTurns ?? raw.spiralTurns ?? 3;
  const bodyDir = (raw.bodyDirection ?? -1) >= 0 ? 1 : -1;
  const wordsPerRay = Math.max(1, Math.round(raw.wordsPerRay ?? 4));
  const rayLen = raw.rayLength ?? 140;
  const lenJitter = Math.max(0, Math.min(1, raw.rayLengthJitter ?? 0.25));
  const angleJitterDeg = raw.angleJitter ?? raw.spread ?? 6;
  const rayGap = raw.rayGap ?? 12;

  // Body: Archimedean spiral. Direction +1 spirals outward, -1 spirals inward toward the center.
  // Inner radius is clamped so the innermost loop has enough circumference for legible glyphs;
  // otherwise the first turn collapses to a tight knot of overlapping letters.
  const innerMin = Math.max(18, state.fontSize * 1.4);
  const a = Math.min(innerMin, body * 0.5);
  const b = Math.max(0.5, (body - a) / (bodyTurns * Math.PI * 2));
  const bodyD = archimedeanSpiral({
    cx,
    cy,
    a,
    b,
    turns: bodyTurns,
    direction: bodyDir as 1 | -1,
    samples: 480,
  });

  // Rays: split prose into sequential phrases of `wordsPerRay` words each.
  const words = tokenize(state.text);
  const corpus = words.length ? words : ["—"];
  const renderedRays: RenderedRay[] = [];
  for (let i = 0; i < rays; i++) {
    // Stable jitter values for this ray.
    const jAngle = (hash01(i, 1) - 0.5) * 2 * angleJitterDeg; // ± angleJitterDeg
    const jLen = 1 + (hash01(i, 2) - 0.5) * 2 * lenJitter; // 1 ± lenJitter
    // Pull `wordsPerRay` consecutive words starting at i*wordsPerRay (cycles through corpus).
    const start = (i * wordsPerRay) % corpus.length;
    const phrase: string[] = [];
    for (let w = 0; w < wordsPerRay; w++) {
      phrase.push(corpus[(start + w) % corpus.length]!);
    }
    const baseAngle = (i / rays) * Math.PI * 2 - Math.PI / 2;
    const angle = baseAngle + (jAngle * Math.PI) / 180;
    renderedRays.push({
      id: `sun-ray-${i}`,
      cx,
      cy,
      angle,
      length: Math.max(20, rayLen * jLen),
      startRadius: body + rayGap,
      text: phrase.join(" "),
      fontScale: 0.6 + hash01(i, 3) * 0.2, // 0.6–0.8, stable
    });
  }

  return {
    paths: [{ id: "sun-body", d: bodyD, fontScale: 0.95, opacity: 1 }],
    rays: renderedRays,
  };
}
