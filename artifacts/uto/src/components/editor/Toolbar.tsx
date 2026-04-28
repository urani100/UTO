import { useState } from "react";
import {
  Undo2,
  Redo2,
  Dices,
  Layers,
  Download,
  Info,
  ChevronDown,
  Sun as SunIcon,
  Moon as MoonIcon,
  Spline,
  Infinity as InfinityIcon,
  Radio,
  Heart,
  Star,
  Sun as SunOutline,
  Moon as MoonOutline,
  Bird,
  Music2,
  Wind,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UtoWordmark } from "./Logo";
import { PRESETS, type Preset } from "@/lib/presets";
import { SHAPE_LIST, SHAPE_META } from "@/lib/shapes";
import type { ShapeId } from "@/lib/types";

interface Props {
  projectName: string;
  onProjectNameChange: (s: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onRandomize: () => void;
  onPreset: (p: Preset) => void;
  activePresetId: string | null;
  activeShape: ShapeId;
  onPickShape: (id: ShapeId) => void;
  onExportSvg: () => void;
  onCopySvg: () => void;
  onExportPng: (scale: 1 | 2 | 4) => void;
  onShowMath: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  undoDepth: number;
}

const SHAPE_ICONS: Record<ShapeId, typeof Spline> = {
  spiral: Spline,
  fibonacci: InfinityIcon,
  echo: Radio,
  heart: Heart,
  star: Star,
  sun: SunOutline,
  moon: MoonOutline,
  bird: Bird,
  cello: Music2,
  mongolfiere: Wind,
};

export function Toolbar(props: Props) {
  const [editingName, setEditingName] = useState(false);
  const activePreset = props.activePresetId
    ? PRESETS.find((p) => p.id === props.activePresetId)
    : null;
  const activeShapeMeta = SHAPE_META[props.activeShape];
  const triggerLabel = activePreset?.name ?? activeShapeMeta.name;

  return (
    <header className="h-[48px] flex-none border-b border-border/60 bg-background/85 backdrop-blur-xl z-40 relative">
      <div className="h-full px-4 flex items-center gap-3">
        <UtoWordmark />

        <div className="h-4 w-px bg-border/80 mx-1" />

        {editingName ? (
          <input
            autoFocus
            value={props.projectName}
            onChange={(e) => props.onProjectNameChange(e.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            className="text-[12.5px] font-medium bg-transparent border-b border-foreground/40 focus:border-foreground focus:outline-none py-0.5 w-[180px]"
            data-testid="input-project-name"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditingName(true)}
            className="text-[12.5px] font-medium text-foreground hover:bg-foreground/[.04] -mx-1.5 px-1.5 py-1 rounded transition-colors"
            data-testid="button-project-name"
          >
            {props.projectName}
          </button>
        )}

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <IconBtn
            label="Undo · ⌘Z"
            onClick={props.onUndo}
            disabled={!props.canUndo}
            testId="button-undo"
          >
            <Undo2 size={15} strokeWidth={1.6} />
          </IconBtn>
          <IconBtn
            label="Redo · ⌘⇧Z"
            onClick={props.onRedo}
            disabled={!props.canRedo}
            testId="button-redo"
          >
            <Redo2 size={15} strokeWidth={1.6} />
          </IconBtn>
        </div>

        <div className="h-4 w-px bg-border/80 mx-0.5" />

        <IconBtn label="Randomize · R" onClick={props.onRandomize} testId="button-randomize">
          <Dices size={15} strokeWidth={1.6} />
        </IconBtn>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="h-8 px-2.5 rounded-md flex items-center gap-1.5 text-[12px] font-medium text-foreground hover:bg-foreground/[.05] transition-colors min-w-[120px]"
              data-testid="button-presets"
            >
              <Layers size={13} strokeWidth={1.6} />
              <span className="truncate">{triggerLabel}</span>
              <ChevronDown size={11} className="text-muted-foreground ml-auto" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[300px] p-0">
            <div className="p-1.5">
              <div className="px-2.5 py-1.5 flex items-baseline justify-between">
                <span className="text-[9.5px] uppercase tracking-[0.22em] text-muted-foreground font-semibold">
                  Form
                </span>
                <span className="text-[10px] text-muted-foreground/60 num-tab">
                  {SHAPE_LIST.length} shapes · [ ]
                </span>
              </div>
              <div className="grid grid-cols-5 gap-0.5 px-1 pb-1">
                {SHAPE_LIST.map((meta) => {
                  const Icon = SHAPE_ICONS[meta.id];
                  const active = meta.id === props.activeShape;
                  return (
                    <Tooltip key={meta.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => props.onPickShape(meta.id)}
                          data-testid={`shape-${meta.id}`}
                          className={
                            "h-12 rounded-md flex flex-col items-center justify-center gap-0.5 transition-colors " +
                            (active
                              ? "bg-foreground text-background"
                              : "text-muted-foreground hover:text-foreground hover:bg-foreground/[.05]")
                          }
                        >
                          <Icon size={15} strokeWidth={active ? 2 : 1.6} />
                          <span className="text-[8.5px] uppercase tracking-[0.12em] font-medium leading-none">
                            {meta.name.slice(0, 3)}
                          </span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" sideOffset={6} className="max-w-[240px]">
                        <div className="font-medium text-[12px]">{meta.name}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                          {meta.blurb}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-border/70 mx-1.5" />

            <div className="p-1.5">
              <div className="px-2.5 py-1.5 flex items-baseline justify-between">
                <span className="text-[9.5px] uppercase tracking-[0.22em] text-muted-foreground font-semibold">
                  Preset
                </span>
                <span className="text-[10px] text-muted-foreground/60 num-tab">
                  {PRESETS.length} compositions
                </span>
              </div>
              <div className="max-h-[260px] overflow-y-auto nice-scroll">
                {PRESETS.map((p) => {
                  const active = props.activePresetId === p.id;
                  return (
                    <DropdownMenuItem
                      key={p.id}
                      onSelect={() => props.onPreset(p)}
                      className={
                        "flex items-start gap-2.5 cursor-pointer py-1.5 px-2.5 rounded " +
                        (active ? "bg-foreground/[.06]" : "")
                      }
                      data-testid={`preset-${p.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[12.5px] font-medium text-foreground truncate">
                            {p.name}
                          </span>
                          <span className="text-[9.5px] text-muted-foreground/65 uppercase tracking-[0.16em] font-medium">
                            {p.shape}
                          </span>
                        </div>
                        <div className="text-[10.5px] text-muted-foreground font-normal leading-snug mt-0.5 truncate">
                          {p.description}
                        </div>
                      </div>
                      {active ? (
                        <Check size={12} className="text-foreground/70 mt-1 flex-none" />
                      ) : null}
                    </DropdownMenuItem>
                  );
                })}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <IconBtn label="Show the math" onClick={props.onShowMath} testId="button-math">
          <Info size={14} strokeWidth={1.6} />
        </IconBtn>

        <IconBtn label="Toggle theme" onClick={props.onToggleDark} testId="button-theme">
          {props.isDark ? (
            <SunIcon size={14} strokeWidth={1.6} />
          ) : (
            <MoonIcon size={14} strokeWidth={1.6} />
          )}
        </IconBtn>

        <div className="h-4 w-px bg-border/80 mx-0.5" />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              className="h-8 px-3 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-[12px] rounded-md shadow-sm"
              data-testid="button-export"
            >
              <Download size={13} strokeWidth={2} />
              Export
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[240px] p-1.5">
            <div className="px-2.5 py-1.5 text-[9.5px] uppercase tracking-[0.22em] text-muted-foreground font-semibold">
              Export
            </div>
            <div className="space-y-0.5">
              <ExportRow label="SVG" sub="vector · 900×560" onClick={props.onExportSvg} testId="export-svg" />
              <ExportRow label="Copy SVG" sub="to clipboard" onClick={props.onCopySvg} testId="copy-svg" />
              <div className="my-1 mx-2 h-px bg-border" />
              {([1, 2, 4] as const).map((s) => (
                <ExportRow
                  key={s}
                  label={`PNG · ${s}×`}
                  sub={`${900 * s} × ${560 * s}`}
                  onClick={() => props.onExportPng(s)}
                  testId={`export-png-${s}x`}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  testId,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  testId: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          data-testid={testId}
          className="h-8 w-8 rounded-md flex items-center justify-center text-foreground/85 hover:bg-foreground/[.05] hover:text-foreground active:bg-foreground/[.08] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function ExportRow({
  label,
  sub,
  onClick,
  testId,
}: {
  label: string;
  sub: string;
  onClick: () => void;
  testId: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-[12.5px] hover:bg-foreground/[.05] transition-colors"
      data-testid={testId}
    >
      <span className="font-medium text-foreground">{label}</span>
      <span className="text-[10px] text-muted-foreground num-tab">{sub}</span>
    </button>
  );
}
