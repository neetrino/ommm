import { useSyncExternalStore } from "react";

/** True after mount on the client — safe gate before `createPortal` / `document`. */
export function useIsClientMounted(): boolean {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
}
