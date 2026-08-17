"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { IntegratedFilterField } from "@/components/shared/search/integrated-search-filter-types";
import {
  SESSION_REVIEW_RATING_FILTER_KEY,
  SESSION_REVIEW_RATING_FILTERS,
  SESSION_REVIEW_VISIBILITY_FILTER_KEY,
} from "@/lib/session-reviews-inbox-filters";

export function useSessionReviewsInboxFilterFields(
  showVisibilityFilter: boolean,
): IntegratedFilterField[] {
  const t = useTranslations("sessionReviewsPages");

  return useMemo(() => {
    const fields: IntegratedFilterField[] = [
      {
        key: SESSION_REVIEW_RATING_FILTER_KEY,
        label: t("filterRating"),
        allLabel: t("filterRatingAll"),
        emptyValue: "",
        options: SESSION_REVIEW_RATING_FILTERS.map((value) => ({
          value,
          label: t("ratingLabel", { rating: value }),
        })),
      },
    ];
    if (showVisibilityFilter) {
      fields.push({
        key: SESSION_REVIEW_VISIBILITY_FILTER_KEY,
        label: t("filterVisibility"),
        allLabel: t("filterVisibilityAll"),
        emptyValue: "",
        options: [
          { value: "named", label: t("filterVisibilityNamed") },
          { value: "anonymous", label: t("filterVisibilityAnonymous") },
        ],
      });
    }
    return fields;
  }, [showVisibilityFilter, t]);
}
