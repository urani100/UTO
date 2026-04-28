import type { CanvasState, ShapeMeta, ShapeRender, RenderedLine } from "../types";
import { CANVAS_H, CANVAS_W } from "../types";
import { approxCharWidth, tokenize, wrapWords } from "../engine/text";

export const moonMeta: ShapeMeta = {
  id: "moon",
  name: "Moon",
  category: "Organic",
  blurb: "Text fills a true crescent — flowing continuously through the moon's silhouette.",
  math: "Crescent = outer disk minus a horizontally offset inner disk. Each row's visible band is the outer chord clipped by the inner chord; the whole composition can be tilted.",
  formula: "xc = (R² − Rᵢ² + d²) / 2d",
  defaults: {
    radius: 220,
    phase: 0.55,
    curvature: 1,
    crescentDir: 1,
    tilt: 0,
    wrap: 1,
    alignment: 1,
    lineHeight: 1.05,
    padding: 6,
  },
  params: [
    { key: "radius", label: "Radius", min: 140, max: 280, step: 2, unit: "px" },
    { key: "phase", label: "Phase", min: 0.05, max: 0.95, step: 0.01 },
    { key: "curvature", label: "Curvature", min: 0.7, max: 1.4, step: 0.02 },
    {
      key: "crescentDir",
      label: "Direction",
      min: -1,
      max: 1,
      step: 2,
      options: [
        { value: 1, label: "☾", aria: "Bulge on left" },
        { value: -1, label: "☽", aria: "Bulge on right" },
      ],
    },
    { key: "tilt", label: "Tilt", min: -90, max: 90, step: 1, unit: "°" },
    {
      key: "wrap",
      label: "Wrap",
      min: 0,
      max: 1,
      step: 1,
      options: [
        { value: 0, label: "Word", aria: "Wrap on word boundaries" },
        { value: 1, label: "Flow", aria: "Continuous character flow" },
      ],
    },
    {
      key: "alignment",
      label: "Alignment",
      min: 0,
      max: 2,
      step: 1,
      options: [
        { value: 0, label: "Outer", aria: "Hug the outer curved edge" },
        { value: 1, label: "Center", aria: "Center each row" },
        { value: 2, label: "Inner", aria: "Hug the inner concave edge" },
      ],
    },
    { key: "lineHeight", label: "Line height", min: 0.95, max: 1.6, step: 0.02 },
    { key: "padding", label: "Padding", min: 0, max: 20, step: 1, unit: "px" },
  ],
};

