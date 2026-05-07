import { describe, expect, it } from "vitest";
import {
  buildShapeText,
  computeFilledText,
  legacyApproxLen,
  legacyAvgCharPx,
  measureAvgCharAdvancePx,
  measurePathLengthPx,
} from "../measure";

describe("legacyApproxLen", () => {
  it("returns the 400-px floor for trivial paths", () => {
    expect(legacyApproxLen("M 0 0")).toBe(400);
  });

  it("scales with the SVG command count", () => {
    const long = Array.from({ length: 50 }, (_, i) => `L ${i} ${i}`).join(" ");
    const d = `M 0 0 ${long}`;
    expect(legacyApproxLen(d)).toBeGreaterThan(400);
  });
});

describe("legacyAvgCharPx", () => {
  it("scales linearly with font size", () => {
    expect(legacyAvgCharPx(10)).toBe(5);
    expect(legacyAvgCharPx(14)).toBe(7);
  });
});

describe("measurePathLengthPx", () => {
  it("returns null for null input", () => {
    expect(measurePathLengthPx(null)).toBeNull();
  });

  it("returns null when getTotalLength is unavailable", () => {
    const fake = {} as unknown as SVGPathElement;
    expect(measurePathLengthPx(fake)).toBeNull();
  });

  it("returns the value reported by getTotalLength", () => {
    const fake = { getTotalLength: () => 123.45 } as unknown as SVGPathElement;
    expect(measurePathLengthPx(fake)).toBeCloseTo(123.45);
  });

  it("returns null when getTotalLength throws", () => {
    const fake = {
      getTotalLength: () => {
        throw new Error("not in document");
      },
    } as unknown as SVGPathElement;
    expect(measurePathLengthPx(fake)).toBeNull();
  });

  it("returns null for non-positive lengths", () => {
    const fake = { getTotalLength: () => 0 } as unknown as SVGPathElement;
    expect(measurePathLengthPx(fake)).toBeNull();
  });
});

describe("measureAvgCharAdvancePx", () => {
  it("returns null for null input", () => {
    expect(measureAvgCharAdvancePx(null)).toBeNull();
  });

  it("returns null for empty text", () => {
    const fake = {
      textContent: "",
      getComputedTextLength: () => 100,
    } as unknown as SVGTextElement;
    expect(measureAvgCharAdvancePx(fake)).toBeNull();
  });

  it("normalizes computed text length by character count", () => {
    const fake = {
      textContent: "abcdefghij",
      getComputedTextLength: () => 70,
    } as unknown as SVGTextElement;
    expect(measureAvgCharAdvancePx(fake)).toBeCloseTo(7);
  });

  it("returns null when getComputedTextLength throws", () => {
    const fake = {
      textContent: "abc",
      getComputedTextLength: () => {
        throw new Error("not rendered");
      },
    } as unknown as SVGTextElement;
    expect(measureAvgCharAdvancePx(fake)).toBeNull();
  });
});

describe("computeFilledText — legacy policy (default)", () => {
  it("matches the historical char-count formula exactly", () => {
    // Historical formula: max(40, floor((pathLen / charPx) * 1.05)).
    const out = computeFilledText({
      text: "hello",
      pathLenPx: 1000,
      avgCharPx: 7,
    });
    expect(out.chars).toBe(150); // floor(1000/7 * 1.05) = floor(150) = 150.
    expect(out.text.length).toBeGreaterThanOrEqual(150);
  });

  it("enforces a 40-character floor", () => {
    const out = computeFilledText({
      text: "hi",
      pathLenPx: 10,
      avgCharPx: 7,
    });
    expect(out.chars).toBe(40);
  });

  it("is the default when no policy is supplied", () => {
    const a = computeFilledText({ text: "x", pathLenPx: 700, avgCharPx: 7 });
    const b = computeFilledText({
      text: "x",
      pathLenPx: 700,
      avgCharPx: 7,
      policy: { kind: "legacy" },
    });
    expect(a).toEqual(b);
  });
});

describe("computeFilledText — repeat-measured policy", () => {
  it("uses an exact 1.0 overfill when none is supplied", () => {
    const out = computeFilledText({
      text: "ab",
      pathLenPx: 100,
      avgCharPx: 5,
      policy: { kind: "repeat-measured" },
    });
    expect(out.chars).toBe(20);
    expect(out.text.length).toBeGreaterThanOrEqual(20);
  });

  it("respects a custom overfill multiplier", () => {
    const out = computeFilledText({
      text: "ab",
      pathLenPx: 100,
      avgCharPx: 5,
      policy: { kind: "repeat-measured", overfill: 1.2 },
    });
    expect(out.chars).toBe(24);
  });
});

