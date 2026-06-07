"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";

/**
 * Binds a single view query param to the URL (e.g. `?view=list`).
 * Supports browser back/forward without local component state drift.
 */
export function useUrlViewState<T extends string>(
  queryKey: string,
  parse: (value: string | null) => T,
): [T, (next: T) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const view = useMemo(
    () => parse(searchParams.get(queryKey)),
    [parse, queryKey, searchParams],
  );

  const setView = useCallback(
    (next: T) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(queryKey, next);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, queryKey, router, searchParams],
  );

  return [view, setView];
}
