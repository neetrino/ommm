import { useEffect, useRef } from "react";

type UseCloseOnEscapeOptions = {
  disabled?: boolean;
};

type EscapeLayer = {
  close: () => void;
  isDisabled: () => boolean;
};

const escapeLayers: EscapeLayer[] = [];

/**
 * Calls `onClose` when Escape is pressed while `isOpen` is true.
 * Only the topmost open layer handles Escape (nested modals/drawers).
 */
export function useCloseOnEscape(
  isOpen: boolean,
  onClose: () => void,
  options?: UseCloseOnEscapeOptions,
): void {
  const disabled = options?.disabled ?? false;
  const disabledRef = useRef(disabled);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    disabledRef.current = disabled;
    onCloseRef.current = onClose;
  }, [disabled, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const layer: EscapeLayer = {
      close: () => {
        onCloseRef.current();
      },
      isDisabled: () => disabledRef.current,
    };

    escapeLayers.push(layer);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }
      const top = escapeLayers[escapeLayers.length - 1];
      if (top !== layer || top.isDisabled()) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      top.close();
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      const index = escapeLayers.indexOf(layer);
      if (index >= 0) {
        escapeLayers.splice(index, 1);
      }
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [isOpen]);
}
