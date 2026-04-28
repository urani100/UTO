import { useCallback, useRef, useState } from "react";

interface UndoableApi<T> {
  state: T;
  set: (next: T | ((prev: T) => T), opts?: { coalesce?: boolean }) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  depth: number;
}

const MAX = 60;

/**
 * A simple undo/redo stack with optional coalescing — adjacent rapid edits
 * (e.g. dragging a slider) collapse into a single history entry.
 */
export function useUndoable<T>(initial: T): UndoableApi<T> {
  const [state, setState] = useState<T>(initial);
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);
  const lastPushTs = useRef<number>(0);

  const set = useCallback((next: T | ((prev: T) => T), opts?: { coalesce?: boolean }) => {
    setState((prev) => {
      const value = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      const now = performance.now();
      const coalesce = opts?.coalesce ?? false;
      if (!coalesce || now - lastPushTs.current > 350) {
        past.current.push(prev);
        if (past.current.length > MAX) past.current.shift();
        future.current = [];
      }
      lastPushTs.current = now;
      return value;
    });
  }, []);

  const undo = useCallback(() => {
    setState((cur) => {
      const prev = past.current.pop();
      if (prev === undefined) return cur;
      future.current.push(cur);
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setState((cur) => {
      const next = future.current.pop();
      if (next === undefined) return cur;
      past.current.push(cur);
      return next;
    });
  }, []);

  return {
    state,
    set,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
    depth: past.current.length,
  };
}
