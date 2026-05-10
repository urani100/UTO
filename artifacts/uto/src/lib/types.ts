export type ShapeId =
  | "spiral"
  | "fibonacci"
  | "echo"
  | "heart"
  | "star"
  | "sun"
  | "moon"
  | "bird"
  | "cello"
  | "mongolfiere";

export type ShapeCategory = "Spiral" | "Geometric" | "Organic" | "Field";

export interface ShapeMeta {
  id: ShapeId;
  name: string;
  category: ShapeCategory;
  blurb: string;
  math: string;
  formula: string;
  defaults: Record<string, number>;
  params: ShapeParam[];
  /** Optional canvas-level state overrides applied when this shape is selected. */
  canvasDefaults?: Partial<Pick<CanvasState, "jitter" | "jitterScale" | "fontSize" | "letterSpacing">>;
}

export interface ShapeParam {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
  /** When present, the inspector renders a segmented toggle group instead of a slider. */
  options?: Array<{ value: number; label: string; aria?: string }>;
}

export interface CanvasState {
  shape: ShapeId;
  text: string;
  fontFamily: string;
  fontSize: number;
  weight: number;
  italic: boolean;
  letterSpacing: number;
  lineHeight: number;
  textCase: "as-is" | "upper" | "lower" | "title";
  textColor: string;
  backgroundColor: string;
  backgroundMode: "solid" | "transparent";
  rotation: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  jitter: number;
  jitterScale: number;
  showGuide: boolean;
  showGrid: boolean;
  shapeParams: Record<ShapeId, Record<string, number>>;
}

export interface RenderedPath {
  id: string;
  d: string;
  fontScale: number;
  opacity: number;
  side?: "left" | "right";
  /**
   * Optional per-path text-fill policy. When omitted, the renderer applies
   * the legacy heuristic (preserves the historical visual). Shapes opt in to
   * the measured engine by setting this. See `lib/engine/measure.ts`.
   */
  policy?: import("./engine/measure").FillPolicy;
  /**
   * Pre-computed arc length in pixels. When provided, Canvas.tsx uses this
   * instead of legacyApproxLen so fill policies (especially fit-once) receive
   * an accurate path length. Shapes that sample their own point arrays can
   * compute this cheaply via arcLengthPx() before building the d string.
   */
  arcLen?: number;
  /**
   * Character offset into the source text where this path's fill should begin.
   * Allows adjacent paths (e.g. Bird feathers) to start at different positions
   * so they don't all repeat the same words.
   */
  textOffset?: number;
}

export interface RenderedRay {
  id: string;
  cx: number;
  cy: number;
  angle: number;
  length: number;
  /** Distance from (cx, cy) at which the ray's text begins. Defaults to 10. */
  startRadius?: number;
  text: string;
  fontScale: number;
}

export interface RenderedLine {
  text: string;
  x: number;
  y: number;
  width: number;
  fontScale: number;
  /** SVG textAnchor for the line. Defaults to "middle". */
  anchor?: "start" | "middle" | "end";
  /** Rotation in degrees applied around (x, y). */
  rotation?: number;
}

export interface ShapeRender {
  /** Outline guide path (faint silhouette) */
  guide?: string;
  /** Sequential textPath targets */
  paths?: RenderedPath[];
  /** Radial rays (Sun) */
  rays?: RenderedRay[];
  /** Pre-wrapped lines (Cello, Moon, Mongolfière) */
  lines?: RenderedLine[];
  /** Optional decorative geometry rendered behind text (e.g. Mongolfière basket / ropes) */
  decoration?: string;
}

export const CANVAS_W = 900;
export const CANVAS_H = 560;
