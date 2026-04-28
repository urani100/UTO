import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { ShapeId } from "@/lib/types";
import { SHAPE_META } from "@/lib/shapes";

interface Props {
  open: boolean;
  shape: ShapeId;
  onClose: () => void;
}

export function MathPanel({ open, shape, onClose }: Props) {
  const meta = SHAPE_META[shape];
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-50"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: 360, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 360, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            className="fixed right-0 top-0 bottom-0 w-[360px] bg-card border-l border-border z-50 shadow-2xl flex flex-col"
            data-testid="math-panel"
          >
            <header className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-muted-foreground">
                  Behind the curve
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-md flex items-center justify-center hover-elevate text-muted-foreground"
                data-testid="button-close-math"
              >
                <X size={16} />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto nice-scroll px-6 py-6 space-y-6">
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium mb-1">
                  Shape
                </div>
                <h2 className="font-display text-[28px] font-semibold tracking-tight">
                  {meta.name}
                </h2>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium mb-2">
                  Formula
                </div>
                <div className="font-serif italic text-[20px] py-3 px-4 bg-muted/40 rounded-md border border-border">
                  {meta.formula}
                </div>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium mb-2">
                  In plain language
                </div>
                <p className="text-[14px] leading-relaxed text-foreground font-serif">{meta.math}</p>
              </div>

              <div className="border-t border-border pt-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium mb-2">
                  How UTO renders it
                </div>
                <ul className="space-y-2 text-[13px] text-muted-foreground leading-relaxed">
                  <li className="flex gap-2">
                    <span className="text-foreground/60">·</span>
                    Geometry is computed in a normalized coordinate space, then mapped to the 900 × 560 canvas at render time.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-foreground/60">·</span>
                    The browser handles arc-length-aware glyph placement on every <code className="font-mono text-[11px] bg-muted/60 px-1 rounded">textPath</code>.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-foreground/60">·</span>
                    Jitter samples a 2-D simplex noise field — neighboring glyphs flow together rather than scatter.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-foreground/60">·</span>
                    Heavy recalculations are debounced 50 ms to keep the canvas at 60 fps while you drag.
                  </li>
                </ul>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
