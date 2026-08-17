"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { SessionReviewFilterOptionsPayload } from "@/lib/session-reviews-inbox-filters";

const EMPTY_OPTIONS: SessionReviewFilterOptionsPayload = {
  coaches: [],
  packages: [],
};

export function useSessionReviewsFilterOptions() {
  const [options, setOptions] = useState<SessionReviewFilterOptionsPayload>(EMPTY_OPTIONS);

  useEffect(() => {
    let cancelled = false;
    void apiFetch<SessionReviewFilterOptionsPayload>("/session-reviews/filter-options")
      .then((data) => {
        if (!cancelled) {
          setOptions({
            coaches: data.coaches ?? [],
            packages: data.packages ?? [],
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOptions(EMPTY_OPTIONS);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return options;
}
