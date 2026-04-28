import { useState } from "react";
import {
  Undo2,
  Redo2,
  Dices,
  Sparkles,
  Download,
  Info,
  ChevronDown,
  Sun as SunIcon,
  Moon as MoonIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

interface Props {
  projectName: string;
  onProjectNameChange: (s: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onRandomize: () => void;
  onPreset: (p: Preset) => void;
  onExportSvg: () => void;
  onCopySvg: () => void;
  onExportPng: (scale: 1 | 2 | 4) => void;
  onShowMath: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  undoDepth: number;
}

export function Toolbar(props: Props) {
  const [editingName, setEditingName] = useState(false);
  return (
    <header className="h-[52px] flex-none border-b border-border/70 glass-strong z-40 relative">
      <div className="h-full px-4 flex items-center gap-3">
        <UtoWordmark />
        <div className="h-5 w-px bg-border/80 mx-1" />
        <div className="flex items-center gap-2">
          {editingName ? (
            <input
              autoFocus
              value={props.projectName}
              onChange={(e) => props.onProjectNameChange(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
              className="text-[13px] font-medium bg-muted/40 px-2 py-1 rounded border border-ring/40 focus:outline-none focus:border-ring w-[200px]"
              data-testid="input-project-name"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingName(true)}
              className="text-[13px] font-medium text-foreground hover-elevate px-2 py-1 rounded transition-colors"
              data-testid="button-project-name"
            >
              {props.projectName}
            </button>
          )}
          <span className="text-[11px] text-muted-foreground font-normal num-tab">
            900 × 560 · 100%
          </span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={props.onUndo}
                disabled={!props.canUndo}
                data-testid="button-undo"
                className="h-9 w-9"
              >
                <Undo2 size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo · ⌘Z</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={props.onRedo}
                disabled={!props.canRedo}
                data-testid="button-redo"
                className="h-9 w-9"
              >
                <Redo2 size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo · ⌘⇧Z</TooltipContent>
          </Tooltip>
          <span className="text-[10px] text-muted-foreground font-normal num-tab w-8 text-center">
            {props.undoDepth > 0 ? `${props.undoDepth}↶` : ""}
          </span>
        </div>

        <div className="h-5 w-px bg-border/80" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={props.onRandomize}
              className="h-9 w-9"
              data-testid="button-randomize"
            >
              <Dices size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Randomize · R</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-3 gap-1.5 text-[12px] font-medium"
              data-testid="button-presets"
            >
              <Sparkles size={14} />
              Presets
              <ChevronDown size={12} className="text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
              Presets
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {PRESETS.map((p) => (
              <DropdownMenuItem
                key={p.id}
                onSelect={() => props.onPreset(p)}
                className="flex flex-col items-start gap-0.5 cursor-pointer py-2"
                data-testid={`preset-${p.id}`}
              >
                <span className="text-[13px] font-medium text-foreground">{p.name}</span>
                <span className="text-[11px] text-muted-foreground font-normal">
                  {p.description}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={props.onShowMath}
              className="h-9 w-9"
              data-testid="button-math"
            >
              <Info size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Show the math behind this shape</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={props.onToggleDark}
              className="h-9 w-9"
              data-testid="button-theme"
            >
              {props.isDark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle theme</TooltipContent>
        </Tooltip>

        <div className="h-5 w-px bg-border/80" />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              className="h-9 px-3.5 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-[12px]"
              data-testid="button-export"
            >
              <Download size={14} />
              Export
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 p-2">
            <div className="px-2 py-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
              Export
            </div>
            <div className="space-y-0.5">
              <button
                onClick={props.onExportSvg}
                className="w-full flex items-center justify-between gap-3 rounded-md px-2 py-2 text-[13px] hover-elevate active-elevate-2 transition-colors"
                data-testid="export-svg"
              >
                <span className="font-medium text-foreground">SVG</span>
                <span className="text-[10px] text-muted-foreground">vector · 900×560</span>
              </button>
              <button
                onClick={props.onCopySvg}
                className="w-full flex items-center justify-between gap-3 rounded-md px-2 py-2 text-[13px] hover-elevate active-elevate-2 transition-colors"
                data-testid="copy-svg"
              >
                <span className="font-medium text-foreground">Copy SVG</span>
                <span className="text-[10px] text-muted-foreground">to clipboard</span>
              </button>
              <div className="my-1 h-px bg-border" />
              {([1, 2, 4] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => props.onExportPng(s)}
                  className="w-full flex items-center justify-between gap-3 rounded-md px-2 py-2 text-[13px] hover-elevate active-elevate-2 transition-colors"
                  data-testid={`export-png-${s}x`}
                >
                  <span className="font-medium text-foreground">PNG · {s}×</span>
                  <span className="text-[10px] text-muted-foreground num-tab">
                    {900 * s} × {560 * s}
                  </span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
