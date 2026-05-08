/**
 * Text utilities for the UTO typography engine.
 * Pure functions only — no DOM access — so they can be unit tested.
 */

export function applyCase(text: string, mode: "as-is" | "upper" | "lower" | "title"): string {
  switch (mode) {
    case "upper":
      return text.toUpperCase();
    case "lower":
      return text.toLowerCase();
    case "title":
      return text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    default:
      return text;
  }
}

/** Repeat the text enough times to cover an estimated path length, so paths never look starved. */
export function fillToLength(text: string, estimatedChars: number): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  if (trimmed.length >= estimatedChars) return trimmed;
  const sep = "  ";
  const unit = sep + trimmed;
  const reps = Math.ceil((estimatedChars - trimmed.length) / unit.length);
  return trimmed + unit.repeat(reps);
}

/** Split prose into word tokens preserving punctuation. */
export function tokenize(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

/** Measure approximate width of a text string in average glyph widths (used for shape-aware wrapping). */
export function approxCharWidth(fontSize: number): number {
  // Garamond-ish proportion: average glyph is ~0.48 of em.
  return fontSize * 0.48;
}

/** Wrap words to fit a line of width `maxWidth` (in pixels). */
export function wrapWords(words: string[], maxWidth: number, charWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const candidate = line ? `${line} ${w}` : w;
    if (candidate.length * charWidth <= maxWidth) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      // If the word itself is too long, force-break.
      if (w.length * charWidth > maxWidth && maxWidth > charWidth * 2) {
        const charsPerLine = Math.max(1, Math.floor(maxWidth / charWidth));
        for (let i = 0; i < w.length; i += charsPerLine) {
          lines.push(w.slice(i, i + charsPerLine));
        }
        line = "";
      } else {
        line = w;
      }
    }
  }
  if (line) lines.push(line);
  return lines;
}
