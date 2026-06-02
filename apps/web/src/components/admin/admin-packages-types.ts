export type AdminPackageRow = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  billingPeriod: string;
  periodDays: number;
  features: string[];
  buttonLabel: string;
  isPopular: boolean;
  isActive: boolean;
  displayOrder: number;
  sessionsPerMonth: number | null;
  isUnlimited: boolean;
  classTypeId: string | null;
  createdAt: string;
};

export type PackageSortOrder =
  | "displayOrder"
  | "newest"
  | "oldest"
  | "priceHigh"
  | "priceLow";

export type PackageStatusFilter = "all" | "active" | "inactive";

export type PackageFilterValues = {
  search: string;
  status: PackageStatusFilter;
  order: PackageSortOrder;
};

export function sortAdminPackageRows(
  rows: readonly AdminPackageRow[],
): AdminPackageRow[] {
  return [...rows].sort((left, right) => left.displayOrder - right.displayOrder);
}

export function upsertAdminPackageRow(
  rows: readonly AdminPackageRow[],
  saved: AdminPackageRow,
): AdminPackageRow[] {
  const index = rows.findIndex((row) => row.id === saved.id);
  if (index === -1) {
    return sortAdminPackageRows([...rows, saved]);
  }
  const next = [...rows];
  next[index] = saved;
  return sortAdminPackageRows(next);
}
