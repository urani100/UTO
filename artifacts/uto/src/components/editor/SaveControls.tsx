import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useUser } from "@clerk/react";

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
      <button
        type="button"
        onClick={() => {
          if (!isSignedIn) {
            setLocation("/sign-in");
            return;
          }
          onSave();
        }}
        disabled={status.kind === "saving"}
        className="h-8 px-2.5 rounded-md flex items-center hover:bg-foreground/[.05] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        data-testid="button-save"
      >
        <span
          className="font-serif text-[20px] font-bold text-[#716e6e]"
          style={{ letterSpacing: "1.1px" }}
        >
          Save
        </span>
      </button>
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
