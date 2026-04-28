interface Props {
  size?: number;
}

export function UtoMark({ size = 28 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="UTO mark"
    >
      <g transform="translate(32 32)">
        <circle r="20" fill="hsl(var(--uto-sage))" />
        <rect x="-9" y="-13" width="18" height="9" fill="hsl(var(--uto-purple))" opacity="0.5" />
        <rect x="-3" y="-9" width="6" height="18" fill="hsl(var(--uto-purple-deep))" />
        <circle r="6" fill="hsl(var(--uto-pink))" className="uto-mark-dot" />
      </g>
    </svg>
  );
}

export function UtoWordmark() {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <UtoMark size={26} />
      <div className="flex items-baseline gap-1">
        <span className="font-display text-[19px] font-semibold tracking-tight text-foreground leading-none">
          UTO
        </span>
        <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-medium">
          Studio
        </span>
      </div>
    </div>
  );
}
