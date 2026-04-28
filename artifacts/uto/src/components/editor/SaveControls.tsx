import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useUser } from "@clerk/react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type SaveStatus =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "dirty" }
  | { kind: "saved"; at: Date };

interface Props {
  status: SaveStatus;
  onSave: () => void;
}

export function SaveControls({ status, onSave }: Props) {
  const { isSignedIn } = useUser();
  const [, setLocation] = useLocation();

  return (
    <div className="flex items-center gap-2">
      <SaveStatusLine status={status} signedIn={!!isSignedIn} />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (!isSignedIn) {
                setLocation("/sign-in");
                return;
              }
              onSave();
            }}
            disabled={status.kind === "saving"}
            className="h-8 px-2.5 gap-1.5 text-[12px] font-medium rounded-md border-border/80 hover:bg-foreground/[.04]"
            data-testid="button-save"
          >
            <Save size={13} strokeWidth={1.8} />
            Save
          </Button>
        </TooltipTrigger>
        <TooltipContent>Save · ⌘S</TooltipContent>
      </Tooltip>
    </div>
  );
}

function SaveStatusLine({
  status,
  signedIn,
}: {
  status: SaveStatus;
  signedIn: boolean;
}) {
  // Re-render every 30s so "Saved · 2m ago" stays current
  const [, setTick] = useState(0);
  useEffect(() => {
    if (status.kind !== "saved") return;
    const t = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, [status]);

  if (!signedIn && status.kind === "idle") {
    return null;
  }
  if (!signedIn) {
    return (
      <span
        className="text-[10.5px] italic text-muted-foreground/80 num-tab"
        data-testid="save-status"
      >
        Sign in to save
      </span>
    );
  }
  if (status.kind === "saving") {
    return (
      <span
        className="text-[10.5px] italic text-muted-foreground num-tab"
        data-testid="save-status"
      >
        Saving…
      </span>
    );
  }
  if (status.kind === "dirty") {
    return (
      <span
        className="text-[10.5px] italic text-muted-foreground/80 num-tab"
        data-testid="save-status"
      >
        Unsaved changes
      </span>
    );
  }
  if (status.kind === "saved") {
    return (
      <span
        className="text-[10.5px] italic text-muted-foreground num-tab"
        data-testid="save-status"
      >
        Saved · {relTime(status.at)}
      </span>
    );
  }
  return null;
}

function relTime(d: Date): string {
  const diff = Math.max(0, Date.now() - d.getTime());
  const s = Math.floor(diff / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}
