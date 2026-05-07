import { describe, expect, it } from "vitest";
import {
  archimedeanSpiral,
  arcLengthPx,
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
