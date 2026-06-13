import type { PackageStatus } from "@prisma/client";

export type PackageDeletionBlockerRow = {
  id: string;
  status: PackageStatus;
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
  memberships: PackageDeletionBlockerRow[];
};
