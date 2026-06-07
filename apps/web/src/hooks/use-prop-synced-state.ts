"use client";

import { useState, type Dispatch, type SetStateAction } from "react";

/**
 * Local state that resets when the prop value changes (by reference).
 */
export function usePropSyncedState<T>(
  value: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setState(value);
  }

  return [state, setState];
}
