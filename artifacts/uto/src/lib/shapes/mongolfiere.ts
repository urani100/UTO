import type { CanvasState, ShapeMeta, ShapeRender, RenderedLine } from "../types";
import { CANVAS_H, CANVAS_W } from "../types";
import { approxCharWidth, tokenize, wrapWords } from "../engine/text";
import { smoothPathPx } from "../engine/path";

export const mongolfiereMeta: ShapeMeta = {
  id: "mongolfiere",
  name: "Mongolfière",
  category: "Organic",
  blurb: "Text fills the bulb of a hot-air balloon.",
  math: "The bulb is a teardrop: a circle merged with a tapered cone. Lines wrap to the silhouette's width at each row.",
  formula: "bulb = circle ∪ taper",
  defaults: { bulbWidth: 220 },
  params: [
    { key: "bulbWidth", label: "Bulb width", min: 140, max: 280, step: 2, unit: "px" },
  ],
};

export function renderMongolfiere(state: CanvasState): ShapeRender {
  const p = { ...mongolfiereMeta.defaults, ...state.shapeParams.mongolfiere };
  const cx = CANVAS_W / 2;
  const bulbW = p.bulbWidth!;
  const bulbR = bulbW / 2;
  const bulbBottomOffset = bulbR * 1.05;
  const totalH = bulbR + bulbBottomOffset;
  const bulbCY = (CANVAS_H - totalH) / 2 + bulbR;
  const fontSize = state.fontSize;
  const cw = approxCharWidth(fontSize);
  const lh = fontSize * 1.15;

  // Bulb silhouette: circle on top, tapered bottom.
  const bulbBottomY = bulbCY + bulbR * 1.05;
  const bulbPts: Array<[number, number]> = [];
  for (let i = 0; i <= 40; i++) {
    const a = Math.PI - (i / 40) * Math.PI;
    bulbPts.push([cx + bulbR * Math.cos(a), bulbCY - bulbR * Math.sin(a)]);
  }
  // Right side taper down.
  bulbPts.push([cx + bulbR * 0.55, bulbBottomY]);
  bulbPts.push([cx - bulbR * 0.55, bulbBottomY]);
  // Left side taper up via smooth close (loop back to start).
  for (let i = 40; i >= 0; i--) {
    const a = Math.PI + (i / 40) * Math.PI;
    bulbPts.push([cx + bulbR * Math.cos(a), bulbCY - bulbR * Math.sin(a)]);
  }

  // Fill bulb with text by row.
  // Pre-repeat words so short prose fills every row regardless of length.
  const rawWords = tokenize(state.text || "Begin with a sentence.");
  const words = Array.from(
    { length: Math.ceil(300 / Math.max(1, rawWords.length)) },
    () => rawWords,
  ).flat();
  const lines: RenderedLine[] = [];
  let wordIdx = 0;

  for (let y = bulbCY - bulbR + lh; y <= bulbBottomY - lh * 0.5; y += lh) {
    let half: number;
    if (y <= bulbCY) {
      // Upper hemisphere
      const dy = bulbCY - y;
      half = Math.sqrt(Math.max(0, bulbR * bulbR - dy * dy)) - 10;
    } else {
      // Tapered lower part
      const t = (y - bulbCY) / (bulbBottomY - bulbCY);
      half = bulbR * (1 - 0.45 * t) - 10;
    }
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

  return { guide: smoothPathPx(bulbPts, true, 0.45), decoration: "", lines };
}
