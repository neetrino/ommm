"use client";

import * as React from "react";

type ElementSize = {
  width: number;
  height: number;
};

const ZERO_SIZE: ElementSize = { width: 0, height: 0 };

function isPositiveSize(size: ElementSize): boolean {
  return size.width > 0 && size.height > 0;
}

function readElementSize(element: HTMLElement): ElementSize {
  const { width, height } = element.getBoundingClientRect();
  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}

/** Observes an element's layout size; returns `isReady` once width and height are positive. */
export function useObservedElementSize<T extends HTMLElement>() {
  const ref = React.useRef<T | null>(null);
  const [size, setSize] = React.useState<ElementSize>(ZERO_SIZE);

  React.useLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const updateSize = () => {
      const next = readElementSize(element);
      setSize((prev) =>
        prev.width === next.width && prev.height === next.height ? prev : next,
      );
    };

    updateSize();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, size, isReady: isPositiveSize(size) };
}
