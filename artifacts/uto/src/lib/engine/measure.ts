/**
 * Typography engine — measurement utilities.
 *
 * The renderer needs two numbers to lay text along a path:
 *   1. The path's arc length in pixels (so we know how much "room" we have).
 *   2. The average glyph advance for the current font / size (so we know how
 *      many characters fit in that room).
 *
 * Both numbers can be obtained two ways:
 *
 *   - **Legacy heuristics** (`legacyApproxLen`, `legacyAvgCharPx`): cheap
 *     synchronous estimates derived from the SVG path command count and a
 *     fixed glyph-width fraction. They are *deliberately* generous because
 *     `fillToLength` uses them to over-fill open paths so they never look
 *     starved. These are the original engine behavior and remain the default
 *     so no existing shape changes visually.
 *
 *   - **Measured values** (`measurePathLengthPx`, `measureAvgCharAdvancePx`):
 *     industry-standard browser APIs (`SVGPathElement.getTotalLength`,
 *     `SVGTextElement.getComputedTextLength`). Sub-pixel accurate, supported
 *     in every evergreen browser. Use these when correctness matters more
 *     than the legacy "always over-fill" feel — e.g. closed single-lap shapes
 *     where the heuristic causes head-to-tail glyph collisions.
 *
 * The policy lives on the {@link RenderedPath} (`FillPolicy`) and is read by
 * {@link computeFillCapacity}. New shapes can opt in to the measured engine
 * per-path without affecting any other shape.
 */

import { applyCase, fillToLength } from "./text";

/**
 * Legacy path-length heuristic. Counts SVG draw commands × 18 px with a 400 px
 * floor. Wildly inaccurate for short closed paths (over-estimates by 4–6×) but
 * preserved as the default so existing shapes render unchanged.
 */
export function legacyApproxLen(d: string): number {
  const cmds = d.split(/[MLCAQHVZ]/i).length;
  return Math.max(400, cmds * 18);
}

/**
 * Legacy average glyph advance. Assumes Garamond-ish proportions where the
 * mean glyph width is roughly half the em.
 */
export function legacyAvgCharPx(fontSizePx: number): number {
  return fontSizePx * 0.5;
}

/**
 * Real path arc length via `SVGPathElement.getTotalLength()`. Sub-pixel
 * accurate, O(1) call cost (the browser caches the value internally).
 *
 * Returns `null` if the element isn't a path or measurement is unavailable
 * (e.g. detached node). Callers should fall back to {@link legacyApproxLen}.
 */
export function measurePathLengthPx(el: SVGPathElement | null): number | null {
  if (!el || typeof el.getTotalLength !== "function") return null;
  try {
    const len = el.getTotalLength();
    return Number.isFinite(len) && len > 0 ? len : null;
  } catch {
    return null;
  }
}

/**
 * Real average glyph advance via `SVGTextElement.getComputedTextLength()`,
 * normalized by the sample text's character count. Sample text should be
 * representative (a mix of upper/lower/space) so the average isn't skewed.
 *
 * Returns `null` if measurement fails. Callers should fall back to
 * {@link legacyAvgCharPx}.
 */
export function measureAvgCharAdvancePx(el: SVGTextElement | null): number | null {
  if (!el || typeof el.getComputedTextLength !== "function") return null;
  const text = el.textContent ?? "";
  if (text.length === 0) return null;
  try {
    const total = el.getComputedTextLength();
    if (!Number.isFinite(total) || total <= 0) return null;
    return total / text.length;
  } catch {
    return null;
  }
}

/**
 * Per-path text-fill policy. Default (when `policy` is omitted on a
 * `RenderedPath`) is `"legacy"` so existing shapes are visually unchanged.
 *
 * - `"legacy"` — heuristic length × heuristic glyph width × 1.05 over-fill.
 *   Open paths (spiral, bird, etc.) never look starved because over-flow
 *   characters fall off the path end. Closed single-lap paths can wrap and
 *   collide; pick a different policy for those.
 *
 * - `"repeat-measured"` — measured length and glyph width, prose repeats with
 *   `·` separators to fill the path. Same end behavior as `legacy` but
 *   correctness-bounded.
 *
 * - `"fit-once"` — fit the prose exactly once (or truncate if longer), with
 *   an optional `underfill` fraction (e.g. `0.95`) leaving a breathing gap
 *   for closed paths. No wrap-around.
 */
