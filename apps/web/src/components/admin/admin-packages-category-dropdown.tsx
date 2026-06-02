"use client";

import { useTranslations } from "next-intl";
import {
  AdminPackagesCategoryMultiSelect,
  type AdminPackagesCategoryOption,
} from "@/components/admin/admin-packages-category-multi-select";

type AdminPackagesCategoryDropdownProps = {
  options: readonly AdminPackagesCategoryOption[];
  selectedIds: ReadonlySet<string>;
  onChange: (selectedIds: ReadonlySet<string>) => void;
};

/** Multi-select category filter for the admin packages toolbar. */
export function AdminPackagesCategoryDropdown({
  options,
  selectedIds,
  onChange,
}: AdminPackagesCategoryDropdownProps) {
  const t = useTranslations("adminPages.packages");

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="ommm-label text-xs uppercase tracking-wide">
        {t("filters.categoriesLabel")}
      </span>
      <AdminPackagesCategoryMultiSelect
        options={options}
        selectedIds={selectedIds}
        onChange={onChange}
      />
    </div>
  );
}
