export type UserPackageStatus =
  | "ACTIVE"
  | "PAUSED"
  | "CANCELLED"
  | "EXPIRED"
  | "PENDING";

export type UserPackagePlanSummary = {
  id: string;
  name: string;
  categoryName: string;
  priceCents: number;
  periodDays: number;
  isUnlimited: boolean;
  sessionsPerMonth: number | null;
};

export type UserMembershipRow = {
  id: string;
  status: UserPackageStatus;
  sessionsRemaining: number | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  plan: UserPackagePlanSummary;
};

export type UserPaymentRow = {
  id: string;
  amountCents: number;
  currency: string;
  status: string;
  description: string | null;
  paymentMethod: string | null;
  stripePaymentId?: string | null;
  createdAt: string;
  updatedAt?: string;
};
