import type { CanvasState, ShapeMeta, ShapeRender, RenderedLine } from "../types";
import { CANVAS_H, CANVAS_W } from "../types";
import { approxCharWidth, tokenize, wrapWords } from "../engine/text";
import { smoothPathPx } from "../engine/path";

export const mongolfiereMeta: ShapeMeta = {
  id: "mongolfiere",
  name: "Mongolfière",
  category: "Organic",
  blurb: "Text fills the bulb of a hot-air balloon. Hand-drawn ropes drop to a small basket below.",
  math: "The bulb is a teardrop: a circle merged with a tapered cone. Ropes are line segments dropped from points along the bulb's lower hemisphere to the basket's corners.",
  formula: "bulb = circle ∪ taper",
  defaults: { bulbWidth: 220, ropeCount: 6, basketWidth: 80 },
  params: [
    { key: "bulbWidth", label: "Bulb width", min: 140, max: 280, step: 2, unit: "px" },
    { key: "ropeCount", label: "Ropes", min: 4, max: 12, step: 1 },
    { key: "basketWidth", label: "Basket", min: 50, max: 140, step: 2, unit: "px" },
  ],
};

export function renderMongolfiere(state: CanvasState): ShapeRender {
  const p = { ...mongolfiereMeta.defaults, ...state.shapeParams.mongolfiere };
  const cx = CANVAS_W / 2;
  const bulbW = p.bulbWidth!;
  const bulbR = bulbW / 2;
  const bulbCY = 50 + bulbR;
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

  // Basket geometry.
  const basketW = p.basketWidth!;
  const basketH = basketW * 0.55;
  const basketTopY = bulbBottomY + 70;
  const basketLeft = cx - basketW / 2;
  const basketRight = cx + basketW / 2;
  const basketBottom = basketTopY + basketH;

  const ropes = Math.max(2, Math.round(p.ropeCount!));
  let decoration = "";
  for (let i = 0; i < ropes; i++) {
    const t = ropes === 1 ? 0.5 : i / (ropes - 1);
    const fromX = cx + (t - 0.5) * bulbR * 1.05;
    const fromY = bulbBottomY - 4;
    const toX = basketLeft + t * basketW;
    const toY = basketTopY + 2;
    decoration += `M ${fromX.toFixed(1)} ${fromY.toFixed(1)} L ${toX.toFixed(1)} ${toY.toFixed(1)} `;
  }
  // Basket itself
  decoration += `M ${basketLeft} ${basketTopY} L ${basketRight} ${basketTopY} L ${basketRight - basketW * 0.07} ${basketBottom} L ${basketLeft + basketW * 0.07} ${basketBottom} Z`;

  // Fill bulb with text by row.
  const words = tokenize(state.text);
  const lines: RenderedLine[] = [];
  let wordIdx = 0;

  for (let y = bulbCY - bulbR + lh; y <= bulbBottomY - lh * 0.5; y += lh) {
    if (wordIdx >= words.length) break;
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

  // Basket text — last few words echo at smaller scale.
  if (wordIdx < words.length) {
    const tailWords = words.slice(wordIdx).slice(0, 6);
    const tail = tailWords.join(" ");
    lines.push({
      text: tail,
      x: cx,
      y: basketTopY + basketH * 0.65,
      width: basketW - 8,
      fontScale: 0.55,
    });
  }

  return { guide: smoothPathPx(bulbPts, true, 0.45), decoration, lines };
}
