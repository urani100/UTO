import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
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
    <section className="border-b border-border/70 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3 hover-elevate active-elevate-2 transition-colors"
        data-testid={`inspector-section-${title.toLowerCase()}`}
      >
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] tracking-[0.22em] uppercase font-semibold text-foreground">
            {title}
          </span>
          {hint ? (
            <span className="text-[10px] text-muted-foreground font-normal lowercase tracking-normal">
              {hint}
            </span>
          ) : null}
        </div>
        <ChevronDown
          size={14}
          className={cn(
            "text-muted-foreground transition-transform duration-200",
            open ? "rotate-0" : "-rotate-90"
          )}
        />
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
            <div className="px-5 pb-5 pt-1 space-y-4">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
