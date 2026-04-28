interface Props {
  size?: number;
}

export function UtoMark({ size = 26 }: Props) {
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
      <UtoMark size={22} />
      <span className="font-display text-[15px] font-semibold tracking-[-0.01em] text-foreground leading-none">
        UTO
      </span>
    </div>
  );
}
