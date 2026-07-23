import { useCallback, useEffect, useRef } from "react";

/** Returns a stable callback that debounces rapid invocations. */
export function useDebouncedCallback(callback: () => void, delayMs: number): () => void {
  const callbackRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(
    () => () => {
      clearTimeout(timerRef.current);
    },
    [],
  );

  return useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      callbackRef.current();
    }, delayMs);
  }, [delayMs]);
}
