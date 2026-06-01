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
