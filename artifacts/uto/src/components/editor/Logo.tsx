import logoSrc from "@assets/UTO_-Logo_1777405679749.png";

const CONTENT_W = 638;
const CONTENT_H = 212;
const IMG_SIZE = 1080;
const CONTENT_X = 238;
const CONTENT_Y = 436;

interface MarkProps {
  height?: number;
}

export function UtoMark({ height = 22 }: MarkProps) {
  const scale = (height / CONTENT_H) * IMG_SIZE;
  const width = (CONTENT_W / CONTENT_H) * height;
  return (
    <div
      role="img"
      aria-label="UTO"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundImage: `url(${logoSrc})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${scale}px ${scale}px`,
        backgroundPosition: `-${(CONTENT_X / IMG_SIZE) * scale}px -${(CONTENT_Y / IMG_SIZE) * scale}px`,
      }}
    />
  );
}

export function UtoWordmark() {
  return (
    <div className="flex items-center select-none">
      <UtoMark height={20} />
    </div>
  );
}
