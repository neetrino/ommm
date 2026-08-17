"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { IntegratedFilterField } from "@/components/shared/search/integrated-search-filter-types";
import {
  SESSION_REVIEW_COACH_FILTER_KEY,
  SESSION_REVIEW_PACKAGE_FILTER_KEY,
  SESSION_REVIEW_RATING_FILTER_KEY,
  SESSION_REVIEW_RATING_FILTERS,
  SESSION_REVIEW_VISIBILITY_FILTER_KEY,
  type SessionReviewFilterOption,
} from "@/lib/session-reviews-inbox-filters";

type UseSessionReviewsInboxFilterFieldsArgs = {
  showVisibilityFilter: boolean;
  showCoachFilter: boolean;
  coaches: readonly SessionReviewFilterOption[];
  packages: readonly SessionReviewFilterOption[];
};

export function useSessionReviewsInboxFilterFields({
  showVisibilityFilter,
  showCoachFilter,
  coaches,
  packages,
}: UseSessionReviewsInboxFilterFieldsArgs): IntegratedFilterField[] {
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
    if (showCoachFilter) {
      fields.push({
        key: SESSION_REVIEW_COACH_FILTER_KEY,
        label: t("filterCoach"),
        allLabel: t("filterCoachAll"),
        emptyValue: "",
        options: coaches.map((row) => ({ value: row.id, label: row.name })),
      });
    }
    fields.push({
      key: SESSION_REVIEW_PACKAGE_FILTER_KEY,
      label: t("filterPackage"),
      allLabel: t("filterPackageAll"),
      emptyValue: "",
      options: packages.map((row) => ({ value: row.id, label: row.name })),
    });
    return fields;
  }, [coaches, packages, showCoachFilter, showVisibilityFilter, t]);
}