export type FillPolicy =
  | { kind: "legacy" }
  | { kind: "repeat-measured"; overfill?: number }
  | { kind: "fit-once"; underfill?: number };

export interface FillInputs {
  /** Source prose, post-case-transform. */
  text: string;
  /** Path arc length in px. Provide measured value when available; otherwise pass legacy heuristic. */
  pathLenPx: number;
  /** Average glyph advance in px. Provide measured value when available; otherwise pass legacy heuristic. */
  avgCharPx: number;
  /** Policy from the `RenderedPath`. Defaults to legacy. */
  policy?: FillPolicy;
}

/**
 * Compute the string that should be fed into `<textPath>` for one
 * `RenderedPath`, applying the chosen fill policy. Pure function — no DOM.
 *
 * The returned `chars` is the upper bound used to size the text, useful for
 * debug overlays / status strips. The returned `text` is the actual string
 * to render.
 */
/** Hard upper bound on generated character count to prevent runaway memory / CPU
 *  if upstream measurements are pathological. 100k characters is well above any
 *  realistic 900×560 canvas density. */
const CHAR_HARD_CAP = 100_000;

/** Sanitize a measurement value: must be a finite positive number, else `fallback`. */
function safePositive(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function computeFilledText(inputs: FillInputs): { text: string; chars: number } {
  const { text } = inputs;
  // Robust against NaN / 0 / Infinity / negative values from broken measurements.
  // Fallbacks are conservative legacy defaults: 400 px (the historical floor) and
  // 7 px (≈ legacyAvgCharPx for a 14 px font, the default UTO size).
  const pathLenPx = safePositive(inputs.pathLenPx, 400);
  const avgCharPx = safePositive(inputs.avgCharPx, 7);
  const policy = inputs.policy ?? { kind: "legacy" };

  switch (policy.kind) {
    case "legacy": {
      const raw = Math.floor((pathLenPx / avgCharPx) * 1.05);
      const chars = Math.min(CHAR_HARD_CAP, Math.max(40, raw));
      return { text: fillToLength(text, chars), chars };
    }
    case "repeat-measured": {
      const overfill = safePositive(policy.overfill ?? 1.0, 1.0);
      const raw = Math.floor((pathLenPx / avgCharPx) * overfill);
      const chars = Math.min(CHAR_HARD_CAP, Math.max(1, raw));
      return { text: fillToLength(text, chars), chars };
    }
    case "fit-once": {
      const underfill = safePositive(policy.underfill ?? 1.0, 1.0);
      const raw = Math.floor((pathLenPx / avgCharPx) * underfill);
      const capacity = Math.min(CHAR_HARD_CAP, Math.max(1, raw));
      const trimmed = text.trim();
      // Truncate at a word boundary when possible so we don't end mid-word.
      if (trimmed.length <= capacity) return { text: trimmed, chars: capacity };
      const sliced = trimmed.slice(0, capacity);
      const lastSpace = sliced.lastIndexOf(" ");
      const cut = lastSpace > capacity * 0.6 ? lastSpace : capacity;
      return { text: sliced.slice(0, cut), chars: capacity };
    }
  }
}

/**
 * Apply case transform then run {@link computeFilledText}. Convenience wrapper
 * that mirrors the call sequence in `Canvas.tsx`.
 */
export function buildShapeText(opts: {
  rawText: string;
  textCase: "as-is" | "upper" | "lower" | "title";
  pathLenPx: number;
  avgCharPx: number;
  policy?: FillPolicy;
}): { text: string; chars: number } {
  const cooked = applyCase(opts.rawText || "Begin with a sentence.", opts.textCase);
  return computeFilledText({
    text: cooked,
    pathLenPx: opts.pathLenPx,
    avgCharPx: opts.avgCharPx,
    policy: opts.policy,
  });
}
