import {
  Spline,
  Infinity as InfinityIcon,
  Radio,
  Heart,
  Star,
  Sun,
  Moon,
  Bird,
  Music2,
  Wind,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SHAPE_LIST } from "@/lib/shapes";
import type { ShapeId } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS: Record<ShapeId, typeof Spline> = {
  spiral: Spline,
  fibonacci: InfinityIcon,
  echo: Radio,
  heart: Heart,
  star: Star,
  sun: Sun,
  moon: Moon,
  bird: Bird,
  cello: Music2,
  mongolfiere: Wind,
};

interface Props {
  active: ShapeId;
  onPick: (id: ShapeId) => void;
}

export function LeftRail({ active, onPick }: Props) {
  return (
    <aside className="w-[56px] flex-none border-r border-border/60 bg-background/40 flex flex-col items-center py-3 gap-px">
      <div className="text-[8.5px] tracking-[0.28em] uppercase text-muted-foreground/80 font-semibold mb-2 mt-1 [writing-mode:vertical-rl] rotate-180 h-9 flex items-center">
        Form
      </div>

      <nav className="flex flex-col gap-0.5 mt-2">
        {SHAPE_LIST.map((meta) => {
          const Icon = ICONS[meta.id];
          const isActive = meta.id === active;
          return (
            <Tooltip key={meta.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onPick(meta.id)}
                  data-testid={`shape-${meta.id}`}
                  className={cn(
                    "relative h-10 w-10 rounded-md flex items-center justify-center transition-colors group",
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/[.05]"
                  )}
                >
                  <Icon size={16} strokeWidth={isActive ? 2 : 1.6} />
                  {isActive ? (
                    <span className="absolute -left-[8px] top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-full bg-foreground" />
                  ) : null}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10} className="max-w-[260px]">
                <div className="font-medium text-[12px] text-foreground">{meta.name}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{meta.blurb}</div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      <div className="flex-1" />
      <div className="text-[8.5px] tracking-[0.18em] text-muted-foreground/50 uppercase font-medium pb-1 num-tab">
        v0.1
      </div>
    </aside>
  );
}
