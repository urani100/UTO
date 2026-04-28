import type { CanvasState, ShapeId, ShapeMeta, ShapeRender } from "../types";
import { spiralMeta, renderSpiral } from "./spiral";
import { fibonacciMeta, renderFibonacci } from "./fibonacci";
import { echoMeta, renderEcho } from "./echo";
import { heartMeta, renderHeart } from "./heart";
import { starMeta, renderStar } from "./star";
import { sunMeta, renderSun } from "./sun";
import { moonMeta, renderMoon } from "./moon";
import { birdMeta, renderBird } from "./bird";
import { celloMeta, renderCello } from "./cello";
import { mongolfiereMeta, renderMongolfiere } from "./mongolfiere";

export const SHAPE_META: Record<ShapeId, ShapeMeta> = {
  spiral: spiralMeta,
  fibonacci: fibonacciMeta,
  echo: echoMeta,
  heart: heartMeta,
  star: starMeta,
  sun: sunMeta,
  moon: moonMeta,
  bird: birdMeta,
  cello: celloMeta,
  mongolfiere: mongolfiereMeta,
};

export const SHAPE_LIST: ShapeMeta[] = [
  spiralMeta,
  fibonacciMeta,
  echoMeta,
  starMeta,
  sunMeta,
  heartMeta,
  moonMeta,
  birdMeta,
  celloMeta,
  mongolfiereMeta,
];

export function renderShape(state: CanvasState): ShapeRender {
  switch (state.shape) {
    case "spiral":
      return renderSpiral(state);
    case "fibonacci":
      return renderFibonacci(state);
    case "echo":
      return renderEcho(state);
    case "heart":
      return renderHeart(state);
    case "star":
      return renderStar(state);
    case "sun":
      return renderSun(state);
    case "moon":
      return renderMoon(state);
    case "bird":
      return renderBird(state);
    case "cello":
      return renderCello(state);
    case "mongolfiere":
      return renderMongolfiere(state);
  }
}

export function buildDefaultShapeParams(): CanvasState["shapeParams"] {
  const out = {} as CanvasState["shapeParams"];
  (Object.keys(SHAPE_META) as ShapeId[]).forEach((id) => {
    out[id] = { ...SHAPE_META[id].defaults };
  });
  return out;
}
