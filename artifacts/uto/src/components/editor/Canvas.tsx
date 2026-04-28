import { forwardRef, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CanvasState, ShapeRender } from "@/lib/types";
import { CANVAS_H, CANVAS_W } from "@/lib/types";
import { renderShape } from "@/lib/shapes";
import { applyCase, fillToLength } from "@/lib/engine/text";
import { sampleNoise } from "@/lib/engine/noise";

interface Props {
  state: CanvasState;
  onMetaUpdate: (m: { chars: number; pathLen: number; ms: number }) => void;
}

export const Canvas = forwardRef<SVGSVGElement, Props>(function Canvas({ state, onMetaUpdate }, ref) {
  const [debounced, setDebounced] = useState(state);

  // 50ms debounce per the spec — "heavy path recalculations debounced 50ms".
  useEffect(() => {
    const t = setTimeout(() => setDebounced(state), 50);
    return () => clearTimeout(t);
  }, [state]);

  const render: ShapeRender = useMemo(() => {
    const t0 = performance.now();
    const r = renderShape(debounced);
    const t1 = performance.now();
    queueMicrotask(() =>
      onMetaUpdate({
        chars: debounced.text.length,
        pathLen: estimatePathLen(r),
        ms: t1 - t0,
      })
    );
    return r;
  }, [debounced, onMetaUpdate]);

  const cooked = applyCase(debounced.text || "Begin with a sentence.", debounced.textCase);
  const paths = render.paths ?? [];
  const lines = render.lines ?? [];
  const rays = render.rays ?? [];

  return (
    <div className="relative w-full h-full flex items-center justify-center px-8 py-6">
      {debounced.showGrid ? (
        <div
          className="absolute inset-0 grid-paper opacity-60 pointer-events-none"
          aria-hidden
        />
      ) : null}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={debounced.shape}
          initial={{ opacity: 0, scale: 0.985, filter: "blur(6px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 1.015, filter: "blur(6px)" }}
          transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
          className="relative shadow-xl rounded-md overflow-hidden border border-border/80"
          style={{
            width: "min(100%, 900px)",
            aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
            background: debounced.backgroundMode === "transparent" ? "transparent" : debounced.backgroundColor,
          }}
        >
          <svg
            ref={ref}
            viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid meet"
            data-testid="canvas-svg"
          >
            <rect
              x={0}
              y={0}
              width={CANVAS_W}
              height={CANVAS_H}
              fill={debounced.backgroundMode === "transparent" ? "none" : debounced.backgroundColor}
            />

            {/* Guide silhouette */}
            {debounced.showGuide && render.guide ? (
              <path
                d={render.guide}
                fill="none"
                stroke={debounced.textColor}
                strokeOpacity={0.12}
                strokeWidth={1}
              />
            ) : null}

            {/* Decoration (e.g. ropes / basket) */}
            {render.decoration ? (
              <path
                d={render.decoration}
                fill="none"
                stroke={debounced.textColor}
                strokeOpacity={0.7}
                strokeWidth={1.1}
              />
            ) : null}

            <g
              transform={`translate(${CANVAS_W / 2 + debounced.offsetX} ${CANVAS_H / 2 + debounced.offsetY}) rotate(${debounced.rotation}) scale(${debounced.scale}) translate(${-CANVAS_W / 2} ${-CANVAS_H / 2})`}
            >
              {/* path-based textPath glyphs */}
              {paths.length ? (
                <>
                  <defs>
                    {paths.map((p) => (
                      <path key={p.id} id={p.id} d={p.d} />
                    ))}
                  </defs>
                  {paths.map((p) => {
                    // Estimate how much text we need to fill the path.
                    const estimateChars = Math.max(40, Math.floor((approxLen(p.d) / (debounced.fontSize * p.fontScale * 0.5)) * 1.05));
                    const filled = fillToLength(cooked, estimateChars);
                    return (
                      <text
                        key={p.id}
                        fill={debounced.textColor}
                        opacity={p.opacity}
                        fontFamily={debounced.fontFamily}
                        fontSize={debounced.fontSize * p.fontScale}
                        fontWeight={debounced.weight}
                        fontStyle={debounced.italic ? "italic" : "normal"}
                        letterSpacing={debounced.letterSpacing}
                      >
                        <textPath
                          href={`#${p.id}`}
                          startOffset={0}
                          spacing="auto"
                          method="align"
                        >
                          {debounced.jitter > 0
                            ? renderJitterTspans(filled, debounced.jitter, debounced.jitterScale, p.id)
                            : filled}
                        </textPath>
                      </text>
                    );
                  })}
                </>
              ) : null}

              {/* shape-fill lines */}
              {lines.map((line, idx) => (
                <text
                  key={`line-${idx}`}
                  x={line.x}
                  y={line.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={debounced.textColor}
                  fontFamily={debounced.fontFamily}
                  fontSize={debounced.fontSize * line.fontScale}
                  fontWeight={debounced.weight}
                  fontStyle={debounced.italic ? "italic" : "normal"}
                  letterSpacing={debounced.letterSpacing}
                >
                  {applyCase(line.text, debounced.textCase)}
                </text>
              ))}

              {/* rays */}
              {rays.map((r) => {
                const x2 = r.cx + Math.cos(r.angle) * r.length;
                const y2 = r.cy + Math.sin(r.angle) * r.length;
                const id = r.id;
                return (
                  <g key={id}>
                    <defs>
                      <path
                        id={id}
                        d={`M ${r.cx + Math.cos(r.angle) * 10} ${r.cy + Math.sin(r.angle) * 10} L ${x2} ${y2}`}
                      />
                    </defs>
                    <text
                      fill={debounced.textColor}
                      fontFamily={debounced.fontFamily}
                      fontSize={debounced.fontSize * r.fontScale}
                      fontWeight={debounced.weight}
                      letterSpacing={debounced.letterSpacing}
                    >
                      <textPath href={`#${id}`} startOffset={0} spacing="auto">
                        {applyCase(r.text, debounced.textCase)}
                      </textPath>
                    </text>
                  </g>
                );
              })}

              {/* If no content at all (no paths, no lines, no rays) show a quiet placeholder */}
              {!paths.length && !lines.length && !rays.length ? (
                <text
                  x={CANVAS_W / 2}
                  y={CANVAS_H / 2}
                  textAnchor="middle"
                  fontFamily={debounced.fontFamily}
                  fontSize={18}
                  fill={debounced.textColor}
                  opacity={0.4}
                  fontStyle="italic"
                >
                  Begin with a sentence.
                </text>
              ) : null}
            </g>
          </svg>
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

function approxLen(d: string): number {
  // Quick heuristic: count L/C/M segments and multiply by avg seg length.
  // Falls back to 1200 if we can't tell.
  const cmds = d.split(/[MLCAQHVZ]/i).length;
  return Math.max(400, cmds * 18);
}

function renderJitterTspans(text: string, intensity: number, scale: number, seed: string) {
  const seedNum = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const dy: string[] = [];
  for (let i = 0; i < text.length; i++) {
    const n = sampleNoise(i + seedNum, seedNum * 0.3, scale);
    dy.push((n * intensity).toFixed(2));
  }
  return (
    <tspan dy={dy.join(" ")}>{text}</tspan>
  );
}

function estimatePathLen(r: ShapeRender): number {
  let len = 0;
  for (const p of r.paths ?? []) len += approxLen(p.d);
  for (const ray of r.rays ?? []) len += ray.length;
  return Math.round(len);
}
