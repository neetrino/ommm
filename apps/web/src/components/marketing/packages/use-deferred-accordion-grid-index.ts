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
      setGridIndex(expandedIndexInRow);
      return undefined;
    }

    if (expandedIndexInRow === null) {
      setGridIndex(null);
      return undefined;
    }

    if (previousTarget === null && !reducedMotion) {
      setGridIndex(null);
      return deferUntilNextPaint(() => {
        setGridIndex(expandedIndexInRow);
      });
    }

    setGridIndex(expandedIndexInRow);
    return undefined;
  }, [expandedIndexInRow, reducedMotion]);

  return gridIndex;
}
