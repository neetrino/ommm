"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  resolveScheduleView,
  type ScheduleView,
} from "@/components/admin/admin-schedule-view";

/** Keeps schedule list/week mode in the URL (`?view=list|weekly`). */
export function useScheduleViewUrl(initialView: ScheduleView): [ScheduleView, (view: ScheduleView) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [view, setView] = useState<ScheduleView>(resolveScheduleView(initialView));

  const updateView = useCallback(
    (nextView: ScheduleView) => {
      setView(nextView);
      const params = new URLSearchParams(searchParams.toString());
      params.set("view", nextView);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return [view, updateView];
}
