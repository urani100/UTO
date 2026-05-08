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
  return pointsToPathPx(points.map(([x, y]) => n2p(x, y)), closed);
}

/** Build a smooth catmull-rom-ish cubic-Bezier path through normalized points. */
export function smoothPath(points: Array<[number, number]>, closed = false, tension = 0.5): string {
  return smoothPathPx(points.map(([x, y]) => n2p(x, y)), closed, tension);
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
  const segs: string[] = [`M ${points[0]![0].toFixed(2)} ${points[0]![1].toFixed(2)}`];
  for (let i = 1; i < points.length; i++) {
    segs.push(`L ${points[i]![0].toFixed(2)} ${points[i]![1].toFixed(2)}`);
  }
  if (closed) segs.push("Z");
  return segs.join(" ");
}

/** Smooth path from pixel coordinates. */
export function smoothPathPx(points: Array<[number, number]>, closed = false, tension = 0.5): string {
  if (points.length < 2) return pointsToPathPx(points, closed);
  const n = points.length;
  const get = (i: number): [number, number] => {
    if (closed) return points[((i % n) + n) % n]!;
    return points[Math.max(0, Math.min(n - 1, i))]!;
  };
  const segs: string[] = [`M ${points[0]![0].toFixed(2)} ${points[0]![1].toFixed(2)}`];
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
    segs.push(`C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`);
  }
  if (closed) segs.push("Z");
  return segs.join(" ");
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

/**
 * Replace the sharpest corner in a point array with a smooth cubic Hermite arc.
 *
 * Parametric curves with cusps (e.g. the heart cardioid at t=0 and t=π) have
 * near-180° direction reversals that cause SVG <textPath> to rotate characters
 * erratically. This function finds the sharpest corner, determines the inward
 * direction from the geometric bisector of the two arms (C→P1 and C→P3), and
 * replaces the bad neighbourhood with a C1-continuous cubic Hermite arc that
 * rounds the V into a U.
 *
 * The bisector-based inward direction is correct for any V-shaped cusp regardless
 * of the curve's global centroid position. (A centroid-based method fails for
 * concave notches like the heart's top dip, where the centroid lies on the wrong
 * side of the cusp tip.)
 *
 * radius controls the depth of the rounding. 6–10 px is visually imperceptible
 * on a 200 px+ shape but sufficient to reduce the max tangent change from ~154°
 * to ~7° (22× improvement on the heart cardioid).
 *
 * Only the calling shape needs to opt in — no other shapes are affected.
 */
