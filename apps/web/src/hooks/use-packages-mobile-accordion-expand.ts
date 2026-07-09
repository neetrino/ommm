"use client";

import { startTransition, useCallback, useEffect, useState } from "react";

type UsePackagesMobileAccordionExpandArgs = {
  urlExpandedId: string | null;
  onUrlExpand: (categoryId: string | null) => void;
};

/** Optimistic expand state so mobile accordion updates before URL sync completes. */
export function usePackagesMobileAccordionExpand({
  urlExpandedId,
  onUrlExpand,
}: UsePackagesMobileAccordionExpandArgs): {
  expandedId: string | null;
  openCategory: (categoryId: string) => void;
  closeCategory: () => void;
} {
  const [localExpandedId, setLocalExpandedId] = useState<string | null>(urlExpandedId);

  useEffect(() => {
    setLocalExpandedId(urlExpandedId);
  }, [urlExpandedId]);

  const openCategory = useCallback(
    (categoryId: string) => {
      setLocalExpandedId(categoryId);
      requestAnimationFrame(() => {
        startTransition(() => onUrlExpand(categoryId));
      });
    },
    [onUrlExpand],
  );

  const closeCategory = useCallback(() => {
    setLocalExpandedId(null);
    requestAnimationFrame(() => {
      startTransition(() => onUrlExpand(null));
    });
  }, [onUrlExpand]);

  return {
    expandedId: localExpandedId,
    openCategory,
    closeCategory,
  };
}
