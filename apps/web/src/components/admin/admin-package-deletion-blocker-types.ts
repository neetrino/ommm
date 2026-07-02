type LegacyPackageStatus = "ACTIVE" | "PAUSED" | "CANCELLED" | "EXPIRED" | "PENDING";

export type PackageDeletionBlockerRow = {
  id: string;
  status: LegacyPackageStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  user: {
    id: string;
    name: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
  };
};

export type PackageDeletionBlockersResponse = {
  count: number;
  allowsDeletion?: boolean;
  memberships: PackageDeletionBlockerRow[];
};
