export type CouponDisplayStatus =
  | "DRAFT"
  | "ACTIVE"
  | "EXPIRED"
  | "DISABLED"
  | "USAGE_LIMIT_REACHED";

export type CouponProductKind = "PACKAGE" | "DROPIN" | "GIFT" | "BAR" | "OTHER";

export type AdminCouponRow = {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  validFrom: string | null;
  validUntil: string | null;
  totalUsageLimit: number | null;
  usageLimitPerUser: number | null;
  eligibleAllUsers: boolean;
  eligibleAllProducts: boolean;
  status: "DRAFT" | "ACTIVE" | "DISABLED";
  displayStatus: CouponDisplayStatus;
  usedCount: number;
  remainingUses: number | null;
  createdBy: { id: string; email: string; name: string | null; lastName: string | null };
  eligibleUsers: { id: string; email: string; name: string | null; lastName: string | null }[];
  eligibleProducts: { kind: CouponProductKind; packagePlanId: string | null; packageName: string | null }[];
  createdAt: string;
};

export type CouponAnalyticsRow = {
  id: string;
  usedAt: string;
  redemptionStatus: "RESERVED" | "APPLIED";
  couponId: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  originalAmountCents: number;
  discountAmountCents: number;
  finalAmountCents: number;
  purchase: string | null;
  source: string;
  createdBy: { id: string; email: string; name: string | null; lastName: string | null };
  user: { id: string; email: string; name: string | null; lastName: string | null };
};