describe("computeFilledText — fit-once policy", () => {
  it("returns trimmed prose when it fits the capacity", () => {
    const out = computeFilledText({
      text: "  hello world  ",
      pathLenPx: 200,
      avgCharPx: 5,
      policy: { kind: "fit-once" },
    });
    expect(out.text).toBe("hello world");
  });

  it("truncates at a word boundary when prose exceeds capacity", () => {
    const out = computeFilledText({
      text: "the quick brown fox jumps over the lazy dog",
      pathLenPx: 100,
      avgCharPx: 5,
      policy: { kind: "fit-once" },
    });
    expect(out.text.length).toBeLessThanOrEqual(20);
    expect(out.text.endsWith(" ")).toBe(false);
    expect(out.text.split(" ").every((w) => w.length > 0)).toBe(true);
  });

  it("applies underfill to leave a breathing gap", () => {
    const noUnderfill = computeFilledText({
      text: "x".repeat(500),
      pathLenPx: 100,
      avgCharPx: 5,
      policy: { kind: "fit-once" },
    });
    const withUnderfill = computeFilledText({
      text: "x".repeat(500),
      pathLenPx: 100,
      avgCharPx: 5,
      policy: { kind: "fit-once", underfill: 0.9 },
    });
    expect(withUnderfill.chars).toBeLessThan(noUnderfill.chars);
  });
});

describe("computeFilledText — defensive against pathological inputs", () => {
  it("does not infinite-loop when avgCharPx is 0", () => {
    const out = computeFilledText({
      text: "hello",
      pathLenPx: 1000,
      avgCharPx: 0,
    });
    expect(out.chars).toBeGreaterThan(0);
    expect(out.chars).toBeLessThanOrEqual(100_000);
    expect(out.text.length).toBeLessThanOrEqual(out.text.length); // doesn't hang
  });

  it("falls back to safe defaults when avgCharPx is NaN", () => {
    const out = computeFilledText({
      text: "hello",
      pathLenPx: 1000,
      avgCharPx: NaN,
    });
    expect(out.chars).toBe(150); // floor(1000 / 7 * 1.05)
  });

  it("falls back to safe defaults when avgCharPx is Infinity", () => {
    const out = computeFilledText({
      text: "hello",
      pathLenPx: 1000,
      avgCharPx: Infinity,
    });
    expect(out.chars).toBe(150);
  });

  it("falls back to safe defaults when pathLenPx is 0 / NaN / Infinity / negative", () => {
    for (const bad of [0, NaN, Infinity, -100]) {
      const out = computeFilledText({
        text: "hi",
        pathLenPx: bad,
        avgCharPx: 7,
      });
      // Falls back to pathLenPx=400 → floor(400/7*1.05)=60, clamped to floor(40)=60.
      expect(out.chars).toBe(60);
    }
  });

  it("clamps at the hard cap (100k) to prevent runaway allocations", () => {
    const out = computeFilledText({
      text: "x",
      pathLenPx: 1e12,
      avgCharPx: 1,
      policy: { kind: "repeat-measured" },
    });
    expect(out.chars).toBe(100_000);
  });

  it("ignores invalid overfill values (NaN / 0 / negative)", () => {
    for (const bad of [NaN, 0, -1]) {
      const out = computeFilledText({
        text: "ab",
        pathLenPx: 100,
        avgCharPx: 5,
        policy: { kind: "repeat-measured", overfill: bad },
      });
      expect(out.chars).toBe(20); // falls back to overfill=1.0
    }
  });
});

describe("buildShapeText", () => {
  it("applies case transform before filling", () => {
    const out = buildShapeText({
      rawText: "hello",
      textCase: "upper",
      pathLenPx: 1000,
      avgCharPx: 7,
    });
    expect(out.text.startsWith("HELLO")).toBe(true);
  });

  it("falls back to placeholder prose when raw text is empty", () => {
    const out = buildShapeText({
      rawText: "",
      textCase: "as-is",
      pathLenPx: 1000,
      avgCharPx: 7,
    });
    expect(out.text.toLowerCase()).toContain("begin with");
  });
});
