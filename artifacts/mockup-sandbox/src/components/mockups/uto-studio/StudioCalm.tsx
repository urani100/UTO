import React from "react";
import { Undo2, Redo2, ChevronDown, ChevronRight, Moon, Italic, AlignLeft, AlignCenter, AlignRight, Type } from "lucide-react";

const CONTENT_W = 638, CONTENT_H = 212, IMG_SIZE = 1080, CONTENT_X = 238, CONTENT_Y = 436;

function UtoMark({ height = 22 }: { height?: number }) {
  const scale = (height / CONTENT_H) * IMG_SIZE;
  const width = (CONTENT_W / CONTENT_H) * height;
  return (
    <div
      role="img"
      aria-label="UTO"
      style={{
        width,
        height,
        backgroundImage: 'url(/__mockup/images/uto-mark.png)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${scale}px ${scale}px`,
        backgroundPosition: `-${(CONTENT_X / IMG_SIZE) * scale}px -${(CONTENT_Y / IMG_SIZE) * scale}px`,
      }}
    />
  );
}

function StaticSpiral() {
  const PROSE = "I heard a Fly buzz — when I died — The Stillness in the Room was like the Stillness in the Air — between the Heaves of Storm — The Eyes around — had wrung them dry — and Breaths were gathering firm for that last Onset — when the King be witnessed — in the Room — ".repeat(2);
  const cx = 450, cy = 280, a = 8, b = 26 / (2 * Math.PI), turns = 7;
  const pts: string[] = [];
  for (let t = 0; t <= turns * 2 * Math.PI; t += 0.05) {
    const r = a + b * t;
    pts.push(`${cx + r * Math.cos(t)},${cy + r * Math.sin(t)}`);
  }
  return (
    <svg viewBox="0 0 900 560" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs><path id="spiral-path" d={`M${pts.join(' L')}`} /></defs>
      <text fontFamily="EB Garamond, Georgia, serif" fontSize="14" fontWeight="500" letterSpacing="0.3" fill="hsl(260 18% 14%)">
        <textPath href="#spiral-path">{PROSE}</textPath>
      </text>
    </svg>
  );
}

