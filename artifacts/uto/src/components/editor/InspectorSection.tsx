import { useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  hint?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function InspectorSection({ title, hint, defaultOpen = true, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-border/55 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-foreground/[.025] transition-colors group"
        data-testid={`inspector-section-${title.toLowerCase()}`}
      >
        <div className="flex items-baseline gap-2.5">
          <ChevronRight
            size={11}
            className={cn(
              "text-muted-foreground/70 transition-transform duration-200",
              open ? "rotate-90" : "rotate-0"
            )}
          />
          <span className="text-[10.5px] tracking-[0.22em] uppercase font-black text-[#a5dd8f]">
            {title}
          </span>
          {hint ? (
            <span className="text-[10px] text-muted-foreground/80 font-normal lowercase tracking-normal">
              {hint}
            </span>
          ) : null}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-0 space-y-3.5">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
