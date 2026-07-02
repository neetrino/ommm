import type { PackageFilterValues } from "@/components/admin/admin-packages-types";

export const DEFAULT_PACKAGE_FILTER_VALUES: PackageFilterValues = {
  search: "",
  status: "all",
  order: "displayOrder",
};

export const PACKAGE_SEARCH_DEBOUNCE_MS = 300;
