"use client";

import { useLayoutEffect, useState, type RefObject } from "react";
import {
  INTEGRATED_SEARCH_FILTER_PANEL_GAP_PX,
  INTEGRATED_SEARCH_FILTER_PANEL_MAX_WIDTH_PX,
  INTEGRATED_SEARCH_FILTER_PANEL_MIN_HEIGHT_PX,
  INTEGRATED_SEARCH_FILTER_PANEL_MIN_WIDTH_PX,
  INTEGRATED_SEARCH_FILTER_PANEL_VIEWPORT_EDGE_PX,
} from "@/components/shared/search/integrated-search-filters.constants";

export type PortaledFilterPanelPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

export function usePortaledFilterPanelPosition(
  containerRef: RefObject<HTMLDivElement | null>,
  panelOpen: boolean,
  enabled: boolean,
): PortaledFilterPanelPosition | null {
  const [position, setPosition] = useState<PortaledFilterPanelPosition | null>(null);
  const panelEnabled = enabled && panelOpen;

  useLayoutEffect(() => {
    if (!panelEnabled) {
      return undefined;
    }

    const update = (): void => {
      const element = containerRef.current;
      if (element === null) {
        return;
      }
      const rect = element.getBoundingClientRect();
      const width = Math.min(
        INTEGRATED_SEARCH_FILTER_PANEL_MAX_WIDTH_PX,
        window.innerWidth - INTEGRATED_SEARCH_FILTER_PANEL_VIEWPORT_EDGE_PX * 2,
        Math.max(rect.width, INTEGRATED_SEARCH_FILTER_PANEL_MIN_WIDTH_PX),
      );
      const left = Math.max(
        INTEGRATED_SEARCH_FILTER_PANEL_VIEWPORT_EDGE_PX,
        Math.min(
          rect.left,
          window.innerWidth - width - INTEGRATED_SEARCH_FILTER_PANEL_VIEWPORT_EDGE_PX,
        ),
      );
      const maxHeight = Math.max(
        INTEGRATED_SEARCH_FILTER_PANEL_MIN_HEIGHT_PX,
        window.innerHeight -
          rect.bottom -
          INTEGRATED_SEARCH_FILTER_PANEL_GAP_PX -
          INTEGRATED_SEARCH_FILTER_PANEL_VIEWPORT_EDGE_PX,
      );
      setPosition({ top: rect.bottom + INTEGRATED_SEARCH_FILTER_PANEL_GAP_PX, left, width, maxHeight });
    };

    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [containerRef, panelEnabled]);

  return panelEnabled ? position : null;
}
