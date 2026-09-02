import { useEffect, useRef, type RefObject } from "react";

/**
 * Closes a floating control when clicking outside its root or pressing Escape.
 */
export function useDismissWhenOutside(
  open: boolean,
  rootRef: RefObject<HTMLElement | null>,
  dismiss: () => void,
): void {
  const dismissRef = useRef(dismiss);

  useEffect(() => {
    dismissRef.current = dismiss;
  }, [dismiss]);

  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        dismissRef.current();
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") dismissRef.current();
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, rootRef]);
}
