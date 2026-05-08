import { describe, expect, it } from "vitest";
import {
  archimedeanSpiral,
  arcLengthPx,
  arcLengthResample,
  pointsToPath,
  pointsToPathPx,
  smoothPath,
  smoothPathPx,
} from "../path";

describe("pointsToPath (normalized)", () => {
  it("returns empty string for empty input", () => {
    expect(pointsToPath([])).toBe("");
  });

  it("emits M then L commands in canvas pixel space", () => {
    const d = pointsToPath([
      [0, 0],
      [1, 1],
    ]);
    // CANVAS_W=900, CANVAS_H=560 (constants from types.ts).
    expect(d).toBe("M 0.00 0.00 L 900.00 560.00");
  });

  it("appends Z when closed=true", () => {
    expect(pointsToPath([[0, 0], [0.5, 0.5]], true)).toMatch(/Z$/);
  });
});

describe("pointsToPathPx", () => {
  it("preserves pixel coordinates verbatim", () => {
    expect(
      pointsToPathPx([
        [10, 20],
        [30, 40],
      ])
    ).toBe("M 10.00 20.00 L 30.00 40.00");
  });
});

describe("smoothPath / smoothPathPx", () => {
  it("falls back to a polyline when fewer than 2 points", () => {
    expect(smoothPath([[0, 0]])).toBe("M 0.00 0.00");
    expect(smoothPathPx([])).toBe("");
  });

  it("emits cubic Bezier segments for >=2 points", () => {
    const d = smoothPathPx([
      [0, 0],
      [10, 0],
      [10, 10],
    ]);
    expect(d.startsWith("M ")).toBe(true);
    expect(d.includes(" C ")).toBe(true);
  });

  it("appends Z when closed=true", () => {
    const d = smoothPathPx([[0, 0], [10, 10], [20, 0]], true);
    expect(d).toMatch(/Z$/);
  });
});

describe("arcLengthPx", () => {
  it("returns 0 for fewer than 2 points", () => {
    expect(arcLengthPx([])).toBe(0);
    expect(arcLengthPx([[0, 0]])).toBe(0);
  });

  it("sums Euclidean distances between consecutive points", () => {
    // 3-4-5 right triangle as a polyline: legs 3 and 4 → total 7.
    expect(arcLengthPx([[0, 0], [3, 0], [3, 4]])).toBeCloseTo(7);
  });

  it("matches the closed-form circumference for a sampled circle (within 1%)", () => {
    const r = 100;
    const samples = 720;
    const pts: Array<[number, number]> = [];
    for (let i = 0; i <= samples; i++) {
      const t = (i / samples) * 2 * Math.PI;
      pts.push([r * Math.cos(t), r * Math.sin(t)]);
    }
    const expected = 2 * Math.PI * r;
    const measured = arcLengthPx(pts);
    expect(Math.abs(measured - expected) / expected).toBeLessThan(0.01);
  });
});

describe("archimedeanSpiral", () => {
  it("emits a path string anchored at the inner radius", () => {
    const d = archimedeanSpiral({
      cx: 100,
      cy: 100,
      a: 5,
      b: 2,
      turns: 1,
      samples: 8,
    });
    expect(d.startsWith("M ")).toBe(true);
    expect(d.split(" L ").length).toBeGreaterThan(2);
  });

  it("respects direction=-1 (inward sweep)", () => {
    const out = archimedeanSpiral({
      cx: 0,
      cy: 0,
      a: 1,
      b: 1,
      turns: 2,
      direction: -1,
      samples: 8,
    });
    const inward = archimedeanSpiral({
      cx: 0,
      cy: 0,
      a: 1,
      b: 1,
      turns: 2,
      direction: 1,
      samples: 8,
    });
    expect(out).not.toBe(inward);
  });
});

describe("arcLengthResample", () => {
  it("returns n points", () => {
    const pts: Array<[number, number]> = [[0, 0], [10, 0], [20, 0], [30, 0]];
    expect(arcLengthResample(pts, 7)).toHaveLength(7);
  });

  it("first and last points match the input endpoints", () => {
    const pts: Array<[number, number]> = [[0, 0], [5, 0], [10, 0]];
    const out = arcLengthResample(pts, 5);
    expect(out[0]![0]).toBeCloseTo(0);
    expect(out[out.length - 1]![0]).toBeCloseTo(10);
  });

  it("produces uniform spacing on a straight line", () => {
    // 10 points along x=0..9, resample to 5 → expect x = 0, 2.25, 4.5, 6.75, 9
    const pts: Array<[number, number]> = Array.from({ length: 10 }, (_, i) => [i, 0]);
    const out = arcLengthResample(pts, 5);
    const gaps = out.slice(1).map((p, i) => Math.hypot(p[0] - out[i]![0], p[1] - out[i]![1]));
    const maxGap = Math.max(...gaps);
    const minGap = Math.min(...gaps);
    expect((maxGap - minGap) / maxGap).toBeLessThan(0.01); // gaps uniform within 1%
  });

  it("preserves total arc length within 1% on a parametric curve with a cusp", () => {
    // Simulate the heart curve cusp: uniform-t sampling produces clustered points.
    const raw: Array<[number, number]> = [];
    for (let i = 0; i <= 480; i++) {
      const t = (i / 480) * Math.PI * 2;
      const s = Math.sin(t), c = Math.cos(t);
      const c2 = c * c;
      const cos2t = 2 * c2 - 1, cos3t = c * (4 * c2 - 3), cos4t = 2 * cos2t * cos2t - 1;
      raw.push([16 * s * s * s, 13 * c - 5 * cos2t - 2 * cos3t - cos4t]);
    }
    const originalLen = arcLengthPx(raw);
    const resampled = arcLengthResample(raw, 480);
    const resampledLen = arcLengthPx(resampled);
    expect(Math.abs(resampledLen - originalLen) / originalLen).toBeLessThan(0.01);
  });

  it("dramatically reduces clustering: max/min gap ratio drops from 120x to under 15x after resampling", () => {
    // Heart curve has ~120x clustering at cusp with uniform-t; arc-length resample fixes it.
    const raw: Array<[number, number]> = [];
    for (let i = 0; i <= 480; i++) {
      const t = (i / 480) * Math.PI * 2;
      const s = Math.sin(t), c = Math.cos(t);
      const c2 = c * c;
      const cos2t = 2 * c2 - 1, cos3t = c * (4 * c2 - 3), cos4t = 2 * cos2t * cos2t - 1;
      raw.push([16 * s * s * s, 13 * c - 5 * cos2t - 2 * cos3t - cos4t]);
    }
    // Verify original clustering is severe (>100x).
    const rawGaps = raw.slice(1).map((p, i) => Math.hypot(p[0] - raw[i]![0], p[1] - raw[i]![1]));
    const rawMax = Math.max(...rawGaps);
    const rawMin = rawGaps.filter(g => g > 0).reduce((a, b) => Math.min(a, b), Infinity);
    expect(rawMax / rawMin).toBeGreaterThan(100);

    // After resampling the ratio must fall below 15x.
    const resampled = arcLengthResample(raw, 480);
    const gaps = resampled.slice(1).map((p, i) =>
      Math.hypot(p[0] - resampled[i]![0], p[1] - resampled[i]![1])
    );
    const maxGap = Math.max(...gaps);
    const minGap = gaps.filter(g => g > 0).reduce((a, b) => Math.min(a, b), Infinity);
    expect(maxGap / minGap).toBeLessThan(15);
  });
});
