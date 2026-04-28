import type { CanvasState } from "./types";
import { buildDefaultShapeParams } from "./shapes";
import { applyPreset, PRESETS } from "./presets";

export const BASE_STATE: CanvasState = {
  shape: "spiral",
  text: "",
  fontFamily: '"EB Garamond", Georgia, serif',
  fontSize: 14,
  weight: 500,
  italic: false,
  letterSpacing: 0.2,
  lineHeight: 1.2,
  textCase: "as-is",
  textColor: "#1c1824",
  backgroundColor: "#f6f1e7",
  backgroundMode: "solid",
  rotation: 0,
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  jitter: 0,
  jitterScale: 0.04,
  showGuide: false,
  showGrid: false,
  shapeParams: buildDefaultShapeParams(),
};

// Default state = "Cathedral" preset applied so the canvas opens already alive.
export const INITIAL_STATE: CanvasState = applyPreset(BASE_STATE, PRESETS[0]!);
