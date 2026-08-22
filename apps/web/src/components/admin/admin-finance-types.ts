export type FinanceSectionId = "overview" | "payments" | "coaches";

export type FinanceBoundedDateRangeDays = 7 | 30 | 90;

export type FinanceDateRangeDays = "all" | FinanceBoundedDateRangeDays;

export const DEFAULT_FINANCE_PAYMENTS_RANGE: FinanceDateRangeDays = "all";

export const DEFAULT_FINANCE_OVERVIEW_RANGE: FinanceBoundedDateRangeDays = 30;

export type FinanceSourceFilter = "all" | "package" | "dropin" | "gift" | "other";

export type FinanceStatusFilter =
  | "all"
  | "SUCCEEDED"
  | "FAILED"
  | "PENDING"
  | "REFUNDED";

export type FinancePackagePlanFilter = "all" | (string & {});

export type FinancePackageClassFilter = "all" | (string & {});

export type FinancePackageSessionsFilter = "all" | "unlimited" | (string & {});

export type FinanceFilterValues = {
  q: string;
  rangeDays: FinanceDateRangeDays;
  source: FinanceSourceFilter;
  status: FinanceStatusFilter;
  planId: FinancePackagePlanFilter;
  packageClass: FinancePackageClassFilter;
  sessions: FinancePackageSessionsFilter;
  order: "newest" | "oldest";
};

export type FinancePaymentItem = {
  id: string;
  amountCents: number;
  currency: string;
  status: string;
  description: string | null;
  relatedItemName: string | null;
  relatedItemGroupName: string | null;
  paymentMethod: string | null;
  paymentReference: string | null;
  sourceId: string | null;
  source: "package" | "dropin" | "gift" | "other";
  createdAt: string;
  confirmedAt: string | null;
  /** Short code explaining PENDING/FAILED — see payment-status-reason.ts */
  statusReason?: string | null;
  user: {
    email: string;
    name: string | null;
    lastName: string | null;
    phone?: string | null;
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
  salaryPerClassAmd: number;
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

export type CoachSessionsPayload = {
  items: CoachSessionRow[];
  total: number;
  take: number;
  offset: number;
};

export type CoachFinanceFilters = {
  search: string;
  month: string;
  payoutStatus: string;
  order: string;
  quick: string;
};

export type CoachFinancePayload = {
  items: CoachFinanceRow[];
  total: number;
  take: number;
  offset: number;
};
