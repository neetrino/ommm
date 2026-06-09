"use client";

import { useEffect } from "react";
import { OMMM_ADMIN_HEADER_STICKY_OFFSET_VAR } from "@/components/shell/use-admin-sticky-header-offset";

export const OMMM_MARKETING_SITE_HEADER_OFFSET_VAR =
  "--ommm-marketing-site-header-offset";

const WORKSPACE_SHELL_SELECTOR = "[data-workspace-shell]";
const WORKSPACE_HEADER_SELECTOR = 'header[data-workspace-shell="true"]';

/**
 * Keeps header offset CSS variables equal to the rendered global site header height
 * so dashboard padding, fixed sidebar top, and nested sticky regions stay aligned.
 */
export function useMarketingHeaderOffsetSync(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const shell = document.querySelector(WORKSPACE_SHELL_SELECTOR);
    const header = document.querySelector(WORKSPACE_HEADER_SELECTOR);
    if (shell === null || header === null) {
      return undefined;
    }

    const shellEl = shell as HTMLElement;

    const sync = () => {
      const height = Math.ceil(header.getBoundingClientRect().height);
      const heightPx = `${height}px`;
      shellEl.style.setProperty(OMMM_MARKETING_SITE_HEADER_OFFSET_VAR, heightPx);
      document.documentElement.style.setProperty(
        OMMM_MARKETING_SITE_HEADER_OFFSET_VAR,
        heightPx,
      );
      document.documentElement.style.setProperty(
        OMMM_ADMIN_HEADER_STICKY_OFFSET_VAR,
        heightPx,
      );
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(header);
    window.addEventListener("resize", sync);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sync);
      shellEl.style.removeProperty(OMMM_MARKETING_SITE_HEADER_OFFSET_VAR);
      document.documentElement.style.removeProperty(OMMM_MARKETING_SITE_HEADER_OFFSET_VAR);
      document.documentElement.style.removeProperty(OMMM_ADMIN_HEADER_STICKY_OFFSET_VAR);
    };
  }, [enabled]);
}
