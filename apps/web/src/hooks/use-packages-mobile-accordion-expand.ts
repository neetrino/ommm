"use client";

import { startTransition, useCallback, useState } from "react";

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
  const [overrideExpandedId, setOverrideExpandedId] = useState<
    string | null | undefined
  >(undefined);
  const [prevUrlExpandedId, setPrevUrlExpandedId] = useState(urlExpandedId);

  if (urlExpandedId !== prevUrlExpandedId) {
    setPrevUrlExpandedId(urlExpandedId);
    setOverrideExpandedId(undefined);
  }

  const expandedId =
    overrideExpandedId !== undefined &&
    overrideExpandedId !== urlExpandedId
      ? overrideExpandedId
      : urlExpandedId;

  const openCategory = useCallback(
    (categoryId: string) => {
      setOverrideExpandedId(categoryId);
      requestAnimationFrame(() => {
        startTransition(() => onUrlExpand(categoryId));
      });
    },
    [onUrlExpand],
  );

  const closeCategory = useCallback(() => {
    setOverrideExpandedId(null);
    requestAnimationFrame(() => {
      startTransition(() => onUrlExpand(null));
    });
  }, [onUrlExpand]);

  return {
    expandedId,
    openCategory,
    closeCategory,
  };
}
