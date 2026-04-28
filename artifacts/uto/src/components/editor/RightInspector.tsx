import type { CanvasState } from "@/lib/types";
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

interface Props {
  state: CanvasState;
  onChange: (patch: Partial<CanvasState>) => void;
  onShapeParam: (key: string, v: number) => void;
}

const FONT_FAMILIES = [
  { label: "EB Garamond", value: '"EB Garamond", Georgia, serif' },
  { label: "Cormorant", value: '"Cormorant Garamond", Georgia, serif' },
  { label: "Playfair Display", value: '"Playfair Display", serif' },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Inter", value: '"Inter", sans-serif' },
  { label: "Space Grotesk", value: '"Space Grotesk", "Inter", sans-serif' },
  { label: "JetBrains Mono", value: '"JetBrains Mono", monospace' },
];

export function RightInspector({ state, onChange, onShapeParam }: Props) {
  const meta = SHAPE_META[state.shape];

  return (
    <aside className="w-[320px] flex-none border-l border-border/60 bg-background/80 backdrop-blur-xl overflow-y-auto nice-scroll relative z-10">
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-[14px] font-semibold tracking-[-0.005em] text-[#716e6e]">
            {meta.name}
          </h2>
          <span className="text-[10px] text-muted-foreground/70 num-tab">
            {Object.keys(state.shapeParams[state.shape]).length} params
          </span>
        </div>
        <p className="text-[11.5px] text-muted-foreground/85 leading-snug mt-1.5 pr-2">
          {meta.blurb}
        </p>
      </div>

      <div className="border-t border-border/55" />

      <InspectorSection title="Text">
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <label className="text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground/85 font-medium">
              Prose
            </label>
            <span className="text-[10px] text-muted-foreground/70 num-tab">
              {state.text.length} chars
            </span>
          </div>
          <Textarea
            value={state.text}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="Type or paste your text…"
            rows={5}
            className="text-[12px] font-serif leading-relaxed resize-y bg-background/80 border-border/70 focus-visible:ring-1 focus-visible:ring-foreground/30 focus-visible:border-foreground/40"
            data-testid="input-text"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground/85 font-medium">
            Family
          </label>
          <Select value={state.fontFamily} onValueChange={(v) => onChange({ fontFamily: v })}>
            <SelectTrigger className="h-8 text-[12px] bg-transparent border-border/70" data-testid="select-font">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_FAMILIES.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  <span style={{ fontFamily: f.value }} className="text-[13px]">
                    {f.label}
                  </span>
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

        <div className="flex items-center justify-between gap-2 pt-1">
          <ToggleGroup
            type="single"
            value={state.textCase}
            onValueChange={(v) => v && onChange({ textCase: v as CanvasState["textCase"] })}
            className="bg-foreground/[.04] rounded-md p-0.5"
          >
            {[
              ["as-is", "Aa"],
              ["upper", "AA"],
              ["lower", "aa"],
              ["title", "Tt"],
            ].map(([v, l]) => (
              <ToggleGroupItem
                key={v}
                value={v}
                className="h-6 px-2 text-[11px] font-serif rounded data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-sm"
                data-testid={`case-${v}`}
              >
                {l}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <button
            type="button"
            onClick={() => onChange({ italic: !state.italic })}
            data-testid="button-italic"
            className={
              "h-7 w-7 rounded text-[12.5px] italic font-serif transition-colors " +
              (state.italic
                ? "bg-primary text-primary-foreground"
                : "bg-foreground/[.04] text-foreground hover:bg-foreground/[.08]")
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
                <label className="text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground/85 font-medium">
                  {p.label}
                </label>
                <ToggleGroup
                  type="single"
                  value={value >= 0 ? "1" : "-1"}
                  onValueChange={(v) => v && onShapeParam(p.key, parseInt(v, 10))}
                  className="bg-foreground/[.04] rounded-md p-0.5 inline-flex"
                >
                  <ToggleGroupItem
                    value="1"
                    className="h-6 px-3 text-[11px] data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                    data-testid="dir-fwd"
                  >
                    →
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="-1"
                    className="h-6 px-3 text-[11px] data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                    data-testid="dir-rev"
                  >
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
      </InspectorSection>

      <InspectorSection title="Color" hint="ink · paper" defaultOpen>
        <div className="space-y-2">
          <label className="text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground/85 font-medium block">
            Ink
          </label>
          <div className="flex items-center gap-2">
            <ColorEyedrop value={state.textColor} onChange={(c) => onChange({ textColor: c })} testId="ink-picker" />
            <input
              type="text"
              value={state.textColor}
              onChange={(e) => onChange({ textColor: e.target.value })}
              className="flex-1 text-[11px] num-tab font-mono bg-foreground/[.03] px-2 py-1 rounded border border-transparent hover:border-border focus:border-foreground/40 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground/85 font-medium block">
            Paper
          </label>
          <div className="flex items-center gap-2">
            <ColorEyedrop
              value={state.backgroundColor}
              onChange={(c) => onChange({ backgroundColor: c, backgroundMode: "solid" })}
              testId="paper-picker"
            />
            <input
              type="text"
              value={state.backgroundColor}
              onChange={(e) => onChange({ backgroundColor: e.target.value, backgroundMode: "solid" })}
              className="flex-1 text-[11px] num-tab font-mono bg-foreground/[.03] px-2 py-1 rounded border border-transparent hover:border-border focus:border-foreground/40 focus:outline-none"
            />
          </div>
          <Row label="Transparent paper">
            <Switch
              checked={state.backgroundMode === "transparent"}
              onCheckedChange={(v) => onChange({ backgroundMode: v ? "transparent" : "solid" })}
              data-testid="switch-bg-transparent"
            />
          </Row>
        </div>
      </InspectorSection>
    </aside>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 pt-0.5">
      <label className="text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground/85 font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}

function ColorEyedrop({
  value,
  onChange,
  testId,
}: {
  value: string;
  onChange: (c: string) => void;
  testId: string;
}) {
  return (
    <label
      className="h-5 w-5 rounded-full ring-1 ring-foreground/15 cursor-pointer relative overflow-hidden flex items-center justify-center text-[10px] text-foreground/70 hover:scale-115 transition-transform"
      data-testid={testId}
      style={{
        background:
          "conic-gradient(from 90deg, #f06292, #ba68c8, #7986cb, #4dd0e1, #aed581, #fff176, #ffb74d, #f06292)",
      }}
    >
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
    </label>
  );
}
