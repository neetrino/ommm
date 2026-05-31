export type AnalyticsRangeDays = 7 | 30 | 90;

export type AnalyticsViewMode = "table" | "chart";

export type AnalyticsSortKey =
  | "revenue-desc"
  | "revenue-asc"
  | "bookings-desc"
  | "bookings-asc"
  | "attendance-desc"
  | "attendance-asc"
  | "name-asc";

export type AnalyticsQuickFilter =
  | "none"
  | "today"
  | "week"
  | "month"
  | "last30"
  | "topCoaches"
  | "popularClasses";

export type AnalyticsBookingStatusFilter =
  | ""
  | "BOOKED"
  | "COMPLETED"
  | "CANCELLED"
  | "MISSED";

export type AnalyticsBarItem = {
  key: string;
  label: string;
  value: number;
  displayValue?: string;
};

export type AnalyticsDashboardOverview = {
  sessionsToday: number;
  bookingsToday: number;
  activeWaitlists: number;
  activeMembers: number;
  revenueCentsTotal?: number;
  bookingsByStatus?: Record<"BOOKED" | "COMPLETED" | "CANCELLED" | "MISSED", number>;
  revenue?: {
    todayRevenueCents: number;
    monthRevenueCents: number;
    pendingPaymentsCount: number;
    trendPercent: number | null;
  };
  newUsers?: {
    todayCount: number;
    recent: Array<{ id: string; name: string; email: string; createdAt: string }>;
  };
};

export type AnalyticsFinanceSummary = {
  totals: {
    revenueCents: number;
    successfulPaymentsCount: number;
    averageOrderValueCents: number;
  };
  byStatus: Array<{ status: string; count: number; amountCents: number }>;
  bySource: Record<
    "membership" | "dropin" | "gift" | "other",
    { count: number; amountCents: number }
  >;
  giftCredits?: {
    issuedCents: number;
    issuedCount: number;
    redeemedCents: number;
    redeemedCount: number;
    spentCents: number;
    spendTransactionsCount: number;
    outstandingCreditsCents: number;
  };
};

export type AnalyticsBookingsPayload = {
  summary: {
    total: number;
    booked: number;
    completed: number;
    cancelled: number;
    waitlisted: number;
    missed: number;
  };
  classPopularity: AnalyticsBarItem[];
  coachBookings: AnalyticsBarItem[];
  coachAttendance: AnalyticsBarItem[];
  filterOptions: {
    classTypes: Array<{ id: string; name: string }>;
    coaches: Array<{ id: string; name: string }>;
  };
  sampledLimit: number;
};

export type AnalyticsClientsSummary = {
  total: number;
  active: number;
  vip: number;
  atRisk: number;
  totalVisits: number;
  lifetimeValueCents: number;
};

export type AnalyticsCoachRow = {
  id: string;
  userId: string;
  isActive: boolean;
  totalClasses: number;
  user: {
    name: string | null;
    lastName: string | null;
    email: string;
  };
};

export type AnalyticsMembershipRow = {
  id: string;
  status: string;
  plan: { id: string; name: string };
};

export type AdminAnalyticsPayload = {
  locale: string;
  rangeDays: AnalyticsRangeDays;
  fromIso: string;
  toIso: string;
  viewMode: AnalyticsViewMode;
  sortKey: AnalyticsSortKey;
  coachId: string;
  classTypeId: string;
  bookingStatus: AnalyticsBookingStatusFilter;
  quickFilter: AnalyticsQuickFilter;
  dashboard: AnalyticsDashboardOverview;
  finance: AnalyticsFinanceSummary;
  bookings: AnalyticsBookingsPayload;
  clients: AnalyticsClientsSummary;
  coaches: AnalyticsCoachRow[];
  memberships: AnalyticsMembershipRow[];
  membershipsSampledLimit: number;
};
