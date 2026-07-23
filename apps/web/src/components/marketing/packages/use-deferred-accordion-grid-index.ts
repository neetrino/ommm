import { useLayoutEffect, useRef, useState } from "react";

function deferUntilNextPaint(callback: () => void): () => void {
  let innerFrame = 0;
  const outerFrame = requestAnimationFrame(() => {
    innerFrame = requestAnimationFrame(callback);
  });
  return () => {
    cancelAnimationFrame(outerFrame);
    cancelAnimationFrame(innerFrame);
  };
}

function scheduleMicrotaskStateUpdate(update: () => void): () => void {
  let cancelled = false;
  queueMicrotask(() => {
    if (!cancelled) {
      update();
    }
  });
  return () => {
    cancelled = true;
  };
}

/** Defers grid column update by two frames when opening from idle. */
export function useDeferredAccordionGridIndex(
  expandedIndexInRow: number | null,
  reducedMotion: boolean,
): number | null {
  const [gridIndex, setGridIndex] = useState<number | null>(expandedIndexInRow);
  const previousTargetRef = useRef<number | null | undefined>(undefined);

  useLayoutEffect(() => {
    const previousTarget = previousTargetRef.current;
    previousTargetRef.current = expandedIndexInRow;

    if (previousTarget === undefined) {
      return scheduleMicrotaskStateUpdate(() => {
        setGridIndex(expandedIndexInRow);
      });
    }

    if (expandedIndexInRow === null) {
      return scheduleMicrotaskStateUpdate(() => {
        setGridIndex(null);
      });
    }

    if (previousTarget === null && !reducedMotion) {
      let cancelDeferred = () => {};
      const cancelImmediate = scheduleMicrotaskStateUpdate(() => {
        setGridIndex(null);
        cancelDeferred = deferUntilNextPaint(() => {
          setGridIndex(expandedIndexInRow);
        });
      });
      return () => {
        cancelImmediate();
        cancelDeferred();
      };
    }

    return scheduleMicrotaskStateUpdate(() => {
      setGridIndex(expandedIndexInRow);
    });
  }, [expandedIndexInRow, reducedMotion]);

  return gridIndex;
}
