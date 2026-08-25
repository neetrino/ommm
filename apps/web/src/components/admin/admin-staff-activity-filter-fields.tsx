"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { AdminIntegratedFilterField } from "@/components/admin/admin-integrated-search-filter-types";
import {
  STAFF_ACTIVITY_TYPE_FILTER_KEY,
  type StaffActivityTypeFilter,
} from "@/lib/staff-activity-filters";

export function useAdminStaffActivityFilterFields(): AdminIntegratedFilterField[] {
  const t = useTranslations("staffActivityPages");

  return useMemo(
    (): AdminIntegratedFilterField[] => [
      {
        key: STAFF_ACTIVITY_TYPE_FILTER_KEY,
        label: t("filterType"),
        allLabel: t("typeAll"),
        emptyValue: "",
        options: [
          {
            value: "BOOKING_CREATED" satisfies StaffActivityTypeFilter,
            label: t("typeBooked"),
          },
          {
            value: "BOOKING_CANCELLED" satisfies StaffActivityTypeFilter,
            label: t("typeCancelled"),
          },
        ],
      },
    ],
    [t],
  );
}
