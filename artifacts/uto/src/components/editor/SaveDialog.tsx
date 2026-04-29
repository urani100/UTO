import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  initialName: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: (name: string) => void;
}

function isInvalid(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return "Please enter a name.";
  if (trimmed.toLowerCase() === "untitled")
    return 'Choose a name other than "Untitled".';
  return null;
}

export function SaveDialog({ open, initialName, busy, onCancel, onConfirm }: Props) {
  const [name, setName] = useState(initialName);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      const seed = isInvalid(initialName) ? "" : initialName;
      setName(seed);
      setTouched(false);
    }
  }, [open, initialName]);

  const error = isInvalid(name);
  // Show the error as soon as the user has typed something invalid
  // (e.g. "Untitled"). The empty case still waits for blur or a submit
  // attempt so we don't nag before they've had a chance to type.
  const showError =
    error !== null && (touched || name.trim().length > 0);

  const submit = () => {
    if (busy) return;
    if (error) {
      setTouched(true);
      return;
    }
    onConfirm(name.trim());
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Save Form</DialogTitle>
          <DialogDescription>
            Give this Form a name so you can find it again in your Library.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="space-y-2"
        >
          <Label htmlFor="save-form-name" className="text-[12px]">
            Name
          </Label>
          <Input
            id="save-form-name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched(true)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="e.g. Spiral study no. 3"
            aria-invalid={showError || undefined}
            data-testid="input-save-name"
          />
          {showError ? (
            <p className="text-[12px] text-destructive" data-testid="save-name-error">
              {error}
            </p>
          ) : null}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={busy}
            data-testid="button-save-cancel"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={submit}
            disabled={busy || error !== null}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-testid="button-save-confirm"
          >
            {busy ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
