import type { CanvasState, ShapeMeta, ShapeRender, RenderedLine } from "../types";
import { CANVAS_H, CANVAS_W } from "../types";
import { approxCharWidth, tokenize, wrapWords } from "../engine/text";

export const moonMeta: ShapeMeta = {
  id: "moon",
  name: "Moon",
  category: "Organic",
  blurb: "Text fills the area inside a crescent. Each row's width follows the moon's silhouette.",
  math: "The crescent is the difference of two circles. We compute the visible band-width per row and shape-wrap text to fit.",
  formula: "wᵢ = √(R² − yᵢ²) − offsetᵢ",
  defaults: { phase: 0.62, radius: 230, lineHeight: 1.2 },
  params: [
    { key: "phase", label: "Phase", min: 0.1, max: 0.95, step: 0.01 },
    { key: "radius", label: "Radius", min: 140, max: 260, step: 2, unit: "px" },
    { key: "lineHeight", label: "Line height", min: 0.95, max: 1.6, step: 0.02 },
  ],
};

export function renderMoon(state: CanvasState): ShapeRender {
  const p = { ...moonMeta.defaults, ...state.shapeParams.moon };
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2;
  const R = p.radius!;
  // Shift inner cutout circle by phase * R (0 = full, 0.95 = thin crescent).
  const offset = R * p.phase!;
  const fontSize = state.fontSize;
  const cw = approxCharWidth(fontSize);
  const lh = fontSize * p.lineHeight!;

  // Outline (left arc of outer circle, right arc of inner circle going up).
  const guide =
    `M ${cx} ${cy - R} ` +
    `A ${R} ${R} 0 1 0 ${cx} ${cy + R} ` +
    `A ${R - offset} ${R - offset} 0 1 1 ${cx} ${cy - R} Z`;

  const lines: RenderedLine[] = [];
  const words = tokenize(state.text);
  if (!words.length) return { guide, lines };

  // Walk rows from top to bottom.
  let wordIdx = 0;
  const rows: Array<{ y: number; left: number; right: number; width: number }> = [];
  for (let y = -R + lh / 2; y <= R - lh / 2; y += lh) {
    const halfOuter = Math.sqrt(Math.max(0, R * R - y * y));
    const halfInner = Math.sqrt(Math.max(0, (R - offset) * (R - offset) - y * y));
    // Crescent on the left of cx: from (cx - halfOuter) to (cx - halfInner)
    const left = cx - halfOuter + 6;
    const right = cx - halfInner - 6;
    const width = right - left;
    if (width > cw * 2) {
      rows.push({ y: cy + y, left, right, width });
    }
  }

  for (const row of rows) {
    if (wordIdx >= words.length) break;
    const remaining = words.slice(wordIdx);
    const wrapped = wrapWords(remaining, row.width, cw);
    if (!wrapped.length) continue;
    const first = wrapped[0]!;
    lines.push({
      text: first,
      x: (row.left + row.right) / 2,
      y: row.y,
      width: row.width,
      fontScale: 1,
    });
    const consumed = first.split(/\s+/).length;
    wordIdx += consumed;
  }

  return { guide, lines };
}
