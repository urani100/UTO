/**
 * Build SVG path "d" strings.
 * Coordinates are normalized internally and only stamped to canvas pixels at the call site.
 */

import { CANVAS_H, CANVAS_W } from "../types";

export function n2p(x: number, y: number): [number, number] {
  return [x * CANVAS_W, y * CANVAS_H];
}

/** Convert an array of normalized [0..1] points into an SVG path d-string. */
export function pointsToPath(points: Array<[number, number]>, closed = false): string {
  if (points.length === 0) return "";
  const [x0, y0] = n2p(points[0]![0], points[0]![1]);
  let d = `M ${x0.toFixed(2)} ${y0.toFixed(2)}`;
  for (let i = 1; i < points.length; i++) {
    const [x, y] = n2p(points[i]![0], points[i]![1]);
    d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  if (closed) d += " Z";
  return d;
}

/** Build a smooth catmull-rom-ish cubic-Bezier path through the points. */
export function smoothPath(points: Array<[number, number]>, closed = false, tension = 0.5): string {
  if (points.length < 2) return pointsToPath(points, closed);
  const ps = points.map(([x, y]) => n2p(x, y));
  const n = ps.length;
  const get = (i: number): [number, number] => {
    if (closed) return ps[((i % n) + n) % n]!;
    return ps[Math.max(0, Math.min(n - 1, i))]!;
  };

  let d = `M ${ps[0]![0].toFixed(2)} ${ps[0]![1].toFixed(2)}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);

    const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension * 2;
    const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension * 2;
    const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension * 2;
    const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension * 2;

    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  if (closed) d += " Z";
  return d;
}

/**
 * Archimedean spiral parameterized by arc length so the textPath walks at constant velocity.
 * Sampled at uniform t in [0,1]; we then resample by arc length.
 */
export function archimedeanSpiral(opts: {
  cx: number; // center x in canvas px
  cy: number; // center y in canvas px
  a: number; // inner radius (px)
  b: number; // gain per radian (px/rad)
  turns: number; // total turns
  direction?: 1 | -1; // 1 = outward, -1 = inward
  samples?: number;
}): string {
  const { cx, cy, a, b, turns, direction = 1, samples = 600 } = opts;
  const totalTheta = turns * Math.PI * 2;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const theta = direction === 1 ? t * totalTheta : (1 - t) * totalTheta;
    const r = a + b * theta;
    pts.push([cx + r * Math.cos(theta), cy + r * Math.sin(theta)]);
  }
  return pointsToPathPx(pts);
}

/** As pointsToPath but takes pixel coordinates directly (no normalization mapping). */
export function pointsToPathPx(points: Array<[number, number]>, closed = false): string {
  if (points.length === 0) return "";
  let d = `M ${points[0]![0].toFixed(2)} ${points[0]![1].toFixed(2)}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i]![0].toFixed(2)} ${points[i]![1].toFixed(2)}`;
  }
  if (closed) d += " Z";
  return d;
}

/** Smooth path from pixel coordinates. */
export function smoothPathPx(points: Array<[number, number]>, closed = false, tension = 0.5): string {
  if (points.length < 2) return pointsToPathPx(points, closed);
  const n = points.length;
  const get = (i: number): [number, number] => {
    if (closed) return points[((i % n) + n) % n]!;
    return points[Math.max(0, Math.min(n - 1, i))]!;
  };
  let d = `M ${points[0]![0].toFixed(2)} ${points[0]![1].toFixed(2)}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension * 2;
    const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension * 2;
    const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension * 2;
    const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension * 2;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  if (closed) d += " Z";
  return d;
}

/** Approximate path arc length from sampled points. */
export function arcLengthPx(points: Array<[number, number]>): number {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i]![0] - points[i - 1]![0];
    const dy = points[i]![1] - points[i - 1]![1];
    len += Math.hypot(dx, dy);
  }
  return len;
}
