"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { AdminIntegratedFilterField } from "@/components/admin/admin-integrated-search-filter-types";
import type { CallTaskListFilter } from "@/components/admin/admin-call-tasks-query";

export const CALL_TASK_STATUS_FILTER_KEY = "status";

export function useAdminCallTasksFilterFields(): AdminIntegratedFilterField[] {
  const t = useTranslations("adminPages.calls");

  return useMemo(
    (): AdminIntegratedFilterField[] => [
      {
        key: CALL_TASK_STATUS_FILTER_KEY,
        label: t("colStatus"),
        allLabel: t("statusAll"),
        emptyValue: "",
        options: [
          { value: "PENDING" satisfies CallTaskListFilter, label: t("status.PENDING") },
          { value: "OVERDUE" satisfies CallTaskListFilter, label: t("status.OVERDUE") },
          { value: "DONE" satisfies CallTaskListFilter, label: t("status.DONE") },
          { value: "CANCELLED" satisfies CallTaskListFilter, label: t("status.CANCELLED") },
        ],
      },
    ],
    [t],
  );
}
