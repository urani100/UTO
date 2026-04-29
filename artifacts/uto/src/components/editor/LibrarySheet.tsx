import { useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/react";
import { useLocation } from "wouter";
import {
  useListWorks,
  useDeleteWork,
  getWork,
  getListWorksQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, FolderOpen, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SHAPE_META } from "@/lib/shapes";
import type { ShapeId, CanvasState } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Called when the user opens a work — should swap state into the editor. */
  onLoadWork: (work: {
    id: string;
    name: string;
    state: CanvasState;
  }) => void;
}

export function LibrarySheet({ open, onOpenChange, onLoadWork }: Props) {
  const { isSignedIn } = useUser();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: works = [], isLoading } = useListWorks({
    query: {
      enabled: open && !!isSignedIn,
      queryKey: getListWorksQueryKey(),
    },
  });

  const deleteMut = useDeleteWork({
    mutation: {
      onSuccess: () =>
        qc.invalidateQueries({ queryKey: getListWorksQueryKey() }),
    },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[400px] sm:max-w-[400px] flex flex-col p-0 bg-background"
      >
        <SheetHeader className="px-6 pt-6 pb-3 space-y-1">
          <SheetTitle className="text-[15px] font-semibold tracking-tight">
            Library
          </SheetTitle>
          <SheetDescription className="text-[12.5px] text-muted-foreground">
            {isSignedIn
              ? `${works.length} ${works.length === 1 ? "form" : "forms"}`
              : "Sign in to see your saved forms."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-6">
          {!isSignedIn ? (
            <div className="px-3 pt-8 flex flex-col items-center text-center gap-3">
              <FolderOpen
                size={28}
                strokeWidth={1.4}
                className="text-muted-foreground/60"
              />
              <p className="text-[12.5px] text-muted-foreground max-w-[260px]">
                Your library is private to your account.
              </p>
              <Button
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  setLocation("/sign-in");
                }}
                className="mt-1"
                data-testid="library-signin"
              >
                Sign in
              </Button>
            </div>
          ) : isLoading ? (
            <div className="px-3 pt-8 text-[12.5px] text-muted-foreground italic">
              Loading…
            </div>
          ) : works.length === 0 ? (
            <div className="px-3 pt-8 flex flex-col items-center text-center gap-3">
              <FileText
                size={28}
                strokeWidth={1.4}
                className="text-muted-foreground/60"
              />
              <p className="text-[12.5px] text-muted-foreground max-w-[260px]">
                Nothing saved yet. Press <kbd className="font-mono text-[11px] px-1 py-0.5 bg-muted rounded border border-border/60">⌘S</kbd> to save the current canvas.
              </p>
            </div>
          ) : (
            <ul className="space-y-0.5 pt-1">
              {works.map((w) => (
                <WorkRow
                  key={w.id}
                  id={w.id}
                  name={w.name}
                  shape={w.shape}
                  updatedAt={new Date(w.updatedAt)}
                  onOpen={async () => {
                    try {
                      const full = await getWork(w.id);
                      onLoadWork({
                        id: full.id,
                        name: full.name,
                        state: full.state as unknown as CanvasState,
                      });
                      onOpenChange(false);
                      toast({ title: `Opened "${full.name}"` });
                    } catch (e) {
                      toast({
                        title: "Could not open",
                        description: String(e),
                        variant: "destructive",
                      });
                    }
                  }}
                  onDelete={async () => {
                    try {
                      await deleteMut.mutateAsync({ id: w.id });
                      toast({ title: `Deleted "${w.name}"` });
                    } catch (e) {
                      toast({
                        title: "Could not delete",
                        description: String(e),
                        variant: "destructive",
                      });
                    }
                  }}
                />
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function WorkRow({
  id,
  name,
  shape,
  updatedAt,
  onOpen,
  onDelete,
}: {
  id: string;
  name: string;
  shape: string;
  updatedAt: Date;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const meta = useMemo(() => SHAPE_META[shape as ShapeId], [shape]);

  return (
    <li
      className="group flex items-center gap-2 rounded-md px-2.5 py-2 hover:bg-foreground/[.04] transition-colors"
      data-testid={`work-row-${id}`}
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex-1 min-w-0 flex items-center gap-3 text-left"
      >
        <span
          className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-[0.08em] bg-muted text-muted-foreground border border-border/60 num-tab"
          aria-label={`shape ${meta?.name ?? shape}`}
        >
          {meta?.name ?? shape}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[13px] font-medium text-foreground truncate">
            {name || "Untitled"}
          </span>
          <span className="block text-[10.5px] text-muted-foreground num-tab">
            {formatRelative(updatedAt)}
          </span>
        </span>
      </button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            type="button"
            aria-label={`Delete ${name}`}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
            data-testid={`delete-${id}`}
          >
            <Trash2 size={13} strokeWidth={1.6} />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}

function formatRelative(d: Date): string {
  const diffMs = Date.now() - d.getTime();
  const s = Math.floor(diffMs / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: d.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}