export function renderMoon(state: CanvasState): ShapeRender {
  const raw = { ...moonMeta.defaults, ...state.shapeParams.moon };
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2;
  const R = raw.radius!;
  const phase = Math.max(0.01, Math.min(0.99, raw.phase!));
  const curvature = Math.max(0.1, raw.curvature ?? 1);
  const Ri = R * curvature;
  const dir = (raw.crescentDir ?? 1) >= 0 ? 1 : -1;
  // Horizontal offset of inner cutout in local frame.
  // dir +1 (bulge LEFT, bite RIGHT) → dx > 0; dir -1 mirrors.
  const dx = dir * phase * R;
  const tiltDeg = raw.tilt ?? 0;
  const tiltRad = (tiltDeg * Math.PI) / 180;
  const cos = Math.cos(tiltRad);
  const sin = Math.sin(tiltRad);
  const wrapMode = (raw.wrap ?? 1) >= 0.5 ? "flow" : "word";
  const align = Math.round(raw.alignment ?? 1);
  const padding = Math.max(0, raw.padding ?? 6);
  const fontSize = state.fontSize;
  const cw = approxCharWidth(fontSize);
  const lh = fontSize * (raw.lineHeight ?? 1.05);

  // Local-frame (origin at moon center, +x right, +y down) → canvas frame.
  const toCanvas = (lx: number, ly: number) => ({
    x: cx + lx * cos - ly * sin,
    y: cy + lx * sin + ly * cos,
  });

  // ── Guide path ────────────────────────────────────────────────
  // Cusps live where the two circles intersect.
  // For circles centered at (0,0) R and (dx, 0) Ri:  xc = (R² − Rᵢ² + dx²) / 2dx
  let guide = "";
  const valid =
    Math.abs(dx) > 1e-3 &&
    Math.abs(R - Ri) < Math.abs(dx) &&
    Math.abs(dx) < R + Ri;
  if (valid) {
    const xc = (R * R - Ri * Ri + dx * dx) / (2 * dx);
    const yc = Math.sqrt(Math.max(0, R * R - xc * xc));
    const top = toCanvas(xc, -yc);
    const bot = toCanvas(xc, yc);
    // For dir +1 the crescent bulges LEFT: outer arc takes the long way around the left,
    // and the inner arc returns counter-clockwise (also through the left).
    // For dir -1 both flip to clockwise.
    const sweep = dir === 1 ? 0 : 1;
    guide =
      `M ${top.x.toFixed(2)} ${top.y.toFixed(2)} ` +
      `A ${R} ${R} 0 1 ${sweep} ${bot.x.toFixed(2)} ${bot.y.toFixed(2)} ` +
      `A ${Ri} ${Ri} 0 0 ${sweep} ${top.x.toFixed(2)} ${top.y.toFixed(2)} Z`;
  } else {
    // Degenerate: fall back to outer disk so the user still sees a guide.
    const top = toCanvas(0, -R);
    const bot = toCanvas(0, R);
    guide =
      `M ${top.x.toFixed(2)} ${top.y.toFixed(2)} ` +
      `A ${R} ${R} 0 1 0 ${bot.x.toFixed(2)} ${bot.y.toFixed(2)} ` +
      `A ${R} ${R} 0 1 0 ${top.x.toFixed(2)} ${top.y.toFixed(2)} Z`;
  }

  const lines: RenderedLine[] = [];
  const fullText = state.text;
  if (!fullText.trim()) return { guide, lines };

  // ── Build rows in local frame ─────────────────────────────────
  type Row = { y: number; left: number; right: number; width: number };
  const rows: Row[] = [];
  for (let y = -R + lh / 2; y <= R - lh / 2; y += lh) {
    const outerH = Math.sqrt(Math.max(0, R * R - y * y));
    if (outerH <= 1) continue;
    const innerHsq = Ri * Ri - y * y;
    const innerH = innerHsq > 0 ? Math.sqrt(innerHsq) : null;
    let left: number;
    let right: number;
    if (dir === 1) {
      left = -outerH + padding;
      right =
        innerH !== null
          ? Math.min(outerH, dx - innerH) - padding
          : outerH - padding;
    } else {
      left =
        innerH !== null
          ? Math.max(-outerH, dx + innerH) + padding
          : -outerH + padding;
      right = outerH - padding;
    }
    const width = right - left;
    if (width > cw * 1.2) {
      rows.push({ y, left, right, width });
    }
  }

  // ── Fill rows with prose, looping when exhausted ──────────────
  if (wrapMode === "flow") {
    // Continuous character stream — collapse internal whitespace.
    const flat = fullText.replace(/\s+/g, " ").trim();
    if (flat.length === 0) return { guide, lines };
    let cursor = 0;
    for (const row of rows) {
      const charsForRow = Math.max(1, Math.floor(row.width / cw));
      let segment = "";
      while (segment.length < charsForRow) {
        const need = charsForRow - segment.length;
        const available = flat.length - cursor;
        if (available <= 0) {
          cursor = 0;
          if (segment.length > 0 && !segment.endsWith(" ")) segment += " ";
          continue;
        }
        const take = Math.min(need, available);
        segment += flat.slice(cursor, cursor + take);
        cursor += take;
      }
      pushLine(row, segment);
    }
  } else {
    const words = tokenize(fullText);
    if (!words.length) return { guide, lines };
    let wordIdx = 0;
    for (const row of rows) {
      // Build a buffer of looped words long enough to overflow the row.
      const buffer: string[] = [];
      for (let i = 0; i < words.length * 2; i++) {
        buffer.push(words[(wordIdx + i) % words.length]!);
      }
      const wrapped = wrapWords(buffer, row.width, cw);
      const first = wrapped[0] ?? "";
      pushLine(row, first);
      const consumed = first ? first.split(/\s+/).filter(Boolean).length : 1;
      wordIdx = (wordIdx + consumed) % words.length;
    }
  }

  function pushLine(row: Row, text: string) {
    let lx: number;
    let anchor: "start" | "middle" | "end";
    if (align === 0) {
      // Outer = bulge side.
      if (dir === 1) {
        lx = row.left;
        anchor = "start";
      } else {
        lx = row.right;
        anchor = "end";
      }
    } else if (align === 2) {
      // Inner = bite side.
      if (dir === 1) {
        lx = row.right;
        anchor = "end";
      } else {
        lx = row.left;
        anchor = "start";
      }
    } else {
      lx = (row.left + row.right) / 2;
      anchor = "middle";
    }
    const pos = toCanvas(lx, row.y);
    lines.push({
      text,
      x: pos.x,
      y: pos.y,
      width: row.width,
      fontScale: 1,
      anchor,
      ...(tiltDeg !== 0 ? { rotation: tiltDeg } : {}),
    });
  }

  return { guide, lines };
}
