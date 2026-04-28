import { useState } from "react";
import {
  Undo2,
  Redo2,
  Download,
  ChevronDown,
  Moon as MoonIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
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
import { AccountChip } from "./AccountChip";
import { SaveControls, type SaveStatus } from "./SaveControls";
import { SHAPE_LIST } from "@/lib/shapes";
import type { ShapeId } from "@/lib/types";

interface Props {
  projectName: string;
  onProjectNameChange: (s: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  activeShape: ShapeId;
  onPickShape: (id: ShapeId) => void;
  onExportSvg: () => void;
  onCopySvg: () => void;
  onExportPng: (scale: 1 | 2 | 4) => void;
  isDark: boolean;
  onToggleDark: () => void;
  undoDepth: number;
  saveStatus: SaveStatus;
  onSave: () => void;
  onOpenLibrary: () => void;
}

export function Toolbar(props: Props) {
  const [editingName, setEditingName] = useState(false);

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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="h-8 px-2.5 rounded-md flex items-center gap-1.5 hover:bg-foreground/[.05] transition-colors"
              data-testid="button-form"
            >
              <span className={LABEL_CLASS} style={LABEL_STYLE}>
                Form
              </span>
              <ChevronDown size={11} className="text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[260px] p-1.5">
            <div className="px-2.5 py-1.5 flex items-baseline justify-between">
              <span className="text-[9.5px] uppercase tracking-[0.22em] text-muted-foreground font-semibold">
                Form
              </span>
              <span className="text-[10px] text-muted-foreground/60 num-tab">
                {SHAPE_LIST.length} · [ ]
              </span>
            </div>
            <div className="grid grid-cols-2 gap-0.5 px-1 pb-1">
              {SHAPE_LIST.map((meta) => {
                const active = meta.id === props.activeShape;
                return (
                  <button
                    key={meta.id}
                    onClick={() => props.onPickShape(meta.id)}
                    data-testid={`shape-${meta.id}`}
                    className={
                      "h-7 px-2.5 rounded text-left text-[12px] font-medium transition-colors " +
                      (active
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-foreground/[.05]")
                    }
                  >
                    {meta.name}
                  </button>
                );
              })}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          type="button"
          onClick={props.onOpenLibrary}
          className="h-8 px-2.5 rounded-md flex items-center hover:bg-foreground/[.05] transition-colors"
          data-testid="button-library"
        >
          <span className={LABEL_CLASS} style={LABEL_STYLE}>
            Library
          </span>
        </button>

        <SaveControls status={props.saveStatus} onSave={props.onSave} />

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="h-8 px-2.5 rounded-md flex items-center hover:bg-foreground/[.05] transition-colors"
              data-testid="button-export"
            >
              <span className={LABEL_CLASS} style={LABEL_STYLE}>
                Export
              </span>
            </button>
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

        <button
          type="button"
          onClick={props.onToggleDark}
          aria-pressed={props.isDark}
          aria-label="Toggle theme"
          className="h-8 w-8 rounded-md flex items-center justify-center text-[#716e6e] hover:bg-foreground/[.05] transition-colors"
          data-testid="button-theme"
        >
          <MoonIcon size={16} strokeWidth={1.6} />
        </button>

        <div className="h-4 w-px bg-border/80 mx-0.5" />

        <AccountChip />
      </div>
    </header>
  );
}

const LABEL_CLASS = "font-serif text-[20px] font-bold text-[#716e6e]";
const LABEL_STYLE = { letterSpacing: "1.1px" };

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
          className="h-8 w-8 rounded-md flex items-center justify-center text-foreground/85 hover:bg-foreground/[.05] hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
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
