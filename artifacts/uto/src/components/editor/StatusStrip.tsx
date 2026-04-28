interface Props {
  shape: string;
  chars: number;
  pathLen: number;
  ms: number;
}

export function StatusStrip({ shape, chars, pathLen, ms }: Props) {
  return (
    <footer className="h-8 flex-none border-t border-border/70 bg-card/40 px-4 flex items-center gap-5 text-[11px] num-tab text-muted-foreground">
      <span className="font-medium text-foreground/80 capitalize">{shape}</span>
      <span className="h-3 w-px bg-border" />
      <span>{chars.toLocaleString()} chars</span>
      <span className="h-3 w-px bg-border" />
      <span>{pathLen.toLocaleString()} px path</span>
      <span className="h-3 w-px bg-border" />
      <span>render {ms.toFixed(1)} ms</span>
      <span className="flex-1" />
      <span className="text-[10px] uppercase tracking-[0.18em] font-medium">
        Normalized · Resolution-independent · 8-pt grid
      </span>
    </footer>
  );
}
