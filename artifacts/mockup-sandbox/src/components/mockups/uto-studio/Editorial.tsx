import React from "react";
import { 
  Undo2, 
  Redo2, 
  ChevronDown, 
  ChevronRight, 
  Moon, 
  Download,
  Italic,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MoveRight,
  MoveLeft
} from "lucide-react";

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
  // Build an Archimedean spiral path
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

function CropMarks() {
  const len = 14;
  const strokeWidth = 0.75;
  const color = "hsl(260 18% 14% / 0.5)"; // foreground/50
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top Left */}
      <div className="absolute top-0 left-0" style={{ width: len, height: strokeWidth, backgroundColor: color, transform: "translate(-100%, 0)" }} />
      <div className="absolute top-0 left-0" style={{ width: strokeWidth, height: len, backgroundColor: color, transform: "translate(0, -100%)" }} />
      
      {/* Top Right */}
      <div className="absolute top-0 right-0" style={{ width: len, height: strokeWidth, backgroundColor: color, transform: "translate(100%, 0)" }} />
      <div className="absolute top-0 right-0" style={{ width: strokeWidth, height: len, backgroundColor: color, transform: "translate(-100%, -100%)" }} />
      
      {/* Bottom Left */}
      <div className="absolute bottom-0 left-0" style={{ width: len, height: strokeWidth, backgroundColor: color, transform: "translate(-100%, -100%)" }} />
      <div className="absolute bottom-0 left-0" style={{ width: strokeWidth, height: len, backgroundColor: color, transform: "translate(0, 100%)" }} />
      
      {/* Bottom Right */}
      <div className="absolute bottom-0 right-0" style={{ width: len, height: strokeWidth, backgroundColor: color, transform: "translate(100%, -100%)" }} />
      <div className="absolute bottom-0 right-0" style={{ width: strokeWidth, height: len, backgroundColor: color, transform: "translate(-100%, 100%)" }} />
    </div>
  );
}

