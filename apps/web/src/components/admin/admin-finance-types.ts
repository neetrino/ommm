import type { ClientRow, PackageOption } from "./admin-clients-types";

export type FinanceTab = "user" | "coach";

export type FinancePaymentItem = {
  id: string;
  amountCents: number;
  currency: string;
  status: string;
  description: string | null;
  source: "membership" | "dropin" | "gift" | "other";
  createdAt: string;
  user: {
    email: string;
    name: string | null;
    lastName: string | null;
  };
};

export type FinancePaymentsPayload = {
  items: FinancePaymentItem[];
  total: number;
  take: number;
  offset: number;
};

export type CoachSalarySummary = {
  coachProfileId: string;
  completedSessions: number;
  totalEarningsCents: number;
  basePerSessionCents: number;
  perAttendeeShareCents: number;
  pendingPayoutCents: number;
  paidOutCents: number;
};

export type CoachFinanceRow = {
  coachProfileId: string;
  userId: string;
  isActive: boolean;
  user: {
    id: string;
    name: string | null;
    lastName: string | null;
    phone: string | null;
    email: string;
  };
  salary: CoachSalarySummary | null;
  totalClasses: number;
};

export type CoachSessionRow = {
  id: string;
  startsAt: string;
  endsAt: string;
  classType: { id: string; name: string };
  status: string;
  _count?: { bookings: number };
};

export type UserFinanceFilters = {
  search: string;
  paymentStatus: string;
  packageType: string;
  expirationFrom: string;
  expirationTo: string;
  giftCardOnly: boolean;
  order: string;
  quick: string;
};

export type CoachFinanceFilters = {
  search: string;
  month: string;
  payoutStatus: string;
  order: string;
  quick: string;
};

export type AdminFinanceManagementProps = {
  locale: string;
  initialTab: FinanceTab;
  initialUserRows: ClientRow[];
  initialCoachRows: CoachFinanceRow[];
  initialPayments: FinancePaymentsPayload;
  packages: PackageOption[];
  paymentsFrom: string;
};
