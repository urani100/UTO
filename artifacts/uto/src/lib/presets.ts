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

const BAUDELAIRE =
  "Remords posthume\nLorsque tu dormiras, ma belle ténébreuse,\nAu fond d'un monument construit en marbre noir,\nEt lorsque tu n'auras pour alcôve et manoir\nQu'un caveau pluvieux et qu'une fosse creuse;\nQuand la pierre, opprimant ta poitrine peureuse\nEt tes flancs qu'assouplit un charmant nonchaloir,\nEmpêchera ton coeur de battre et de vouloir,\nEt tes pieds de courir leur course aventureuse,\nLe tombeau, confident de mon rêve infini\n(Car le tombeau toujours comprendra le poète),\nDurant ces grandes nuits d'où le somme est banni,\nTe dira: «Que vous sert, courtisane imparfaite,\nDe n'avoir pas connu ce que pleurent les morts?»\n— Et le ver rongera ta peau comme un remords.\n— Charles Baudelaire";

const DICKINSON = BAUDELAIRE;
const RILKE = BAUDELAIRE;
const BLAKE = BAUDELAIRE;
const NERUDA = BAUDELAIRE;
const WHITMAN = BAUDELAIRE;
const DUNBAR = BAUDELAIRE;
const TAGORE = BAUDELAIRE;
const SAPPHO = BAUDELAIRE;

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
    backgroundColor: "#eeece7",
    shapeOverrides: { turns: 7, pitch: 26, inner: 8, startAngle: 0, taper: 1 },
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
    backgroundColor: "#eeece7",
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
    backgroundColor: "#eeece7",
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
    backgroundColor: "#eeece7",
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
    backgroundColor: "#eeece7",
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
    backgroundColor: "#eeece7",
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
