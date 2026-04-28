import type { CanvasState, ShapeId } from "./types";
import { SHAPE_META } from "./shapes";

const PALETTES: Array<{ fg: string; bg: string }> = [
  { fg: "#1c1824", bg: "#eeece7" },
  { fg: "#2d1f3d", bg: "#fbf6ec" },
  { fg: "#3a1640", bg: "#f0eadb" },
  { fg: "#1c1824", bg: "#eee7d4" },
  { fg: "#0f1a1a", bg: "#f3eee2" },
  { fg: "#42234e", bg: "#eeece7" },
];

const FONTS = [
  '"EB Garamond", Georgia, serif',
  '"Cormorant Garamond", Georgia, serif',
  'Georgia, serif',
  '"Playfair Display", serif',
  '"Space Grotesk", "Inter", sans-serif',
  '"Inter", sans-serif',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomBetween(min: number, max: number, step: number): number {
  const range = (max - min) / step;
  const n = Math.floor(Math.random() * (range + 1));
  return min + n * step;
}

export function randomizeState(prev: CanvasState): CanvasState {
  const meta = SHAPE_META[prev.shape];
  const params = { ...prev.shapeParams[prev.shape] };
  for (const p of meta.params) {
    params[p.key] = randomBetween(p.min, p.max, p.step);
  }
  const palette = pick(PALETTES);
  return {
    ...prev,
    shapeParams: { ...prev.shapeParams, [prev.shape]: params },
    fontFamily: pick(FONTS),
    fontSize: randomBetween(11, 20, 1),
    italic: Math.random() < 0.35,
    weight: pick([400, 500, 600, 700]) as number,
    letterSpacing: randomBetween(0, 1.2, 0.1),
    textColor: palette.fg,
    backgroundColor: palette.bg,
    jitter: Math.random() < 0.4 ? randomBetween(0, 6, 0.5) : 0,
  };
}

export function nextShape(current: ShapeId, dir: 1 | -1): ShapeId {
  const ids = Object.keys(SHAPE_META) as ShapeId[];
  const i = ids.indexOf(current);
  return ids[(i + dir + ids.length) % ids.length]!;
}
