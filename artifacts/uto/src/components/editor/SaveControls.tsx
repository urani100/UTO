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
  );
}
