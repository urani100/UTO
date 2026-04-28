import { Type } from "lucide-react";
import type { CanvasState, ShapeId } from "@/lib/types";
import { SHAPE_META } from "@/lib/shapes";
import { InspectorSection } from "./InspectorSection";
import { SliderInput } from "./SliderInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  state: CanvasState;
  onChange: (patch: Partial<CanvasState>) => void;
  onShapeParam: (key: string, v: number) => void;
}

const FONT_FAMILIES = [
  { label: "EB Garamond", value: '"EB Garamond", Georgia, serif' },
  { label: "Cormorant", value: '"Cormorant Garamond", Georgia, serif' },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Playfair Display", value: '"Playfair Display", serif' },
  { label: "Inter", value: '"Inter", sans-serif' },
  { label: "Space Grotesk", value: '"Space Grotesk", "Inter", sans-serif' },
  { label: "JetBrains Mono", value: '"JetBrains Mono", monospace' },
];

const SWATCHES = [
  "#1c1824",
  "#2d1f3d",
  "#3a1640",
  "#42234e",
  "#0f1a1a",
  "#5b3a1a",
  "#0c3b27",
  "#1a3852",
  "#7a2424",
  "#a64d8a",
];
const BG_SWATCHES = [
  "#f6f1e7",
  "#fbf6ec",
  "#f0eadb",
  "#eee7d4",
  "#f3eee2",
  "#1c1824",
  "#0f0d14",
  "#2a1f30",
  "#bdcfb7",
  "#e9d4e1",
];

