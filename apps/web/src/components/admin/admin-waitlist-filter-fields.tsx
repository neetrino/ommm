"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  WAITLIST_CLASS_TYPE_KEY,
  WAITLIST_ORDER_KEY,
} from "@/components/admin/admin-waitlist-management.constants";
import type { AdminWaitlistRow } from "@/components/admin/admin-waitlist-query";
import type { AdminIntegratedFilterField } from "@/components/admin/admin-integrated-search-filter-types";
import { OmmFilterDropdown } from "@/components/ui/omm-select-dropdown";

type AdminWaitlistFilterFieldsProps = {
  items: readonly AdminWaitlistRow[];
};

export function useAdminWaitlistFilterFields({ items }: AdminWaitlistFilterFieldsProps) {
  const t = useTranslations("adminPages.waitlists");
  const tSort = useTranslations("listSort");

  const classTypeOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of items) {
      map.set(row.session.classType.id, row.session.classType.name);
    }
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [items]);

  return useMemo((): AdminIntegratedFilterField[] => {
    return [
      {
        key: WAITLIST_CLASS_TYPE_KEY,
        label: t("colClassType"),
        render: ({ value, onChange }) => (
          <OmmFilterDropdown
            allValue=""
            value={value}
            ariaLabel={t("colClassType")}
            allLabel={t("filterClassAll")}
            onChange={onChange}
            options={classTypeOptions}
          />
        ),
      },
      {
        key: WAITLIST_ORDER_KEY,
        label: tSort("sort"),
        emptyValue: "newest",
        options: [
          { value: "newest", label: tSort("newest") },
          { value: "oldest", label: tSort("oldest") },
          { value: "upcoming", label: tSort("upcoming") },
          { value: "date-asc", label: tSort("dateAsc") },
          { value: "date-desc", label: tSort("dateDesc") },
        ],
      },
    ];
  }, [classTypeOptions, t, tSort]);
}
