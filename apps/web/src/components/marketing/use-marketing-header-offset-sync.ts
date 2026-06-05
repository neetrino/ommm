"use client";

import { useEffect } from "react";

export const OMMM_MARKETING_SITE_HEADER_OFFSET_VAR =
  "--ommm-marketing-site-header-offset";

const ACCOUNT_SHELL_SELECTOR = "[data-marketing-account-shell]";
const ACCOUNT_HEADER_SELECTOR = 'header[data-account-shell="true"]';

/**
 * Keeps `--ommm-marketing-site-header-offset` equal to the rendered marketing header
 * height so dashboard padding, fixed sidebar top, and header bottom stay aligned.
 */
export function useMarketingHeaderOffsetSync(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const shell = document.querySelector(ACCOUNT_SHELL_SELECTOR);
    const header = document.querySelector(ACCOUNT_HEADER_SELECTOR);
    if (shell === null || header === null) {
      return undefined;
    }

    const shellEl = shell as HTMLElement;

    const sync = () => {
      const height = Math.ceil(header.getBoundingClientRect().height);
      shellEl.style.setProperty(
        OMMM_MARKETING_SITE_HEADER_OFFSET_VAR,
        `${height}px`,
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
    };
  }, [enabled]);
}
