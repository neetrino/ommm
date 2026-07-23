"use client";

import { useLayoutEffect } from "react";

/** Prevent the browser from restoring home scroll depth on `/user` entry. */
export function MemberUserScrollRestoration() {
  useLayoutEffect(() => {
    if (typeof history === "undefined") {
      return undefined;
    }

    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";

    return () => {
      history.scrollRestoration = previous;
    };
  }, []);

  return null;
}