export function Editorial() {
  return (
    <div className="flex flex-col w-full h-screen min-h-[100dvh] bg-[hsl(38_28%_96%)] text-[hsl(260_18%_14%)] font-sans overflow-hidden">
      
      {/* 1. Top Toolbar */}
      <header className="flex-none h-[44px] flex items-center justify-between px-4 border-b border-[hsl(260_14%_88%)]/40 bg-[hsl(38_28%_96%)]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <UtoMark height={16} />
          <div className="w-[1px] h-[12px] bg-[hsl(260_14%_88%)]/60 mx-1" />
          <span className="text-[12px] font-medium tracking-wide">Untitled — Cathedral</span>
        </div>
        
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3">
            <button className="text-[hsl(260_10%_42%)] hover:text-[hsl(260_18%_14%)] transition-colors"><Undo2 size={14} strokeWidth={2.5} /></button>
            <button className="text-[hsl(260_10%_42%)] hover:text-[hsl(260_18%_14%)] transition-colors"><Redo2 size={14} strokeWidth={2.5} /></button>
          </div>
          
          <div className="w-[1px] h-[12px] bg-[hsl(260_14%_88%)]/60" />
          
          <button className="flex items-center gap-1.5 text-[12px] font-medium">
            Spiral
            <ChevronDown size={14} strokeWidth={2} className="text-[hsl(260_10%_42%)]" />
          </button>
          
          <div className="w-[1px] h-[12px] bg-[hsl(260_14%_88%)]/60" />
          
          <button className="text-[hsl(260_10%_42%)] hover:text-[hsl(260_18%_14%)] transition-colors"><Moon size={14} strokeWidth={2} /></button>
          
          <button className="ml-1 flex items-center gap-1.5 bg-[hsl(326_82%_60%)] text-white px-3 py-1.5 rounded text-[11px] font-semibold tracking-wide uppercase hover:bg-[hsl(326_82%_60%)]/90 transition-colors">
            <Download size={13} strokeWidth={2.5} />
            Export
          </button>
        </div>
      </header>
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* 2. Stage */}
        <main className="flex-1 relative flex items-center justify-center bg-[#efebdf]/50 p-[48px] overflow-hidden">
          <div className="relative w-full max-w-[900px] aspect-[900/560] bg-[#f6f1e7] shadow-sm">
            <CropMarks />
            <StaticSpiral />
          </div>
        </main>
        
        {/* 3. Right Inspector */}
        <aside className="w-[320px] flex-none flex flex-col border-l border-[hsl(260_14%_88%)]/40 bg-[hsl(38_28%_96%)]/90 backdrop-blur-md overflow-y-auto z-10">
          <div className="flex flex-col p-[22px] gap-[14px]">
            
            {/* Tone Header */}
            <div className="pb-[14px] border-b border-[hsl(260_14%_88%)]/35 flex flex-col gap-2">
              <div className="flex items-baseline gap-2">
                <h2 className="text-[10px] uppercase tracking-[0.3em] font-semibold text-[hsl(260_18%_14%)]">Spiral</h2>
                <span className="text-[hsl(260_10%_42%)] text-[10px]">·</span>
                <span className="text-[10.5px] lowercase text-[hsl(260_10%_42%)] font-serif italic">r = a + b·θ</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[hsl(260_10%_42%)]">
                Text walks an Archimedean spiral at constant linear velocity.
              </p>
            </div>
            
            {/* Text Section (Open) */}
            <div className="pb-[14px] border-b border-[hsl(260_14%_88%)]/35 flex flex-col gap-4">
              <div className="flex items-center justify-between cursor-pointer group">
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-semibold text-[hsl(260_18%_14%)] group-hover:text-black transition-colors">Text</h3>
                <ChevronDown size={12} className="text-[hsl(260_10%_42%)]" />
              </div>
              
              <div className="flex flex-col gap-3">
                <textarea 
                  className="w-full bg-transparent border border-[hsl(260_14%_88%)] rounded-sm p-2 text-[12px] leading-snug resize-none h-[80px] focus:outline-none focus:border-[hsl(260_10%_42%)] text-[hsl(260_18%_14%)] selection:bg-black selection:text-white"
                  defaultValue={"I heard a Fly buzz — when I died — The Stillness in the Room was like the Stillness in the Air — between the Heaves of Storm — The Eyes around — had wrung them dry — and Breaths were gathering firm for that last Onset — when the King be witnessed — in the Room — "}
                />
                
                <div className="flex items-center justify-between border border-[hsl(260_14%_88%)] rounded-sm p-1.5 px-2">
                  <span className="text-[11px] font-medium">EB Garamond</span>
                  <ChevronDown size={12} className="text-[hsl(260_10%_42%)]" />
                </div>
                
                {/* Sliders */}
                <div className="flex flex-col gap-2.5 mt-1">
                  {/* Size */}
                  <div className="flex items-center group">
                    <span className="w-[80px] text-[10px] uppercase tracking-widest text-[hsl(260_10%_42%)]">Size</span>
                    <div className="flex-1 mx-2 relative flex items-center">
                      <div className="w-full h-[1px] bg-[hsl(260_14%_88%)]"></div>
                      <div className="absolute left-[30%] w-[10px] h-[10px] rounded-full bg-[hsl(260_18%_14%)] -ml-[5px] shadow-sm"></div>
                    </div>
                    <div className="w-[45px] text-right text-[11px] tabular-nums">
                      14 <span className="font-serif italic text-[hsl(260_10%_42%)]">px</span>
                    </div>
                  </div>
                  
                  {/* Weight */}
                  <div className="flex items-center group">
                    <span className="w-[80px] text-[10px] uppercase tracking-widest text-[hsl(260_10%_42%)]">Weight</span>
                    <div className="flex-1 mx-2 relative flex items-center">
                      <div className="w-full h-[1px] bg-[hsl(260_14%_88%)]"></div>
                      <div className="absolute left-[50%] w-[10px] h-[10px] rounded-full bg-[hsl(260_18%_14%)] -ml-[5px] shadow-sm"></div>
                    </div>
                    <div className="w-[45px] text-right text-[11px] tabular-nums">
                      500
                    </div>
                  </div>
                  
                  {/* Tracking */}
                  <div className="flex items-center group">
                    <span className="w-[80px] text-[10px] uppercase tracking-widest text-[hsl(260_10%_42%)]">Tracking</span>
                    <div className="flex-1 mx-2 relative flex items-center">
                      <div className="w-full h-[1px] bg-[hsl(260_14%_88%)]"></div>
                      <div className="absolute left-[70%] w-[10px] h-[10px] rounded-full bg-[hsl(260_18%_14%)] -ml-[5px] shadow-sm"></div>
                    </div>
                    <div className="w-[45px] text-right text-[11px] tabular-nums">
                      0.30 <span className="font-serif italic text-[hsl(260_10%_42%)]">em</span>
                    </div>
                  </div>
                </div>
                
                {/* Toggles */}
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex rounded-sm border border-[hsl(260_14%_88%)] overflow-hidden">
                    <button className="px-2.5 py-1 text-[11px] font-medium bg-[hsl(260_14%_88%)]/50">Aa</button>
                    <button className="px-2.5 py-1 text-[11px] font-medium border-l border-[hsl(260_14%_88%)] hover:bg-[hsl(260_14%_88%)]/20">AA</button>
                    <button className="px-2.5 py-1 text-[11px] font-medium border-l border-[hsl(260_14%_88%)] hover:bg-[hsl(260_14%_88%)]/20">aa</button>
                    <button className="px-2.5 py-1 text-[11px] font-medium border-l border-[hsl(260_14%_88%)] hover:bg-[hsl(260_14%_88%)]/20">Tt</button>
                  </div>
                  <button className="px-3 py-1 text-[12px] font-serif italic border border-[hsl(260_14%_88%)] rounded-sm hover:bg-[hsl(260_14%_88%)]/20">I</button>
                </div>
              </div>
            </div>
            
            {/* Shape Section (Open) */}
            <div className="pb-[14px] border-b border-[hsl(260_14%_88%)]/35 flex flex-col gap-4">
              <div className="flex items-center justify-between cursor-pointer group">
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-semibold text-[hsl(260_18%_14%)] group-hover:text-black transition-colors">Shape</h3>
                <ChevronDown size={12} className="text-[hsl(260_10%_42%)]" />
              </div>
              
              <div className="flex flex-col gap-2.5">
                {/* Turns */}
                <div className="flex items-center group">
                  <span className="w-[80px] text-[10px] uppercase tracking-widest text-[hsl(260_10%_42%)]">Turns</span>
                  <div className="flex-1 mx-2 relative flex items-center">
                    <div className="w-full h-[1px] bg-[hsl(260_14%_88%)]"></div>
                    <div className="absolute left-[70%] w-[10px] h-[10px] rounded-full bg-[hsl(260_18%_14%)] -ml-[5px] shadow-sm"></div>
                  </div>
                  <div className="w-[45px] text-right text-[11px] tabular-nums">
                    7.0
                  </div>
                </div>
                
                {/* Gap */}
                <div className="flex items-center group">
                  <span className="w-[80px] text-[10px] uppercase tracking-widest text-[hsl(260_10%_42%)]">Gap</span>
                  <div className="flex-1 mx-2 relative flex items-center">
                    <div className="w-full h-[1px] bg-[hsl(260_14%_88%)]"></div>
                    <div className="absolute left-[40%] w-[10px] h-[10px] rounded-full bg-[hsl(260_18%_14%)] -ml-[5px] shadow-sm"></div>
                  </div>
                  <div className="w-[45px] text-right text-[11px] tabular-nums">
                    26 <span className="font-serif italic text-[hsl(260_10%_42%)]">px</span>
                  </div>
                </div>
                
                {/* Inner Radius */}
                <div className="flex items-center group">
                  <span className="w-[80px] text-[10px] uppercase tracking-widest text-[hsl(260_10%_42%)]">Inner</span>
                  <div className="flex-1 mx-2 relative flex items-center">
                    <div className="w-full h-[1px] bg-[hsl(260_14%_88%)]"></div>
                    <div className="absolute left-[15%] w-[10px] h-[10px] rounded-full bg-[hsl(260_18%_14%)] -ml-[5px] shadow-sm"></div>
                  </div>
                  <div className="w-[45px] text-right text-[11px] tabular-nums">
                    8 <span className="font-serif italic text-[hsl(260_10%_42%)]">px</span>
                  </div>
                </div>
                
                {/* Direction */}
                <div className="flex items-center gap-4 mt-2">
                  <span className="w-[80px] text-[10px] uppercase tracking-widest text-[hsl(260_10%_42%)]">Dir</span>
                  <div className="flex rounded-sm border border-[hsl(260_14%_88%)] overflow-hidden">
                    <button className="px-3 py-1 flex items-center justify-center bg-[hsl(260_14%_88%)]/50">
                      <MoveRight size={12} strokeWidth={2.5} />
                    </button>
                    <button className="px-3 py-1 flex items-center justify-center border-l border-[hsl(260_14%_88%)] hover:bg-[hsl(260_14%_88%)]/20 text-[hsl(260_10%_42%)]">
                      <MoveLeft size={12} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Composition Section (Collapsed) */}
            <div className="pb-[14px] border-b border-[hsl(260_14%_88%)]/35 flex flex-col">
              <div className="flex items-center justify-between cursor-pointer group">
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-semibold text-[hsl(260_10%_42%)] group-hover:text-black transition-colors">Composition</h3>
                <ChevronRight size={12} className="text-[hsl(260_14%_88%)]" />
              </div>
            </div>
            
            {/* Color Section (Collapsed) */}
            <div className="pb-[14px] flex flex-col">
              <div className="flex items-center justify-between cursor-pointer group">
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-semibold text-[hsl(260_10%_42%)] group-hover:text-black transition-colors">Color</h3>
                <ChevronRight size={12} className="text-[hsl(260_14%_88%)]" />
              </div>
            </div>
            
          </div>
        </aside>
      </div>
      
      {/* 4. Bottom Status Strip */}
      <footer className="flex-none h-[24px] flex items-center justify-between px-5 bg-[hsl(38_28%_96%)]/80 backdrop-blur-md z-10 text-[hsl(260_10%_42%)] tabular-nums overflow-hidden">
        <div className="flex items-center gap-4 text-[11px] tracking-wide">
          <span>Spiral</span>
          <span>261 chars</span>
          <span>10,836 px path</span>
          <span>0.7 ms</span>
        </div>
        
        <div className="flex items-center gap-6 text-[9px] uppercase tracking-[0.28em] font-medium">
          <span>900 × 560</span>
          <span>8-pt grid</span>
          <span>resolution-independent</span>
        </div>
      </footer>
      
    </div>
  );
}