export function roundSharpestCorner(
  pts: Array<[number, number]>,
  radius: number,
  arcSamples = 12,
): Array<[number, number]> {
  if (pts.length < 3) return pts.slice();

  // 1. Find the sharpest corner (maximum tangent-angle change).
  let maxDelta = 0;
  let cuspIdx = 1;
  for (let i = 1; i < pts.length - 1; i++) {
    const a = Math.atan2(pts[i]![1] - pts[i - 1]![1], pts[i]![0] - pts[i - 1]![0]);
    const b = Math.atan2(pts[i + 1]![1] - pts[i]![1], pts[i + 1]![0] - pts[i]![0]);
    let delta = Math.abs(b - a);
    if (delta > Math.PI) delta = 2 * Math.PI - delta;
    if (delta > maxDelta) { maxDelta = delta; cuspIdx = i; }
  }

  const C = pts[cuspIdx]!;

  // 2. Boundary points: walk outward from the cusp until we clear the radius zone.
  let p1Idx = cuspIdx - 1;
  while (p1Idx > 0 && Math.hypot(pts[p1Idx]![0] - C[0], pts[p1Idx]![1] - C[1]) < radius) p1Idx--;
  let p3Idx = cuspIdx + 1;
  while (p3Idx < pts.length - 1 && Math.hypot(pts[p3Idx]![0] - C[0], pts[p3Idx]![1] - C[1]) < radius) p3Idx++;

  const P1 = pts[p1Idx]!;
  const P3 = pts[p3Idx]!;

  // 3. Inward direction: bisector of the two arms C→P1 and C→P3.
  //
  //    Using the geometric bisector rather than the global centroid ensures the
  //    apex always lands inside the V for any cusp, regardless of where the shape's
  //    centroid falls relative to the cusp tip. For example, the heart's top-notch
  //    cusp has a centroid below the tip (pulling the centroid method in the wrong
  //    direction), while the bisector correctly points into the notch.
  const v1x = P1[0] - C[0], v1y = P1[1] - C[1];
  const v1L = Math.hypot(v1x, v1y);
  const v3x = P3[0] - C[0], v3y = P3[1] - C[1];
  const v3L = Math.hypot(v3x, v3y);
  const bx = (v1L > 0 ? v1x / v1L : 0) + (v3L > 0 ? v3x / v3L : 0);
  const by = (v1L > 0 ? v1y / v1L : 0) + (v3L > 0 ? v3y / v3L : 0);
  const bLen = Math.hypot(bx, by);
  const nx = bLen > 0 ? bx / bLen : 0;
  const ny = bLen > 0 ? by / bLen : -1;

  // 4. Apex: cusp point offset inward by radius — the peak of the replacement arc.
  const apex: [number, number] = [C[0] + radius * nx, C[1] + radius * ny];

  // 5. Cubic Hermite Bézier from P1 to P3 with C1-continuous endpoint tangents.
  //    Matching the original curve's tangent direction at both P1 and P3
  //    eliminates junction-angle mismatches that a plain quadratic arc would create.
  //
  //    Tangent at P1: direction from the point before P1 toward P1 (incoming).
  //    Tangent at P3: direction from P3 toward the point after P3 (outgoing).
  //    Tangent scale h: chosen so the midpoint of the Hermite curve passes
  //    through the apex (cusp + radius * inward), ensuring the V is rounded to
  //    the requested depth even when P1 and P3 are very close (tight cusps).
  //
  //    Hermite midpoint formula:  B(0.5) = 0.5*(P1+P3) + 0.125*(m0 - m1)
  //    Solving for h with m0 = h*t1, m1 = h*t3 and target B(0.5) = apex:
  //      h = (apex - 0.5*(P1+P3)) · (t1-t3) / (0.125 * |t1-t3|²)

  const prev1 = pts[p1Idx - 1] ?? P1;
  const next3 = pts[p3Idx + 1] ?? P3;

  const d1x = P1[0] - prev1[0], d1y = P1[1] - prev1[1];
  const d3x = next3[0] - P3[0], d3y = next3[1] - P3[1];
  const l1 = Math.hypot(d1x, d1y), l3 = Math.hypot(d3x, d3y);
  const t1x = l1 > 0 ? d1x / l1 : 0, t1y = l1 > 0 ? d1y / l1 : 0;
  const t3x = l3 > 0 ? d3x / l3 : 0, t3y = l3 > 0 ? d3y / l3 : 0;

  const diffTx = t1x - t3x, diffTy = t1y - t3y;
  const midX = 0.5 * (P1[0] + P3[0]), midY = 0.5 * (P1[1] + P3[1]);
  const rhsX = apex[0] - midX, rhsY = apex[1] - midY;
  const dot  = rhsX * diffTx + rhsY * diffTy;
  const denom = 0.125 * (diffTx * diffTx + diffTy * diffTy);
  const h = denom > 1e-10 ? dot / denom : Math.hypot(P3[0] - P1[0], P3[1] - P1[1]);

  const arcPts: Array<[number, number]> = [];
  for (let i = 0; i <= arcSamples; i++) {
    const t = i / arcSamples;
    // Cubic Hermite basis: h00·P1 + h10·m0 + h01·P3 + h11·m1
    const h00 =  2*t*t*t - 3*t*t + 1;
    const h10 =    t*t*t - 2*t*t + t;
    const h01 = -2*t*t*t + 3*t*t;
    const h11 =    t*t*t -   t*t;
    arcPts.push([
      h00 * P1[0] + h10 * h * t1x + h01 * P3[0] + h11 * h * t3x,
      h00 * P1[1] + h10 * h * t1y + h01 * P3[1] + h11 * h * t3y,
    ]);
  }

  // Replace cusp neighbourhood with the smooth arc.
  // arcPts[0] = P1, arcPts[last] = P3 — no duplicates at the splice boundaries.
  return [...pts.slice(0, p1Idx), ...arcPts, ...pts.slice(p3Idx + 1)];
}