export function RightInspector({ state, onChange, onShapeParam }: Props) {
  const meta = SHAPE_META[state.shape];

  return (
    <aside className="w-[336px] flex-none border-l border-border/70 glass overflow-y-auto nice-scroll relative z-10">
      <div className="px-5 pt-4 pb-3 border-b border-border/70 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-muted-foreground">
            Tone
          </span>
          <span className="text-[12px] font-medium text-foreground">{meta.name}</span>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-[10px] num-tab text-muted-foreground italic font-serif px-1.5 py-0.5 rounded bg-muted/40 cursor-default">
              {meta.formula}
            </span>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-[240px]">
            <span className="text-[11px]">{meta.math}</span>
          </TooltipContent>
        </Tooltip>
      </div>

      <InspectorSection title="Text" hint="prose, font, weight">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-medium">
              Prose
            </label>
            <span className="text-[10px] text-muted-foreground num-tab">
              {state.text.length} chars
            </span>
          </div>
          <Textarea
            value={state.text}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="Type or paste your text…"
            rows={5}
            className="text-[12px] font-serif leading-relaxed resize-y bg-background/60"
            data-testid="input-text"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-medium flex items-center gap-1">
            <Type size={11} /> Font
          </label>
          <Select value={state.fontFamily} onValueChange={(v) => onChange({ fontFamily: v })}>
            <SelectTrigger className="h-9 text-[12px]" data-testid="select-font">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_FAMILIES.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  <span style={{ fontFamily: f.value }}>{f.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <SliderInput
          label="Size"
          value={state.fontSize}
          min={8}
          max={42}
          step={1}
          unit="px"
          onChange={(v) => onChange({ fontSize: v })}
        />
        <SliderInput
          label="Weight"
          value={state.weight}
          min={100}
          max={800}
          step={100}
          onChange={(v) => onChange({ weight: v })}
        />
        <SliderInput
          label="Tracking"
          value={state.letterSpacing}
          min={-1}
          max={6}
          step={0.05}
          unit="px"
          onChange={(v) => onChange({ letterSpacing: v })}
        />

        <div className="flex items-center gap-3">
          <ToggleGroup
            type="single"
            value={state.textCase}
            onValueChange={(v) => v && onChange({ textCase: v as CanvasState["textCase"] })}
            className="bg-muted/40 rounded p-0.5"
          >
            <ToggleGroupItem value="as-is" className="h-7 px-2 text-[11px] font-serif" data-testid="case-asis">
              Aa
            </ToggleGroupItem>
            <ToggleGroupItem value="upper" className="h-7 px-2 text-[11px] font-serif" data-testid="case-upper">
              AA
            </ToggleGroupItem>
            <ToggleGroupItem value="lower" className="h-7 px-2 text-[11px] font-serif" data-testid="case-lower">
              aa
            </ToggleGroupItem>
            <ToggleGroupItem value="title" className="h-7 px-2 text-[11px] font-serif" data-testid="case-title">
              Tt
            </ToggleGroupItem>
          </ToggleGroup>
          <button
            type="button"
            onClick={() => onChange({ italic: !state.italic })}
            data-testid="button-italic"
            className={
              "h-7 w-7 rounded text-[12px] italic font-serif transition-colors hover-elevate active-elevate-2 " +
              (state.italic ? "bg-foreground text-background" : "bg-muted/40 text-foreground")
            }
          >
            I
          </button>
        </div>
      </InspectorSection>

      <InspectorSection title="Shape" hint={meta.name.toLowerCase()}>
        {meta.params.map((p) => {
          const value = state.shapeParams[state.shape][p.key] ?? p.min;
          if (p.key === "direction") {
            return (
              <div key={p.key} className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-medium">
                  {p.label}
                </label>
                <ToggleGroup
                  type="single"
                  value={value >= 0 ? "1" : "-1"}
                  onValueChange={(v) => v && onShapeParam(p.key, parseInt(v, 10))}
                  className="bg-muted/40 rounded p-0.5"
                >
                  <ToggleGroupItem value="1" className="h-7 px-3 text-[11px]" data-testid="dir-fwd">
                    →
                  </ToggleGroupItem>
                  <ToggleGroupItem value="-1" className="h-7 px-3 text-[11px]" data-testid="dir-rev">
                    ←
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            );
          }
          return (
            <SliderInput
              key={p.key}
              label={p.label}
              value={value}
              min={p.min}
              max={p.max}
              step={p.step}
              unit={p.unit}
              onChange={(v) => onShapeParam(p.key, v)}
            />
          );
        })}
      </InspectorSection>

      <InspectorSection title="Composition" hint="rotate · scale · jitter" defaultOpen={false}>
        <SliderInput
          label="Rotation"
          value={state.rotation}
          min={-180}
          max={180}
          step={1}
          unit="°"
          onChange={(v) => onChange({ rotation: v })}
        />
        <SliderInput
          label="Scale"
          value={state.scale}
          min={0.4}
          max={1.4}
          step={0.01}
          onChange={(v) => onChange({ scale: v })}
        />
        <SliderInput
          label="Offset X"
          value={state.offsetX}
          min={-200}
          max={200}
          step={2}
          unit="px"
          onChange={(v) => onChange({ offsetX: v })}
        />
        <SliderInput
          label="Offset Y"
          value={state.offsetY}
          min={-160}
          max={160}
          step={2}
          unit="px"
          onChange={(v) => onChange({ offsetY: v })}
        />
        <SliderInput
          label="Jitter"
          value={state.jitter}
          min={0}
          max={10}
          step={0.1}
          onChange={(v) => onChange({ jitter: v })}
        />
        <div className="flex items-center justify-between gap-3 pt-1">
          <label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-medium">
            Show silhouette
          </label>
          <Switch
            checked={state.showGuide}
            onCheckedChange={(v) => onChange({ showGuide: v })}
            data-testid="switch-guide"
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-medium">
            Show grid
          </label>
          <Switch
            checked={state.showGrid}
            onCheckedChange={(v) => onChange({ showGrid: v })}
            data-testid="switch-grid"
          />
        </div>
      </InspectorSection>

      <InspectorSection title="Color" hint="ink · paper" defaultOpen={false}>
        <div className="space-y-2">
          <label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-medium">
            Ink
          </label>
          <div className="grid grid-cols-10 gap-1">
            {SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onChange({ textColor: c })}
                className={
                  "h-6 rounded border transition-transform hover:scale-110 " +
                  (state.textColor === c ? "ring-2 ring-ring border-transparent" : "border-border")
                }
                style={{ background: c }}
                aria-label={c}
                data-testid={`ink-${c}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={state.textColor}
              onChange={(e) => onChange({ textColor: e.target.value })}
              className="h-7 w-9 rounded border border-border cursor-pointer bg-transparent"
              data-testid="ink-picker"
            />
            <input
              type="text"
              value={state.textColor}
              onChange={(e) => onChange({ textColor: e.target.value })}
              className="flex-1 text-[11px] num-tab bg-muted/40 px-2 py-1 rounded border border-transparent hover:border-border focus:border-ring focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-medium">
            Paper
          </label>
          <div className="grid grid-cols-10 gap-1">
            {BG_SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onChange({ backgroundColor: c, backgroundMode: "solid" })}
                className={
                  "h-6 rounded border transition-transform hover:scale-110 " +
                  (state.backgroundColor === c && state.backgroundMode === "solid"
                    ? "ring-2 ring-ring border-transparent"
                    : "border-border")
                }
                style={{ background: c }}
                aria-label={c}
                data-testid={`paper-${c}`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 pt-1">
            <label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-medium">
              Transparent
            </label>
            <Switch
              checked={state.backgroundMode === "transparent"}
              onCheckedChange={(v) =>
                onChange({ backgroundMode: v ? "transparent" : "solid" })
              }
              data-testid="switch-bg-transparent"
            />
          </div>
        </div>
      </InspectorSection>
    </aside>
  );
}
