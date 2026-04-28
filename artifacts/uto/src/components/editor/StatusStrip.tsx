interface Props {
  shape: string;
  chars: number;
  pathLen: number;
  ms: number;
}

export function StatusStrip({ shape, chars, pathLen, ms }: Props) {
  return (
    <footer className="h-7 flex-none border-t border-border/60 bg-background/85 backdrop-blur-xl px-4 flex items-center gap-4 text-[10.5px] num-tab text-muted-foreground/85">
      <span className="font-medium text-foreground/85 capitalize">{shape}</span>
      <Dot />
      <span>{chars.toLocaleString()} chars</span>
      <Dot />
      <span>{pathLen.toLocaleString()} px path</span>
      <Dot />
      <span>{ms.toFixed(1)} ms</span>
      <span className="flex-1" />
      <span className="text-[9.5px] uppercase tracking-[0.22em] font-medium text-muted-foreground/65">
        900 × 560 · 8-pt grid · resolution-independent
      </span>
    </footer>
  );
}

function Dot() {
  return <span className="h-[3px] w-[3px] rounded-full bg-muted-foreground/40" />;
}
