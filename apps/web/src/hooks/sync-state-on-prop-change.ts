"use client";

import { useState } from "react";

/**
 * Resets local state when `prop` changes (by reference).
 */
export function useSyncStateOnPropChange<T>(prop: T, sync: (next: T) => void): void {
  const [prevProp, setPrevProp] = useState(prop);

  if (prop !== prevProp) {
    setPrevProp(prop);
    sync(prop);
  }
}
