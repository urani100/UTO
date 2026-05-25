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
import { SaveDialog } from "@/components/editor/SaveDialog";
import type { SaveStatus } from "@/components/editor/SaveControls";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUndoable } from "@/hooks/useUndoable";
import { useToast } from "@/hooks/use-toast";
import { INITIAL_STATE } from "@/lib/initialState";
import type { CanvasState, ShapeId } from "@/lib/types";
import { nextShape } from "@/lib/randomize";
import { SHAPE_LIST, SHAPE_META } from "@/lib/shapes";
import { Shapes, SlidersHorizontal, X } from "lucide-react";
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
  const [mobilePanelOpen, setMobilePanelOpen] = useState(() =>
    window.matchMedia("(max-width: 767px)").matches
  );
  const isMobile = useIsMobile();
  const [currentWorkId, setCurrentWorkId] = useState<string | null>(null);
  const [savedSig, setSavedSig] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const inFlightRef = useRef(false);
  const { toast } = useToast();
  const { isLoaded: clerkLoaded, isSignedIn } = useUser();
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

  // Toggling the theme also swaps the canvas ink and paper so the artwork
  // tracks the surrounding chrome. Wired through the undoable history so
  // the user can revert with ⌘Z.
  const onToggleTheme = useCallback(() => {
    setIsDark((d) => !d);
    undoable.set((s) => ({
      ...s,
      textColor: s.backgroundColor,
      backgroundColor: s.textColor,
    }));
  }, [undoable]);

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
      if (state.shape === id) return;
      // Changing the Form starts a new piece — clear the saved-work id
      // so the next Save creates a fresh library entry instead of
      // overwriting the previous one. Side effects live outside the
      // undoable updater so the updater itself stays pure.
      setCurrentWorkId(null);
      setSavedSig(null);
      setSavedAt(null);
      const meta = SHAPE_META[id];
      undoable.set((s) => ({ ...s, shape: id, ...(meta?.canvasDefaults ?? {}) }));
    },
    [state.shape, undoable]
  );

  /** Auth gate for SAVE and other API-bound actions. Lets clicks through
   *  while Clerk is still hydrating (the API enforces auth on its end, so
   *  a stale-undefined signal here can't grant unauthorised access).
   *  Bouncing during that brief window would falsely log out users who
   *  actually have a session. */
  const requireAuthForApi = useCallback((): boolean => {
    if (clerkLoaded && isSignedIn === false) {
      setLocation("/sign-in");
      return false;
    }
    return true;
  }, [clerkLoaded, isSignedIn, setLocation]);

  /** Auth gate for EXPORT actions. Exports run entirely client-side so we
   *  can't fall back on the API to gate; we must wait for Clerk to resolve
   *  before allowing the action through. While loading we show a brief
   *  notice and abort. */
  const requireAuthForExport = useCallback((): boolean => {
    if (!clerkLoaded) {
      toast({ title: "Checking session…", description: "Try again in a moment." });
      return false;
    }
    if (!isSignedIn) {
      setLocation("/sign-in");
      return false;
    }
    return true;
  }, [clerkLoaded, isSignedIn, setLocation, toast]);

  const onExportSvg = useCallback(() => {
    if (!requireAuthForExport()) return;
    if (!svgRef.current) return;
    downloadSvg(svgRef.current, sanitizeFileName(projectName) + ".svg");
    toast({ title: "SVG exported", description: "Saved to your downloads." });
  }, [requireAuthForExport, projectName, toast]);

  const onCopySvg = useCallback(async () => {
    if (!requireAuthForExport()) return;
    if (!svgRef.current) return;
    try {
      await copySvgToClipboard(svgRef.current);
      toast({ title: "Copied SVG to clipboard" });
    } catch {
      toast({ title: "Could not copy", description: "Browser blocked clipboard access.", variant: "destructive" });
    }
  }, [requireAuthForExport, toast]);

  const onExportPng = useCallback(
    async (scale: 1 | 2 | 4) => {
      if (!requireAuthForExport()) return;
      if (!svgRef.current) return;
      toast({ title: `Rendering PNG ${scale}×…` });
      try {
        await exportPng(svgRef.current, scale, sanitizeFileName(projectName) + `@${scale}x.png`);
      } catch (e) {
        toast({ title: "Export failed", description: String(e), variant: "destructive" });
      }
    },
    [requireAuthForExport, projectName, toast]
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

  /** Returns true if the current name passes our "real name" gate. */
  const nameNeedsPrompt = useCallback((n: string) => {
    const t = n.trim();
    return t.length === 0 || t.toLowerCase() === "untitled";
  }, []);

  /** Performs the actual create/update against the API. Pure of UI gating —
   *  the dialog and the silent paths both call this. */
  const persist = useCallback(
    async (name: string): Promise<{ ok: boolean; didCreate: boolean }> => {
      if (inFlightRef.current) return { ok: false, didCreate: false };
      inFlightRef.current = true;
      setIsSaving(true);
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
        return { ok: true, didCreate };
      } catch (e) {
        toast({
          title: "Could not save",
          description: String(e),
          variant: "destructive",
        });
        return { ok: false, didCreate: false };
      } finally {
        inFlightRef.current = false;
        setIsSaving(false);
      }
    },
    [state, currentWorkId, qc, toast]
  );

  const onSave = useCallback(() => {
    if (!requireAuthForApi()) return;
    if (inFlightRef.current) return;
    // First save of a piece, or empty/Untitled name → ask for a name first.
    if (currentWorkId == null || nameNeedsPrompt(projectName)) {
      setSaveDialogOpen(true);
      return;
    }
    // Iterating on an already-named work — silent update with a small toast.
    void (async () => {
      const r = await persist(projectName.trim());
      if (r.ok) toast({ title: "Saved" });
    })();
  }, [requireAuthForApi, currentWorkId, projectName, nameNeedsPrompt, persist, toast]);

  const onConfirmSave = useCallback(
    async (name: string) => {
      setProjectName(name);
      const r = await persist(name);
      if (r.ok) {
        setSaveDialogOpen(false);
      }
    },
    [persist]
  );

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

  // Reset save tracking when user signs out. Guard on `clerkLoaded`
  // so we don't clobber state during the brief hydration window where
  // isSignedIn is still undefined.
  useEffect(() => {
    if (clerkLoaded && isSignedIn === false) {
      setCurrentWorkId(null);
      setSavedSig(null);
      setSavedAt(null);
    }
  }, [clerkLoaded, isSignedIn]);

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
        onToggleDark={onToggleTheme}
        undoDepth={undoable.depth}
        saveStatus={saveStatus}
        onSave={onSave}
        onOpenLibrary={() => setLibraryOpen(true)}
        isMobile={isMobile}
      />
      <div className={`flex-1 min-h-0 flex ${isMobile && mobilePanelOpen ? "flex-col" : ""}`}>
        <main
          className={`min-w-0 flex items-center justify-center relative bg-stage ${
            isMobile && mobilePanelOpen ? "h-[248px] flex-none" : "flex-1"
          }`}
        >
          <Canvas state={state} ref={svgRef} onMetaUpdate={setMeta} />
        </main>
        {isMobile && mobilePanelOpen && (
          <div className="flex-1 min-h-0 overflow-y-auto border-t border-border/60 bg-background">
            {/* Form section */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <div>
                <p className="text-[15px] font-semibold tracking-tight leading-snug">Form</p>
                <p className="text-[12px] text-muted-foreground">Choose a shape for your composition.</p>
              </div>
              <button
                type="button"
                onClick={() => setMobilePanelOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex-none"
              >
                <X size={14} strokeWidth={2} />
              </button>
            </div>
            <div className="px-3 pb-4 pt-1">
              <div className="grid grid-cols-2 gap-1.5">
                {SHAPE_LIST.map((m) => {
                  const active = m.id === state.shape;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setShape(m.id)}
                      data-testid={`shape-${m.id}`}
                      className={
                        "h-12 px-3 rounded-md text-left text-[13px] font-medium transition-colors " +
                        (active
                          ? "bg-primary text-primary-foreground"
                          : "bg-foreground/[.04] text-foreground hover:bg-foreground/[.08]")
                      }
                    >
                      {m.name}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Settings section */}
            <div className="border-t border-border/60 px-5 pt-4 pb-2">
              <p className="text-[15px] font-semibold tracking-tight leading-snug">Settings</p>
              <p className="text-[12px] text-muted-foreground">Adjust text, shape, composition, and color.</p>
            </div>
            <RightInspector
              state={state}
              onChange={updateState}
              onShapeParam={updateShapeParam}
              embedded
            />
          </div>
        )}
        {!isMobile && (
          <RightInspector
            state={state}
            onChange={updateState}
            onShapeParam={updateShapeParam}
          />
        )}
      </div>
      {!isMobile && (
        <StatusStrip
          shape={state.shape}
          chars={meta.chars}
          pathLen={meta.pathLen}
          ms={meta.ms}
        />
      )}
      {isMobile && (
        <MobileBottomBar
          shape={state.shape}
          panelOpen={mobilePanelOpen}
          onTogglePanel={() => setMobilePanelOpen((v) => !v)}
        />
      )}

      <LibrarySheet
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        onLoadWork={onLoadWork}
      />
      <SaveDialog
        open={saveDialogOpen}
        initialName={projectName}
        busy={isSaving}
        onCancel={() => setSaveDialogOpen(false)}
        onConfirm={onConfirmSave}
      />
    </div>
  );
}

function MobileBottomBar({
  shape,
  panelOpen,
  onTogglePanel,
}: {
  shape: ShapeId;
  panelOpen: boolean;
  onTogglePanel: () => void;
}) {
  const meta = SHAPE_META[shape];
  return (
    <nav className="h-14 flex-none border-t border-border/60 bg-background/95 backdrop-blur-xl flex items-stretch">
      <button
        type="button"
        onClick={onTogglePanel}
        data-testid="mobile-open-inspector"
        className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors active:bg-foreground/[.08] ${
          panelOpen ? "text-foreground bg-foreground/[.05]" : "text-[#716e6e] hover:bg-foreground/[.04]"
        }`}
      >
        <SlidersHorizontal size={18} strokeWidth={panelOpen ? 2 : 1.6} />
        <span className="text-[10.5px] font-medium uppercase tracking-[0.14em]">Settings</span>
      </button>
    </nav>
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
