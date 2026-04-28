import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@clerk/react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  createWork as createWorkApi,
  updateWork as updateWorkApi,
  getListWorksQueryKey,
} from "@workspace/api-client-react";
import { Toolbar } from "@/components/editor/Toolbar";
import { Canvas } from "@/components/editor/Canvas";
import { RightInspector } from "@/components/editor/RightInspector";
import { StatusStrip } from "@/components/editor/StatusStrip";
import { LibrarySheet } from "@/components/editor/LibrarySheet";
import type { SaveStatus } from "@/components/editor/SaveControls";
import { useUndoable } from "@/hooks/useUndoable";
import { useToast } from "@/hooks/use-toast";
import { INITIAL_STATE } from "@/lib/initialState";
import type { CanvasState, ShapeId } from "@/lib/types";
import { nextShape } from "@/lib/randomize";
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

/** Stable signature of the bits we persist for a work. Name is normalized
 *  to its trimmed, fallback-to-"Untitled" form so the UI does not flag the
 *  work as dirty over invisible whitespace differences after save. */
function workSignature(name: string, state: CanvasState): string {
  const normName = name.trim() || "Untitled";
  return JSON.stringify({ name: normName, shape: state.shape, state });
}

export default function Studio() {
  const undoable = useUndoable<CanvasState>(INITIAL_STATE);
  const state = undoable.state;
  const [projectName, setProjectName] = useState("Untitled");
  const [meta, setMeta] = useState({ chars: 0, pathLen: 0, ms: 0 });
  const [isDark, setIsDark] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [currentWorkId, setCurrentWorkId] = useState<string | null>(null);
  const [savedSig, setSavedSig] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const inFlightRef = useRef(false);
  const { toast } = useToast();
  const { isSignedIn } = useUser();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();

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

  // ---------------------------------------------------------------------------
  // Save / library
  // ---------------------------------------------------------------------------

  const currentSig = useMemo(
    () => workSignature(projectName, state),
    [projectName, state]
  );

  const saveStatus: SaveStatus = useMemo(() => {
    if (isSaving) return { kind: "saving" };
    if (savedAt && savedSig === currentSig) return { kind: "saved", at: savedAt };
    if (savedSig != null) return { kind: "dirty" };
    return { kind: "idle" };
  }, [isSaving, savedAt, savedSig, currentSig]);

  const onSave = useCallback(async () => {
    if (!isSignedIn) {
      // Soft auth gate: send anonymous users through sign-in; they can hit
      // save again afterwards. Applies to both button and Cmd/Ctrl+S paths.
      setLocation("/sign-in");
      return;
    }
    // Synchronous mutex — state is set asynchronously, so two rapid
    // invocations could both clear the state guard and double-create.
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setIsSaving(true);
    const name = projectName.trim() || "Untitled";
    const payload = {
      name,
      shape: state.shape,
      state: state as unknown as Record<string, unknown>,
    };
    try {
      let result;
      let didCreate = !currentWorkId;
      if (currentWorkId) {
        try {
          result = await updateWorkApi(currentWorkId, payload);
        } catch (err) {
          // Fall back to create if the work was deleted from another
          // surface (e.g. library) and our id is stale.
          if (isHttpStatus(err, 404)) {
            setCurrentWorkId(null);
            result = await createWorkApi(payload);
            didCreate = true;
          } else {
            throw err;
          }
        }
      } else {
        result = await createWorkApi(payload);
      }
      setCurrentWorkId(result.id);
      setSavedSig(workSignature(name, state));
      setSavedAt(new Date());
      qc.invalidateQueries({ queryKey: getListWorksQueryKey() });
      toast({
        title: didCreate ? "Created" : "Saved",
        description: `"${name}"`,
      });
    } catch (e) {
      toast({
        title: "Could not save",
        description: String(e),
        variant: "destructive",
      });
    } finally {
      inFlightRef.current = false;
      setIsSaving(false);
    }
  }, [isSignedIn, projectName, state, currentWorkId, qc, toast, setLocation]);

  const onLoadWork = useCallback(
    (work: { id: string; name: string; state: CanvasState }) => {
      setProjectName(work.name);
      setCurrentWorkId(work.id);
      undoable.replace(work.state);
      const sig = workSignature(work.name, work.state);
      setSavedSig(sig);
      setSavedAt(new Date());
    },
    [undoable]
  );

  // Reset save tracking when user signs out.
  useEffect(() => {
    if (!isSignedIn) {
      setCurrentWorkId(null);
      setSavedSig(null);
      setSavedAt(null);
    }
  }, [isSignedIn]);

  // ---------------------------------------------------------------------------
  // Keyboard shortcuts
  // ---------------------------------------------------------------------------
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
      if (meta && e.key.toLowerCase() === "s") {
        e.preventDefault();
        onSave();
        return;
      }
      if (isField) return;
      if (e.key === "e" || e.key === "E") {
        e.preventDefault();
        onExportSvg();
      } else if (e.key === "[") {
        e.preventDefault();
        setShape(nextShape(state.shape, -1));
      } else if (e.key === "]") {
        e.preventDefault();
        setShape(nextShape(state.shape, 1));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undoable, onExportSvg, onSave, setShape, state.shape, updateState]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (saveStatus.kind !== "dirty") return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [saveStatus.kind]);

  return (
    <div className="h-full w-full flex flex-col bg-background overflow-hidden">
      <Toolbar
        projectName={projectName}
        onProjectNameChange={setProjectName}
        canUndo={undoable.canUndo}
        canRedo={undoable.canRedo}
        onUndo={undoable.undo}
        onRedo={undoable.redo}
        activeShape={state.shape}
        onPickShape={setShape}
        onExportSvg={onExportSvg}
        onCopySvg={onCopySvg}
        onExportPng={onExportPng}
        isDark={isDark}
        onToggleDark={() => setIsDark((d) => !d)}
        undoDepth={undoable.depth}
        saveStatus={saveStatus}
        onSave={onSave}
        onOpenLibrary={() => setLibraryOpen(true)}
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
      <LibrarySheet
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        onLoadWork={onLoadWork}
      />
    </div>
  );
}

function sanitizeFileName(s: string): string {
  return s.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-+|-+$/g, "") || "uto";
}

/** Best-effort HTTP-status check for errors thrown by orval/axios clients. */
function isHttpStatus(err: unknown, status: number): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as {
    status?: number;
    response?: { status?: number };
  };
  return e.status === status || e.response?.status === status;
}
