import type { CanvasState, ShapeId } from "./types";
import { buildDefaultShapeParams } from "./shapes";

export interface Preset {
  id: string;
  name: string;
  description: string;
  shape: ShapeId;
  text: string;
  fontFamily: string;
  fontSize: number;
  weight: number;
  italic: boolean;
  letterSpacing: number;
  textColor: string;
  backgroundColor: string;
  textCase?: "as-is" | "upper" | "lower" | "title";
  shapeOverrides?: Partial<Record<string, number>>;
  jitter?: number;
}

const DICKINSON =
  "I heard a Fly buzz — when I died — The Stillness in the Room was like the Stillness in the Air — between the Heaves of Storm — The Eyes around — had wrung them dry — and Breaths were gathering firm for that last Onset — when the King be witnessed — in the Room.";

const RILKE =
  "And now we welcome the new year. Full of things that have never been. Be patient toward all that is unsolved in your heart and try to love the questions themselves like locked rooms and like books written in a very foreign tongue.";

const BLAKE =
  "To see a world in a grain of sand and a heaven in a wild flower hold infinity in the palm of your hand and eternity in an hour.";

const NERUDA =
  "I love you as certain dark things are to be loved in secret between the shadow and the soul I love you as the plant that never blooms but carries in itself the light of hidden flowers.";

const WHITMAN =
  "I celebrate myself and sing myself and what I assume you shall assume for every atom belonging to me as good belongs to you. I loaf and invite my soul. I lean and loaf at my ease observing a spear of summer grass.";

const DUNBAR =
  "I know why the caged bird sings ah me when his wing is bruised and his bosom sore when he beats his bars and he would be free it is not a carol of joy or glee but a prayer that he sends from his heart's deep core.";

const TAGORE =
  "Where the mind is without fear and the head is held high where knowledge is free where the world has not been broken up into fragments by narrow domestic walls into that heaven of freedom my Father let my country awake.";

const SAPPHO =
  "Some say cavalry and others claim infantry or a fleet of long oars is the supreme sight on the black earth I say it is the one you love.";

export const PRESETS: Preset[] = [
  {
    id: "cathedral",
    name: "Cathedral",
    description: "A vaulted spiral, Garamond, slate ink on parchment.",
    shape: "spiral",
    text: DICKINSON,
    fontFamily: '"EB Garamond", Georgia, serif',
    fontSize: 14,
    weight: 500,
    italic: false,
    letterSpacing: 0.3,
    textColor: "#1c1824",
    backgroundColor: "#f6f1e7",
    shapeOverrides: { turns: 7, gap: 26, inner: 8 },
  },
  {
    id: "atrium",
    name: "Atrium",
    description: "Concentric Fibonacci rings opening like a dome.",
    shape: "fibonacci",
    text: BLAKE,
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontSize: 18,
    weight: 500,
    italic: true,
    letterSpacing: 0.3,
    textColor: "#2d1f3d",
    backgroundColor: "#f6f1e7",
    shapeOverrides: { rings: 5, baseRadius: 240, gap: 8, scaleIntensity: 1 },
  },
  {
    id: "lullaby",
    name: "Lullaby",
    description: "A heart traced in italic Garamond.",
    shape: "heart",
    text: NERUDA,
    fontFamily: '"EB Garamond", Georgia, serif',
    fontSize: 17,
    weight: 500,
    italic: true,
    letterSpacing: 0.4,
    textColor: "#1c1824",
    backgroundColor: "#fbf6ec",
    shapeOverrides: { amplitude: 1.05, startAngle: 90 },
  },
  {
    id: "field-notes",
    name: "Field Notes",
    description: "A cello of body text, hand-set with a quiet neck.",
    shape: "cello",
    text: WHITMAN,
    fontFamily: 'Georgia, serif',
    fontSize: 13,
    weight: 400,
    italic: false,
    letterSpacing: 0.1,
    textColor: "#2a2233",
    backgroundColor: "#f6f1e7",
  },
  {
    id: "manifesto",
    name: "Manifesto",
    description: "All-caps Inter on a 9-point star.",
    shape: "star",
    text: TAGORE,
    fontFamily: '"Space Grotesk", "Inter", sans-serif',
    fontSize: 12,
    weight: 700,
    italic: false,
    letterSpacing: 1.2,
    textColor: "#1c1824",
    backgroundColor: "#f6f1e7",
    textCase: "upper",
    shapeOverrides: { points: 9, inner: 0.36, outer: 230, rotation: -90 },
  },
  {
    id: "aubade",
    name: "Aubade",
    description: "A sun radiating words at dawn.",
    shape: "sun",
    text: DUNBAR,
    fontFamily: '"EB Garamond", Georgia, serif',
    fontSize: 13,
    weight: 500,
    italic: false,
    letterSpacing: 0.4,
    textColor: "#3a1640",
    backgroundColor: "#fbf6ec",
    textCase: "upper",
    shapeOverrides: { rays: 22, innerRadius: 100, rayLength: 170, spiralTurns: 3 },
  },
  {
    id: "solstice",
    name: "Solstice",
    description: "A waxing crescent of prose.",
    shape: "moon",
    text: SAPPHO,
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontSize: 18,
    weight: 500,
    italic: true,
    letterSpacing: 0.4,
    textColor: "#1c1824",
    backgroundColor: "#f6f1e7",
    shapeOverrides: { phase: 0.6, radius: 230, lineHeight: 1.18 },
  },
  {
    id: "murmuration",
    name: "Murmuration",
    description: "An echo of nested arcs whispering outward.",
    shape: "echo",
    text: RILKE,
    fontFamily: '"EB Garamond", Georgia, serif',
    fontSize: 14,
    weight: 500,
    italic: false,
    letterSpacing: 0.3,
    textColor: "#1c1824",
    backgroundColor: "#f6f1e7",
    shapeOverrides: { rings: 9, arc: 250, baseRadius: 240, offset: 14, gap: 4 },
  },
];

export function applyPreset(state: CanvasState, preset: Preset): CanvasState {
  const next: CanvasState = {
    ...state,
    shape: preset.shape,
    text: preset.text,
    fontFamily: preset.fontFamily,
    fontSize: preset.fontSize,
    weight: preset.weight,
    italic: preset.italic,
    letterSpacing: preset.letterSpacing,
    textColor: preset.textColor,
    backgroundColor: preset.backgroundColor,
    textCase: preset.textCase ?? "as-is",
    jitter: preset.jitter ?? 0,
    shapeParams: { ...buildDefaultShapeParams(), ...state.shapeParams },
  };
  if (preset.shapeOverrides) {
    next.shapeParams = {
      ...next.shapeParams,
      [preset.shape]: { ...next.shapeParams[preset.shape], ...preset.shapeOverrides },
    };
  }
  return next;
}
