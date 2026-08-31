"use client";

import { useCallback, useState } from "react";

type UseAdminAnimatedSheetCloseOptions = {
  /** When this key becomes truthy, the sheet returns to the open state (for always-mounted shells). */
  openKey?: string | number | boolean | null;
};

/**
 * Keeps an admin sheet mounted while the mobile exit animation plays.
 * Wire `requestClose` to UI; parent `onDismiss` runs only in `onAfterClose`.
 */
export function useAdminAnimatedSheetClose(
  onDismiss: () => void,
  options?: UseAdminAnimatedSheetCloseOptions,
) {
  const [isOpen, setIsOpen] = useState(true);
  const openKey = options?.openKey;
  const [prevOpenKey, setPrevOpenKey] = useState(openKey);

  if (openKey !== prevOpenKey) {
    setPrevOpenKey(openKey);
    if (openKey) {
      setIsOpen(true);
    }
  }

  const requestClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const onAfterClose = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  return { isOpen, requestClose, onAfterClose };
}
