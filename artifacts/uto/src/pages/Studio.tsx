import { useCallback, useEffect, useRef, useState } from "react";
import { Toolbar } from "@/components/editor/Toolbar";
import { Canvas } from "@/components/editor/Canvas";
import { RightInspector } from "@/components/editor/RightInspector";
import { StatusStrip } from "@/components/editor/StatusStrip";
import { MathPanel } from "@/components/editor/MathPanel";
import { useUndoable } from "@/hooks/useUndoable";
import { useToast } from "@/hooks/use-toast";
import { INITIAL_STATE } from "@/lib/initialState";
import type { CanvasState, ShapeId } from "@/lib/types";
import { applyPreset, type Preset } from "@/lib/presets";
import { nextShape, randomizeState } from "@/lib/randomize";
import {
  copySvgToClipboard,
  downloadSvg,
  exportPng,
} from "@/lib/export";

const SLIDER_KEYS = new Set([
  "fontSize",
  "weight",
  "letterSpacing",
  "rotation",
  "scale",
  "offsetX",
  "offsetY",
  "jitter",
]);

export default function Studio() {
  const undoable = useUndoable<CanvasState>(INITIAL_STATE);
  const state = undoable.state;
  const [projectName, setProjectName] = useState("Untitled — Cathedral");
  const [meta, setMeta] = useState({ chars: 0, pathLen: 0, ms: 0 });
  const [showMath, setShowMath] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>("cathedral");
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const updateState = useCallback(
    (patch: Partial<CanvasState>) => {
      undoable.set((s) => ({ ...s, ...patch }), {
        coalesce: Object.keys(patch).every((k) => SLIDER_KEYS.has(k) || k === "text"),
      });
    },
    [undoable]
  );

  const updateShapeParam = useCallback(
    (key: string, v: number) => {
      undoable.set(
        (s) => ({
          ...s,
          shapeParams: {
            ...s.shapeParams,
            [s.shape]: { ...s.shapeParams[s.shape], [key]: v },
          },
        }),
        { coalesce: true }
      );
    },
    [undoable]
  );

  const setShape = useCallback(
    (id: ShapeId) => {
      undoable.set((s) => ({ ...s, shape: id }));
    },
    [undoable]
  );

  const onPreset = useCallback(
    (p: Preset) => {
      undoable.set((s) => applyPreset(s, p));
      setProjectName(`Untitled — ${p.name}`);
      setActivePresetId(p.id);
      toast({
        title: p.name,
        description: p.description,
      });
    },
    [undoable, toast]
  );

  const onRandomize = useCallback(() => {
    undoable.set((s) => randomizeState(s));
    setActivePresetId(null);
  }, [undoable]);

  const onExportSvg = useCallback(() => {
    if (!svgRef.current) return;
    downloadSvg(svgRef.current, sanitizeFileName(projectName) + ".svg");
    toast({ title: "SVG exported", description: "Saved to your downloads." });
  }, [projectName, toast]);

  const onCopySvg = useCallback(async () => {
    if (!svgRef.current) return;
    try {
      await copySvgToClipboard(svgRef.current);
      toast({ title: "Copied SVG to clipboard" });
    } catch {
      toast({ title: "Could not copy", description: "Browser blocked clipboard access.", variant: "destructive" });
    }
  }, [toast]);

  const onExportPng = useCallback(
    async (scale: 1 | 2 | 4) => {
      if (!svgRef.current) return;
      toast({ title: `Rendering PNG ${scale}×…` });
      try {
        await exportPng(svgRef.current, scale, sanitizeFileName(projectName) + `@${scale}x.png`);
      } catch (e) {
        toast({ title: "Export failed", description: String(e), variant: "destructive" });
      }
    },
    [projectName, toast]
  );

  // Keyboard shortcuts.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isField =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undoable.undo();
        return;
      }
      if (meta && (e.key.toLowerCase() === "z" && e.shiftKey || e.key.toLowerCase() === "y")) {
        e.preventDefault();
        undoable.redo();
        return;
      }
      if (isField) return;
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        onRandomize();
      } else if (e.key === "e" || e.key === "E") {
        e.preventDefault();
        onExportSvg();
      } else if (e.key === "[") {
        e.preventDefault();
        setShape(nextShape(state.shape, -1));
      } else if (e.key === "]") {
        e.preventDefault();
        setShape(nextShape(state.shape, 1));
      } else if (e.code === "Space") {
        e.preventDefault();
        updateState({ showGrid: !state.showGrid });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undoable, onRandomize, onExportSvg, setShape, state.shape, state.showGrid, updateState]);

  return (
    <div className="h-full w-full flex flex-col bg-background overflow-hidden">
      <Toolbar
        projectName={projectName}
        onProjectNameChange={setProjectName}
        canUndo={undoable.canUndo}
        canRedo={undoable.canRedo}
        onUndo={undoable.undo}
        onRedo={undoable.redo}
        onRandomize={onRandomize}
        onPreset={onPreset}
        activePresetId={activePresetId}
        activeShape={state.shape}
        onPickShape={setShape}
        onExportSvg={onExportSvg}
        onCopySvg={onCopySvg}
        onExportPng={onExportPng}
        onShowMath={() => setShowMath(true)}
        isDark={isDark}
        onToggleDark={() => setIsDark((d) => !d)}
        undoDepth={undoable.depth}
      />
      <div className="flex-1 flex min-h-0">
        <main className="flex-1 min-w-0 flex items-center justify-center relative bg-stage">
          <Canvas state={state} ref={svgRef} onMetaUpdate={setMeta} />
        </main>
        <RightInspector
          state={state}
          onChange={updateState}
          onShapeParam={updateShapeParam}
        />
      </div>
      <StatusStrip
        shape={state.shape}
        chars={meta.chars}
        pathLen={meta.pathLen}
        ms={meta.ms}
      />
      <MathPanel open={showMath} shape={state.shape} onClose={() => setShowMath(false)} />
    </div>
  );
}

function sanitizeFileName(s: string): string {
  return s.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-+|-+$/g, "") || "uto";
}
