import {
  Undo2,
  Redo2,
  ChevronDown,
  Moon as MoonIcon,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
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
  isMobile?: boolean;
}

export function Toolbar(props: Props) {
  if (props.isMobile) return <MobileToolbar {...props} />;
  return <DesktopToolbar {...props} />;
}

function DesktopToolbar(props: Props) {
  return (
    <header className="h-[48px] flex-none border-b border-border/60 bg-background/85 backdrop-blur-xl z-40 relative">
      <div className="h-full px-4 flex items-center gap-3">
        <UtoWordmark />

        <div className="h-4 w-px bg-border/80 mx-1" />

        <input
          value={props.projectName}
          onChange={(e) => props.onProjectNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          placeholder="Symphony no 5"
          className="text-[12.5px] font-medium text-foreground bg-transparent border-b border-transparent hover:border-foreground/20 focus:border-foreground focus:outline-none py-0.5 w-[200px] placeholder:text-muted-foreground/70 transition-colors"
          data-testid="input-project-name"
          aria-label="Composition name"
        />

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
              className="h-8 px-2.5 rounded-md flex items-center gap-1.5 hover:bg-foreground/[.05] focus:outline-none transition-colors"
              data-testid="button-form"
            >
              <span className={LABEL_CLASS} style={LABEL_STYLE}>
                Compositions
              </span>
              <ChevronDown size={11} className="text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[260px] p-1.5">
            <div className="grid grid-cols-2 gap-0.5 px-1 py-1">
              {SHAPE_LIST.map((meta) => {
                const active = meta.id === props.activeShape;
                return (
                  <button
                    key={meta.id}
                    onClick={() => props.onPickShape(meta.id)}
                    data-testid={`shape-${meta.id}`}
                    className={
                      "h-7 px-2.5 rounded text-left text-[12px] font-medium transition-colors focus:outline-none " +
                      (active
                        ? "bg-primary text-primary-foreground"
                        : "text-[#716e6e] hover:bg-foreground/[.05]")
                    }
                    style={{ letterSpacing: "1.10px" }}
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
          className="h-8 px-2.5 rounded-md flex items-center hover:bg-foreground/[.05] focus:outline-none transition-colors"
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
              className="h-8 px-2.5 rounded-md flex items-center hover:bg-foreground/[.05] focus:outline-none transition-colors"
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
          className="h-8 w-8 rounded-md flex items-center justify-center text-[#716e6e] hover:bg-foreground/[.05] focus:outline-none transition-colors"
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

function MobileToolbar(props: Props) {
  return (
    <header className="h-[52px] flex-none border-b border-border/60 bg-background/90 backdrop-blur-xl z-40 relative">
      <div className="h-full px-3 flex items-center gap-2">
        <UtoWordmark />

        <input
          value={props.projectName}
          onChange={(e) => props.onProjectNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          placeholder="Symphony no 5"
          className="flex-1 min-w-0 text-[13px] font-medium text-foreground bg-transparent border-b border-transparent hover:border-foreground/20 focus:border-foreground focus:outline-none py-1 placeholder:text-muted-foreground/70 transition-colors truncate"
          data-testid="input-project-name"
          aria-label="Composition name"
        />

        <button
          type="button"
          onClick={props.onUndo}
          disabled={!props.canUndo}
          aria-label="Undo"
          data-testid="button-undo"
          className="h-9 w-9 rounded-md flex items-center justify-center text-foreground/85 hover:bg-foreground/[.05] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Undo2 size={17} strokeWidth={1.6} />
        </button>
        <button
          type="button"
          onClick={props.onRedo}
          disabled={!props.canRedo}
          aria-label="Redo"
          data-testid="button-redo"
          className="h-9 w-9 rounded-md flex items-center justify-center text-foreground/85 hover:bg-foreground/[.05] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Redo2 size={17} strokeWidth={1.6} />
        </button>

        <SaveControls status={props.saveStatus} onSave={props.onSave} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="More actions"
              className="h-9 w-9 rounded-md flex items-center justify-center text-foreground/85 hover:bg-foreground/[.05] transition-colors"
              data-testid="button-more"
            >
              <MoreHorizontal size={18} strokeWidth={1.7} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[240px] p-1.5">
            <DropdownMenuItem
              onSelect={props.onOpenLibrary}
              className="text-[13px] h-10 px-3"
              data-testid="button-library"
            >
              Library
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="px-3 py-1 text-[9.5px] uppercase tracking-[0.22em] text-muted-foreground font-semibold">
              Export
            </DropdownMenuLabel>
            <DropdownMenuItem
              onSelect={props.onExportSvg}
              className="text-[12.5px] h-9 px-3"
              data-testid="export-svg"
            >
              SVG
              <span className="ml-auto text-[10px] text-muted-foreground num-tab">
                900×560
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={props.onCopySvg}
              className="text-[12.5px] h-9 px-3"
              data-testid="copy-svg"
            >
              Copy SVG
              <span className="ml-auto text-[10px] text-muted-foreground">
                clipboard
              </span>
            </DropdownMenuItem>
            {([1, 2, 4] as const).map((s) => (
              <DropdownMenuItem
                key={s}
                onSelect={() => props.onExportPng(s)}
                className="text-[12.5px] h-9 px-3"
                data-testid={`export-png-${s}x`}
              >
                {`PNG · ${s}×`}
                <span className="ml-auto text-[10px] text-muted-foreground num-tab">
                  {`${900 * s}×${560 * s}`}
                </span>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onSelect={props.onToggleDark}
              className="text-[12.5px] h-9 px-3 gap-2"
              data-testid="button-theme"
            >
              <MoonIcon size={14} strokeWidth={1.6} />
              {props.isDark ? "Light theme" : "Dark theme"}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <div className="px-2 py-1">
              <AccountChip />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
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
          className="h-8 w-8 rounded-md flex items-center justify-center text-foreground/85 hover:bg-foreground/[.05] hover:text-foreground focus:outline-none transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
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
