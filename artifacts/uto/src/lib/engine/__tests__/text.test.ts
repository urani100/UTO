import { describe, expect, it } from "vitest";
import { applyCase, approxCharWidth, fillToLength, tokenize, wrapWords } from "../text";

describe("applyCase", () => {
  it("returns input unchanged for as-is", () => {
    expect(applyCase("Hello World", "as-is")).toBe("Hello World");
  });

  it("uppercases", () => {
    expect(applyCase("Hello", "upper")).toBe("HELLO");
  });

  it("lowercases", () => {
    expect(applyCase("HELLO", "lower")).toBe("hello");
  });

  it("title-cases each word", () => {
    expect(applyCase("hello world", "title")).toBe("Hello World");
    expect(applyCase("a quick BROWN fox", "title")).toBe("A Quick Brown Fox");
  });
});

describe("fillToLength", () => {
  it("returns empty string for blank input", () => {
    expect(fillToLength("   ", 100)).toBe("");
    expect(fillToLength("", 100)).toBe("");
  });

  it("returns trimmed input when long enough", () => {
    expect(fillToLength("  hello world  ", 5)).toBe("hello world");
  });

  it("repeats with double-space separator when text doesn't end in punctuation", () => {
    const out = fillToLength("hello", 20);
    expect(out.startsWith("hello")).toBe(true);
    expect(out.includes("  ")).toBe(true);
    expect(out.length).toBeGreaterThanOrEqual(20);
  });

  it("repeats with double-space separator when text ends in punctuation", () => {
    const out = fillToLength("hello.", 20);
    expect(out.startsWith("hello.")).toBe(true);
    expect(out.includes(".  ")).toBe(true);
    expect(out.length).toBeGreaterThanOrEqual(20);
  });

  it("does not truncate text longer than capacity", () => {
    // Critical contract — fillToLength is for under-fill, not truncation.
    const long = "a".repeat(500);
    expect(fillToLength(long, 100)).toBe(long);
  });
});

describe("tokenize", () => {
  it("splits on whitespace and keeps punctuation attached", () => {
    expect(tokenize("hello, world! foo.")).toEqual(["hello,", "world!", "foo."]);
  });

  it("collapses runs of whitespace and ignores empties", () => {
    expect(tokenize("  a   b   c  ")).toEqual(["a", "b", "c"]);
  });
});

describe("approxCharWidth", () => {
  it("scales linearly with font size", () => {
    expect(approxCharWidth(10)).toBeCloseTo(4.8);
    expect(approxCharWidth(20)).toBeCloseTo(9.6);
  });
});

describe("wrapWords", () => {
  it("packs words greedily within max width", () => {
    // "aa bb" → 5 chars × 10 px = 50 ≤ 50, fits. "aa bb cc" → 80 > 50, wraps.
    expect(wrapWords(["aa", "bb", "cc"], 50, 10)).toEqual(["aa bb", "cc"]);
  });

  it("wraps when next word would overflow", () => {
    // Each word is 4 chars × 10 = 40, fits alone. Two words "aaaa bbbb" = 9 chars × 10 = 90 > 50.
    expect(wrapWords(["aaaa", "bbbb", "cccc"], 50, 10)).toEqual(["aaaa", "bbbb", "cccc"]);
  });

  it("packs as many short words as fit per line", () => {
    // "a b c" = 5 chars × 10 = 50 ≤ 50 ✓; "a b c d" = 70 > 50 → wrap. Then "d e" = 30 ≤ 50 ✓.
    expect(wrapWords(["a", "b", "c", "d", "e"], 50, 10)).toEqual(["a b c", "d e"]);
  });

  it("force-breaks an oversize word", () => {
    expect(wrapWords(["abcdefghij"], 30, 10)).toEqual(["abc", "def", "ghi", "j"]);
  });
});