export function StudioCalm() {
  return (
    <div className="theme-calm w-full h-screen min-h-[900px] flex flex-col bg-[hsl(var(--background))] text-[hsl(var(--foreground))] font-sans overflow-hidden">
      <style>{`
        .theme-calm {
          --background: 38 28% 96%;
          --foreground: 260 18% 14%;
          --border: 260 14% 88%;
          --muted-foreground: 260 10% 42%;
          --primary: 326 82% 60%;
        }
      `}</style>
      
      {/* Toolbar */}
      <header className="h-[52px] flex-none flex items-center justify-between px-4 border-b border-[hsl(260_14%_90%)] bg-[hsl(var(--background))]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <UtoMark height={18} />
          <div className="w-px h-4 bg-[hsl(var(--border))]" />
          <span className="font-serif italic text-[14px] text-[hsl(var(--foreground))]">Untitled — Cathedral</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[hsl(var(--muted-foreground))]">
            <button className="p-1.5 hover:text-[hsl(var(--foreground))] transition-colors rounded-md hover:bg-black/5"><Undo2 className="w-4 h-4" /></button>
            <button className="p-1.5 hover:text-[hsl(var(--foreground))] transition-colors rounded-md hover:bg-black/5"><Redo2 className="w-4 h-4" /></button>
          </div>
          <div className="w-px h-4 bg-[hsl(var(--border))]" />
          <button className="flex items-center gap-1.5 px-2 py-1.5 text-[13px] font-medium hover:bg-black/5 rounded-md transition-colors">
            Spiral <ChevronDown className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
          </button>
          <button className="p-1.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors rounded-md hover:bg-black/5">
            <Moon className="w-4 h-4" />
          </button>
          <button className="ml-2 px-3 py-1.5 bg-[hsl(var(--primary))] text-white text-[13px] font-medium rounded-[8px] hover:bg-[hsl(326_82%_55%)] transition-colors shadow-sm" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 1px 2px rgba(0,0,0,0.05)' }}>
            Export
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Stage */}
        <main className="flex-1 relative bg-[#EBEBEB] flex items-center justify-center p-[56px] overflow-hidden">
          {/* Artboard */}
          <div className="relative w-full max-w-[900px] aspect-[900/560] bg-[#F6F1E7] shadow-sm border-b border-[hsl(260_14%_88%)]">
            {/* Corner crop marks */}
            <div className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-[1.25px] border-l-[1.25px] border-[hsl(var(--foreground))]/65 -translate-x-[2px] -translate-y-[2px]" />
            <div className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-[1.25px] border-r-[1.25px] border-[hsl(var(--foreground))]/65 translate-x-[2px] -translate-y-[2px]" />
            <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-[1.25px] border-l-[1.25px] border-[hsl(var(--foreground))]/65 -translate-x-[2px] translate-y-[2px]" />
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-[1.25px] border-r-[1.25px] border-[hsl(var(--foreground))]/65 translate-x-[2px] translate-y-[2px]" />
            
            <div className="absolute inset-0">
              <StaticSpiral />
            </div>
          </div>
        </main>

        {/* Right Inspector */}
        <aside className="w-[320px] flex-none flex flex-col bg-[hsl(38_32%_97%)] border-l border-[hsl(var(--border))]/50 shadow-[inset_0_1px_0_rgba(0,0,0,0.02)] overflow-y-auto">
          
          {/* Tone Header */}
          <div className="px-6 py-[18px] border-b border-dotted border-[hsl(var(--border))]">
            <div className="flex items-baseline justify-between mb-2">
              <h2 className="font-serif text-[13px] font-medium text-[hsl(var(--foreground))]">Spiral</h2>
              <span className="font-serif italic text-[11px] text-[hsl(var(--muted-foreground))]">r = a + b·θ</span>
            </div>
            <p className="text-[11px] font-serif italic text-[hsl(var(--muted-foreground))] leading-snug">
              Text walks an Archimedean spiral at constant linear velocity.
            </p>
          </div>

          {/* Text Section */}
          <div className="px-6 py-[18px] border-b border-dotted border-[hsl(var(--border))]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-1 bg-[hsl(var(--foreground))]/30" />
              <h3 className="font-serif text-[13px] font-medium text-[hsl(var(--foreground))]">Text</h3>
            </div>
            <div className="space-y-4">
              <textarea 
                className="w-full h-[80px] bg-transparent border border-[hsl(var(--border))] rounded-md p-2 text-[12px] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]/50 resize-none focus:outline-none focus:border-[hsl(var(--foreground))]/30 transition-colors"
                defaultValue="I heard a Fly buzz — when I died — The Stillness in the Room was like the Stillness in the Air — between the Heaves of Storm — The Eyes around — had wrung them dry — and Breaths were gathering firm for that last Onset — when the King be witnessed — in the Room — "
              />
              <div className="flex items-center justify-between border border-[hsl(var(--border))] rounded-md px-2 py-1.5">
                <span className="text-[12px] text-[hsl(var(--foreground))]">EB Garamond</span>
                <ChevronDown className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
              </div>

              {/* Sliders */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-serif italic text-[11.5px] text-[hsl(var(--muted-foreground))] w-16">Size</span>
                  <div className="flex-1 mx-3 h-0.5 bg-[hsl(var(--border))] rounded-full relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/3 h-0.5 bg-[hsl(var(--foreground))] rounded-full" />
                    <div className="absolute left-1/3 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-4 bg-white border border-[hsl(var(--border))] rounded-full shadow-sm" />
                  </div>
                  <div className="w-12 text-right flex items-baseline justify-end gap-1">
                    <span className="font-sans tabular-nums text-[12px] text-[hsl(var(--foreground))]">14</span>
                    <span className="font-sans text-[9.5px] text-[hsl(var(--muted-foreground))]/60">px</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-serif italic text-[11.5px] text-[hsl(var(--muted-foreground))] w-16">Weight</span>
                  <div className="flex-1 mx-3 h-0.5 bg-[hsl(var(--border))] rounded-full relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-0.5 bg-[hsl(var(--foreground))] rounded-full" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-4 bg-white border border-[hsl(var(--border))] rounded-full shadow-sm" />
                  </div>
                  <div className="w-12 text-right flex items-baseline justify-end gap-1">
                    <span className="font-sans tabular-nums text-[12px] text-[hsl(var(--foreground))]">500</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-serif italic text-[11.5px] text-[hsl(var(--muted-foreground))] w-16">Tracking</span>
                  <div className="flex-1 mx-3 h-0.5 bg-[hsl(var(--border))] rounded-full relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/4 h-0.5 bg-[hsl(var(--foreground))] rounded-full" />
                    <div className="absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-4 bg-white border border-[hsl(var(--border))] rounded-full shadow-sm" />
                  </div>
                  <div className="w-12 text-right flex items-baseline justify-end gap-1">
                    <span className="font-sans tabular-nums text-[12px] text-[hsl(var(--foreground))]">0.30</span>
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-2 pt-2">
                <div className="flex p-0.5 bg-black/5 rounded-md border border-[hsl(var(--border))]/50">
                  <button className="px-2 py-1 text-[12px] font-medium bg-white rounded shadow-sm">Aa</button>
                  <button className="px-2 py-1 text-[12px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">AA</button>
                  <button className="px-2 py-1 text-[12px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">aa</button>
                  <button className="px-2 py-1 text-[12px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Tt</button>
                </div>
                <button className="p-1.5 border border-[hsl(var(--border))]/50 bg-black/5 rounded-md text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                  <Italic className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Shape Section */}
          <div className="px-6 py-[18px] border-b border-dotted border-[hsl(var(--border))]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-1 bg-[hsl(var(--foreground))]/30" />
              <h3 className="font-serif text-[13px] font-medium text-[hsl(var(--foreground))]">Shape</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-serif italic text-[11.5px] text-[hsl(var(--muted-foreground))] w-16">Turns</span>
                <div className="flex-1 mx-3 h-0.5 bg-[hsl(var(--border))] rounded-full relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[70%] h-0.5 bg-[hsl(var(--foreground))] rounded-full" />
                  <div className="absolute left-[70%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-4 bg-white border border-[hsl(var(--border))] rounded-full shadow-sm" />
                </div>
                <div className="w-12 text-right flex items-baseline justify-end gap-1">
                  <span className="font-sans tabular-nums text-[12px] text-[hsl(var(--foreground))]">7.0</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-serif italic text-[11.5px] text-[hsl(var(--muted-foreground))] w-16">Gap</span>
                <div className="flex-1 mx-3 h-0.5 bg-[hsl(var(--border))] rounded-full relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[40%] h-0.5 bg-[hsl(var(--foreground))] rounded-full" />
                  <div className="absolute left-[40%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-4 bg-white border border-[hsl(var(--border))] rounded-full shadow-sm" />
                </div>
                <div className="w-12 text-right flex items-baseline justify-end gap-1">
                  <span className="font-sans tabular-nums text-[12px] text-[hsl(var(--foreground))]">26</span>
                  <span className="font-sans text-[9.5px] text-[hsl(var(--muted-foreground))]/60">px</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-serif italic text-[11.5px] text-[hsl(var(--muted-foreground))] w-16">Inner</span>
                <div className="flex-1 mx-3 h-0.5 bg-[hsl(var(--border))] rounded-full relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[20%] h-0.5 bg-[hsl(var(--foreground))] rounded-full" />
                  <div className="absolute left-[20%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-4 bg-white border border-[hsl(var(--border))] rounded-full shadow-sm" />
                </div>
                <div className="w-12 text-right flex items-baseline justify-end gap-1">
                  <span className="font-sans tabular-nums text-[12px] text-[hsl(var(--foreground))]">8</span>
                  <span className="font-sans text-[9.5px] text-[hsl(var(--muted-foreground))]/60">px</span>
                </div>
              </div>

              <div className="pt-2 flex">
                <div className="flex p-0.5 bg-black/5 rounded-md border border-[hsl(var(--border))]/50">
                  <button className="px-3 py-1 text-[12px] bg-white rounded shadow-sm">→</button>
                  <button className="px-3 py-1 text-[12px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">←</button>
                </div>
              </div>
            </div>
          </div>

          {/* Composition Section (collapsed) */}
          <div className="px-6 py-[18px] border-b border-dotted border-[hsl(var(--border))] flex items-center justify-between opacity-60 hover:opacity-100 cursor-pointer transition-opacity">
            <div className="flex items-center gap-2">
              <ChevronRight className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
              <h3 className="font-serif text-[13px] font-medium text-[hsl(var(--foreground))]">Composition</h3>
            </div>
          </div>

          {/* Color Section (collapsed) */}
          <div className="px-6 py-[18px] border-b border-dotted border-[hsl(var(--border))] flex items-center justify-between opacity-60 hover:opacity-100 cursor-pointer transition-opacity">
            <div className="flex items-center gap-2">
              <ChevronRight className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
              <h3 className="font-serif text-[13px] font-medium text-[hsl(var(--foreground))]">Color</h3>
            </div>
          </div>
          
        </aside>
      </div>

      {/* Footer Status Strip */}
      <footer className="h-[28px] flex-none flex items-center justify-between px-4 bg-[hsl(var(--background))] border-t border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-serif italic text-[hsl(var(--foreground))]">Spiral</span>
          <span className="text-[8px] opacity-40">◇</span>
          <div className="flex items-baseline gap-1">
            <span className="font-sans tabular-nums text-[11px]">261</span>
            <span className="font-serif italic text-[11px]">chars</span>
          </div>
          <span className="text-[8px] opacity-40">◇</span>
          <div className="flex items-baseline gap-1">
            <span className="font-sans tabular-nums text-[11px]">10,836</span>
            <span className="font-serif italic text-[11px]">px path</span>
          </div>
          <span className="text-[8px] opacity-40">◇</span>
          <div className="flex items-baseline gap-1">
            <span className="font-sans tabular-nums text-[11px]">0.7</span>
            <span className="font-serif italic text-[11px]">ms</span>
          </div>
        </div>
        <div className="flex items-center gap-3 font-serif text-[10px] uppercase tracking-widest">
          <span>900 × 560</span>
          <span className="w-px h-2 bg-[hsl(var(--border))]" />
          <span>8-PT GRID</span>
          <span className="w-px h-2 bg-[hsl(var(--border))]" />
          <span>RESOLUTION-INDEPENDENT</span>
        </div>
      </footer>
    </div>
  );
}
