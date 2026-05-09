import type { CanvasState, ShapeMeta, ShapeRender, RenderedLine } from "../types";
import { CANVAS_H, CANVAS_W } from "../types";
import { approxCharWidth, tokenize, wrapWords } from "../engine/text";
import { smoothPathPx } from "../engine/path";

export const celloMeta: ShapeMeta = {
  id: "cello",
  name: "Cello",
  category: "Organic",
  blurb: "Text wraps a vertical cello silhouette. Each row's width follows the body — narrow at the waist, full at the bouts.",
  math: "Body width is a smooth function of vertical position — narrow at the waist (≈ 60%) and wider at the upper and lower bouts.",
  formula: "w(y) = base · profile(y)",
  defaults: { bodyWidth: 220, neckLength: 120, waist: 0.6 },
  params: [
    { key: "bodyWidth", label: "Body width", min: 140, max: 280, step: 2, unit: "px" },
    { key: "neckLength", label: "Neck", min: 60, max: 180, step: 2, unit: "px" },
    { key: "waist", label: "Waist", min: 0.45, max: 0.85, step: 0.01 },
  ],
};

/**
 * Cello body profile — half-width at normalized y in [0, 1] (0 = top of body, 1 = bottom).
 * Two lobes (upper bout, lower bout) meet at a narrow waist.
 */
function celloHalfWidth(yNorm: number, baseHalf: number, waist: number): number {
  // Two gaussians: upper bout at y=0.25, lower bout at y=0.78 (slightly larger).
  const upper = Math.exp(-Math.pow((yNorm - 0.25) / 0.22, 2)) * 0.95;
  const lower = Math.exp(-Math.pow((yNorm - 0.78) / 0.24, 2)) * 1.0;
  const env = Math.max(upper, lower) * (1 - waist) + waist * Math.exp(-Math.pow((yNorm - 0.5) / 0.45, 2));
  return baseHalf * env;
}

export function renderCello(state: CanvasState): ShapeRender {
  const p = { ...celloMeta.defaults, ...state.shapeParams.cello };
  const cx = CANVAS_W / 2;
  const baseHalf = p.bodyWidth! / 2;
  const neck = p.neckLength!;
  const waist = p.waist!;
  const fontSize = state.fontSize;
  const cw = approxCharWidth(fontSize);
  const lh = fontSize * 1.18;

  const bodyTop = 80 + neck * 0.4;
  const bodyBottom = CANVAS_H - 30;
  const bodyH = bodyBottom - bodyTop;

  // Build silhouette guide.
  const guidePts: Array<[number, number]> = [];
  // neck top (scroll)
  const scrollTop = bodyTop - neck;
  guidePts.push([cx - 14, scrollTop + 4]);
  guidePts.push([cx - 8, scrollTop + 14]);
  guidePts.push([cx - 12, bodyTop - 4]);
  for (let i = 0; i <= 40; i++) {
    const yN = i / 40;
    const half = celloHalfWidth(yN, baseHalf, waist);
    guidePts.push([cx - half, bodyTop + yN * bodyH]);
  }
  for (let i = 40; i >= 0; i--) {
    const yN = i / 40;
    const half = celloHalfWidth(yN, baseHalf, waist);
    guidePts.push([cx + half, bodyTop + yN * bodyH]);
  }
  guidePts.push([cx + 12, bodyTop - 4]);
  guidePts.push([cx + 8, scrollTop + 14]);
  guidePts.push([cx + 14, scrollTop + 4]);
  const guide = smoothPathPx(guidePts, true, 0.55);

  // Place text inside the body.
  // Pre-repeat words so short prose fills every row regardless of length.
  const rawWords = tokenize(state.text || "Begin with a sentence.");
  const words = Array.from(
    { length: Math.ceil(300 / Math.max(1, rawWords.length)) },
    () => rawWords,
  ).flat();
  const lines: RenderedLine[] = [];

  // First, a few words running up the neck like fingerings.
  const neckLines = Math.max(1, Math.floor(neck / lh));
  let wordIdx = 0;
  for (let i = 0; i < neckLines; i++) {
    const w = words[wordIdx]!;
    lines.push({
      text: w,
      x: cx,
      y: scrollTop + 18 + i * lh * 0.85,
      width: 30,
      fontScale: 0.6,
    });
    wordIdx += 1;
  }

  // Body lines.
  for (let y = bodyTop + lh; y <= bodyBottom - 2; y += lh) {
    const yN = (y - bodyTop) / bodyH;
    const half = celloHalfWidth(yN, baseHalf, waist) - 8;
    const width = Math.max(20, half * 2);
    if (width < cw * 1.2) continue;
    const remaining = words.slice(wordIdx);
    const wrapped = wrapWords(remaining, width, cw);
    if (!wrapped.length) break;
    const first = wrapped[0]!;
    lines.push({
      text: first,
      x: cx,
      y,
      width,
      fontScale: 1,
    });
    wordIdx += first.split(/\s+/).length;
  }

  return { guide, lines };
}
