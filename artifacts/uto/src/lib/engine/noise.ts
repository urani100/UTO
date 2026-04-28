import { createNoise2D } from "simplex-noise";

const noise = createNoise2D(() => 0.42);

/**
 * Sample 2D Simplex / Perlin noise in [-1, 1].
 * Used for tangential jitter so neighboring glyphs flow together rather than scatter (white noise).
 */
export function sampleNoise(x: number, y: number, scale = 0.04): number {
  return noise(x * scale, y * scale);
}
