import { useEffect } from "react";

type UseCloseOnEscapeOptions = {
  disabled?: boolean;
};

/**
 * Calls `onClose` when Escape is pressed while `isOpen` is true.
 */
export function useCloseOnEscape(
  isOpen: boolean,
  onClose: () => void,
  options?: UseCloseOnEscapeOptions,
): void {
  const disabled = options?.disabled ?? false;

  useEffect(() => {
    if (!isOpen || disabled) {
      return undefined;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }
      onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [disabled, isOpen, onClose]);
}
