import type { UserPackageFreezeState } from "@/lib/user-package-freeze";

export type { UserPackageFreezeState };

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
  totalSessions: number | null;
  usedSessions: number | null;
  remainingSessions: number | null;
  isUnlimited: boolean;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  awaitingFirstVisit?: boolean;
  activationDeadline?: string | null;
  freeze?: UserPackageFreezeState;
  plan: UserPackagePlanSummary;
};

export type UserPaymentRow = {
  id: string;
  amountCents: number;
  currency: string;
  status: string;
  description: string | null;
  paymentMethod: string | null;
  paymentReference?: string | null;
  createdAt: string;
  updatedAt?: string;
  /** Short code explaining PENDING/FAILED — see payment-status-reason.ts */
  statusReason?: string | null;
  metadata?: unknown;
};

export type UserPaymentsPayload = {
  items: UserPaymentRow[];
  total: number;
  take: number;
  offset: number;
};
