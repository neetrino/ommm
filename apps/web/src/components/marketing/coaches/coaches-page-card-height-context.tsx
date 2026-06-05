"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { COACHES_PAGE_CARD } from "@/components/marketing/coaches/coaches-page-tokens";

const CARD_HEIGHT_TO_WIDTH =
  COACHES_PAGE_CARD.designHeightPx / COACHES_PAGE_CARD.designWidthPx;

const CoachesPageCardHeightContext = createContext<number | null>(null);

function readGridColumnWidthPx(grid: HTMLElement): number {
  const firstItem = grid.querySelector("li");
  return firstItem?.getBoundingClientRect().width ?? 0;
}

/** One shared pixel height from the first grid column width (Figma 428×617). */
export function useCoachesPageGridCardHeight(
  gridRef: RefObject<HTMLUListElement | null>,
): number | null {
  const [heightPx, setHeightPx] = useState<number | null>(null);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) {
      return undefined;
    }

    const syncHeight = () => {
      const width = readGridColumnWidthPx(grid);
      if (width <= 0) {
        return;
      }
      const nextHeight = Math.round(width * CARD_HEIGHT_TO_WIDTH);
      setHeightPx((current) => (current === nextHeight ? current : nextHeight));
    };

    syncHeight();

    const observer = new ResizeObserver(syncHeight);
    observer.observe(grid);

    return () => {
      observer.disconnect();
    };
  }, [gridRef]);

  return heightPx;
}

type CoachesPageCardHeightProviderProps = {
  heightPx: number | null;
  children: ReactNode;
};

export function CoachesPageCardHeightProvider({
  heightPx,
  children,
}: CoachesPageCardHeightProviderProps) {
  return (
    <CoachesPageCardHeightContext.Provider value={heightPx}>
      {children}
    </CoachesPageCardHeightContext.Provider>
  );
}

export function useCoachesPageCardHeightPx(): number | null {
  return useContext(CoachesPageCardHeightContext);
}
