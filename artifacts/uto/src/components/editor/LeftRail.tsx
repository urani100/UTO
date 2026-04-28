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
import { UtoMark } from "./Logo";

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
    <aside className="w-[68px] flex-none border-r border-border/70 bg-card/40 flex flex-col items-center py-3 gap-1">
      <div className="mb-2 mt-1">
        <UtoMark size={28} />
      </div>
      <div className="my-2 h-px w-8 bg-border" />
      <div className="px-2 mb-1">
        <span className="text-[9px] tracking-[0.24em] uppercase text-muted-foreground font-semibold rotate-90 origin-center">
          Form
        </span>
      </div>
      <nav className="flex flex-col gap-0.5 mt-1">
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
                    "h-12 w-12 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all relative",
                    "hover-elevate active-elevate-2",
                    isActive ? "bg-foreground text-background shadow-sm" : "text-muted-foreground"
                  )}
                >
                  <Icon size={17} strokeWidth={isActive ? 2 : 1.7} />
                  <span
                    className={cn(
                      "text-[8px] tracking-wider uppercase font-medium",
                      isActive ? "opacity-90" : "opacity-70"
                    )}
                  >
                    {meta.name.slice(0, 3)}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[240px]">
                <div className="font-medium text-[12px]">{meta.name}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{meta.blurb}</div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
      <div className="flex-1" />
      <div className="text-[8px] tracking-[0.16em] text-muted-foreground/70 uppercase font-medium pb-1">
        v0.1
      </div>
    </aside>
  );
}
