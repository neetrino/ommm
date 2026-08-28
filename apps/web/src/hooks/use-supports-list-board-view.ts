"use client";

import { useEffect, useState } from "react";
import { LIST_BOARD_VIEW_MEDIA_QUERY } from "@/lib/viewport-breakpoints";

/**
 * Whether the viewport supports list (vs card-only) layout.
 * Always `false` until after mount so server/hydration markup stays identical.
 */
export function useSupportsListBoardView(): boolean {
  const [supportsListView, setSupportsListView] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(LIST_BOARD_VIEW_MEDIA_QUERY);
    const sync = () => {
      setSupportsListView(mediaQuery.matches);
    };
    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  return supportsListView;
}