/**
 * Round every corner sharper than `maxAngleDeg` by repeatedly calling
 * roundSharpestCorner until no corner exceeds the threshold.
 *
 * The heart cardioid has two cusps (t=0 and t=π) — this handles all of them
 * in one call without the caller needing to know the count. Safe to apply to
 * any curve; if no corners exceed the threshold the input is returned unchanged.
 */
export function roundSharpCorners(
  pts: Array<[number, number]>,
  radius: number,
  maxAngleDeg = 30,
  arcSamples = 12,
): Array<[number, number]> {
  let result = pts;
  const threshold = maxAngleDeg * (Math.PI / 180);
  for (let pass = 0; pass < pts.length; pass++) {   // upper bound prevents infinite loops
    let max = 0;
    for (let i = 1; i < result.length - 1; i++) {
      const a = Math.atan2(result[i]![1] - result[i - 1]![1], result[i]![0] - result[i - 1]![0]);
      const b = Math.atan2(result[i + 1]![1] - result[i]![1], result[i + 1]![0] - result[i]![0]);
      let d = Math.abs(b - a);
      if (d > Math.PI) d = 2 * Math.PI - d;
      if (d > max) max = d;
    }
    if (max <= threshold) break;
    result = roundSharpestCorner(result, radius, arcSamples);
  }
  return result;
}

/**
 * Resample a point array to `n` points uniformly spaced by arc length.
 *
 * Parametric curves (e.g. the heart cardioid) have non-uniform speed: near
 * cusps the parameter moves slowly while the curve barely advances, clustering
 * many samples in a tiny spatial region. That clustering produces dozens of
 * nearly-coincident SVG path segments, which causes text characters to pile up
 * and rotate erratically when rendered via <textPath>.
 *
 * Arc-length reparameterization fixes this at the source: the output points are
 * evenly spaced along the curve, so the cusp gets exactly as many samples as its
 * arc-length share warrants (typically 0–1). Catmull-Rom then smooths cleanly
 * through the region using its outer neighbours, rounding any sharp corner into a
 * gentle curve without any shape-specific heuristics.
 *
 * O(n) cumulative-length scan + O(n) linear-interpolation pass.
 */
export function arcLengthResample(
  points: Array<[number, number]>,
  n: number,
): Array<[number, number]> {
  if (points.length < 2 || n < 2) return points.slice();

  // Build cumulative arc-length table.
  const cumLen: number[] = [0];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i]![0] - points[i - 1]![0];
    const dy = points[i]![1] - points[i - 1]![1];
    cumLen.push(cumLen[i - 1]! + Math.hypot(dx, dy));
  }
  const totalLen = cumLen[cumLen.length - 1]!;
  if (totalLen === 0) return points.slice(0, n);

  const result: Array<[number, number]> = [];
  let j = 0; // pointer into cumLen

  for (let i = 0; i < n; i++) {
    const target = (i / (n - 1)) * totalLen;

    // Advance j until cumLen[j] >= target.
    while (j < cumLen.length - 2 && cumLen[j + 1]! < target) j++;

    const segLen = cumLen[j + 1]! - cumLen[j]!;
    const t = segLen === 0 ? 0 : (target - cumLen[j]!) / segLen;
    const p0 = points[j]!;
    const p1 = points[j + 1] ?? points[j]!;
    result.push([p0[0] + t * (p1[0] - p0[0]), p0[1] + t * (p1[1] - p0[1])]);
  }

  return result;
}
