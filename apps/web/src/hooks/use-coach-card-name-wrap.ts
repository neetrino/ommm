"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";

const OVERFLOW_EPSILON_PX = 1;

type UseCoachCardNameWrapOptions = {
  /** Wait until the mobile carousel has finished centering before measuring. */
  layoutReady?: boolean;
};

function nameTextOverflows(element: HTMLParagraphElement): boolean {
  const containerWidth = element.clientWidth;
  if (containerWidth <= OVERFLOW_EPSILON_PX) {
    return false;
  }

  const textNode = element.firstChild;
  if (textNode !== null) {
    const range = document.createRange();
    range.selectNodeContents(textNode);
    const textWidth = range.getBoundingClientRect().width;
    if (textWidth > containerWidth + OVERFLOW_EPSILON_PX) {
      return true;
    }
  }

  // Fallback — scrollWidth can match clientWidth when ellipsis is active.
  return element.scrollWidth > containerWidth + OVERFLOW_EPSILON_PX;
}

function bumpLayoutEpoch(
  setWrapWords: (value: boolean) => void,
  setLayoutEpoch: (updater: (value: number) => number) => void,
): void {
  setWrapWords(false);
  setLayoutEpoch((value) => value + 1);
}

/** True when the default single-line coach name would ellipsize. */
export function useCoachCardNameWrap(
  name: string,
  options: UseCoachCardNameWrapOptions = {},
): {
  wrapWords: boolean;
  nameRef: RefObject<HTMLParagraphElement | null>;
} {
  const { layoutReady = true } = options;
  const nameRef = useRef<HTMLParagraphElement>(null);
  const [wrapWords, setWrapWords] = useState(false);
  const [layoutEpoch, setLayoutEpoch] = useState(0);

  useLayoutEffect(() => {
    bumpLayoutEpoch(setWrapWords, setLayoutEpoch);
  }, [name]);

  useLayoutEffect(() => {
    if (!layoutReady) {
      return undefined;
    }

    bumpLayoutEpoch(setWrapWords, setLayoutEpoch);

    let raf2: number | undefined;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        bumpLayoutEpoch(setWrapWords, setLayoutEpoch);
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      if (raf2 !== undefined) {
        cancelAnimationFrame(raf2);
      }
    };
  }, [layoutReady, name]);

  useLayoutEffect(() => {
    const element = nameRef.current;
    if (element === null) {
      return undefined;
    }

    const scheduleRemeasure = () => {
      bumpLayoutEpoch(setWrapWords, setLayoutEpoch);
    };

    const observer = new ResizeObserver(scheduleRemeasure);
    observer.observe(element);
    const header = element.parentElement;
    if (header !== null) {
      observer.observe(header);
    }

    return () => {
      observer.disconnect();
    };
  }, [name]);

  useEffect(() => {
    if (typeof document === "undefined" || document.fonts === undefined) {
      return undefined;
    }

    let cancelled = false;
    const remeasureAfterFonts = () => {
      if (!cancelled) {
        bumpLayoutEpoch(setWrapWords, setLayoutEpoch);
      }
    };

    void document.fonts.ready.then(remeasureAfterFonts);
    document.fonts.addEventListener("loadingdone", remeasureAfterFonts);

    return () => {
      cancelled = true;
      document.fonts.removeEventListener("loadingdone", remeasureAfterFonts);
    };
  }, [name]);

  useLayoutEffect(() => {
    if (!layoutReady || wrapWords) {
      return;
    }
    const element = nameRef.current;
    if (element === null) {
      return;
    }
    if (nameTextOverflows(element)) {
      setWrapWords(true);
    }
  }, [layoutEpoch, layoutReady, name, wrapWords]);

  return { wrapWords, nameRef };
}

/** Splits a coach display name into words for stacked mobile layout. */
export function splitCoachCardNameWords(name: string): string[] {
  return name.trim().split(/\s+/).filter((word) => word.length > 0);
}
