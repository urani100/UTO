import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
}

/**
 * A slider paired with a tabular numeric input.
 * Per the spec: "All sliders must be accompanied by a manual numeric input field."
 */
export function SliderInput({ label, value, min, max, step, unit, onChange }: Props) {
  const [text, setText] = useState(formatNumber(value, step));

  useEffect(() => {
    setText(formatNumber(value, step));
  }, [value, step]);

  const handleBlur = () => {
    const parsed = parseFloat(text);
    if (!Number.isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
    } else {
      setText(formatNumber(value, step));
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-medium">
          {label}
        </label>
        <div className="flex items-baseline gap-1">
          <input
            type="text"
            inputMode="decimal"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            className="w-14 text-right num-tab text-[12px] font-medium bg-muted/40 px-1.5 py-0.5 rounded border border-transparent hover:border-border focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
          />
          {unit ? (
            <span className="text-[10px] text-muted-foreground font-medium num-tab">{unit}</span>
          ) : null}
        </div>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v ?? value)}
        className="cursor-pointer"
      />
    </div>
  );
}

function formatNumber(v: number, step: number): string {
  if (step >= 1) return Math.round(v).toString();
  const decimals = Math.max(0, Math.min(3, Math.ceil(-Math.log10(step))));
  return v.toFixed(decimals);
}
