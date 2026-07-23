"use client";

import { useEffect } from "react";

const LAYOUT_VIEWPORT_WIDTH_VAR = "--ommm-layout-vw-px";
const LAYOUT_VIEWPORT_HEIGHT_VAR = "--ommm-layout-vh-px";

function syncLayoutViewportCssVars(): void {
  const root = document.documentElement;
  root.style.setProperty(LAYOUT_VIEWPORT_WIDTH_VAR, `${root.clientWidth}px`);
  root.style.setProperty(LAYOUT_VIEWPORT_HEIGHT_VAR, `${window.innerHeight}px`);
}

/** Keeps mobile Figma fluid tokens aligned with layout viewport width (DevTools / device). */
export function OmmmLayoutViewportSync(): null {
  useEffect(() => {
    syncLayoutViewportCssVars();

    window.addEventListener("resize", syncLayoutViewportCssVars, { passive: true });
    window.visualViewport?.addEventListener("resize", syncLayoutViewportCssVars);

    return () => {
      window.removeEventListener("resize", syncLayoutViewportCssVars);
      window.visualViewport?.removeEventListener("resize", syncLayoutViewportCssVars);
    };
  }, []);

  return null;
}
