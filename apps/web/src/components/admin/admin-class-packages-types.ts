export type AdminClassTypeRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminClassPackageCoachRow = {
  id: string;
  classType: string | null;
  assignedClassTypeIds: string[];
  isActive: boolean;
  user: {
    name: string | null;
    lastName: string | null;
    email: string;
  };
};

export type AdminClassPackageSessionRow = {
  id: string;
  classTypeId: string;
  capacity: number;
  level: string | null;
  priceCents: number;
  _count: { bookings: number };
};

export type ClassPackageSessionStats = {
  sessionCount: number;
  levels: string[];
  maxCapacity: number | null;
  minCapacity: number | null;
  maxPriceCents: number | null;
  minPriceCents: number | null;
  totalBookings: number;
};

export type EnrichedClassPackage = AdminClassTypeRow & {
  sessionStats: ClassPackageSessionStats;
  assignedCoaches: AdminClassPackageCoachRow[];
};

export type ClassPackageSortOrder =
  | "newest"
  | "oldest"
  | "capacityHigh"
  | "capacityLow"
  | "priceHigh"
  | "priceLow";

export type ClassPackageQuickFilter =
  | ""
  | "popular"
  | "highCapacity"
  | "lowCapacity"
  | "beginner"
  | "advanced"
  | "withCoaches";
