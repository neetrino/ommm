export type AnalyticsRangeDays = 7 | 30 | 90;

export type AnalyticsSortKey =
  | "revenue-desc"
  | "revenue-asc"
  | "bookings-desc"
  | "bookings-asc"
  | "attendance-desc"
  | "attendance-asc"
  | "name-asc";

export type AnalyticsQuickFilterOption =
  | "today"
  | "week"
  | "month"
  | "last30"
  | "topCoaches"
  | "popularClasses";

/** @deprecated Legacy single-value filter; prefer `AnalyticsQuickFilterOption[]`. */
export type AnalyticsQuickFilter = AnalyticsQuickFilterOption | "none";

export type AnalyticsBookingStatusFilter =
  | ""
  | "BOOKED"
  | "COMPLETED"
  | "CANCELLED"
  | "MISSED";

export type AnalyticsFilterValues = {
  rangeDays: AnalyticsRangeDays;
  coachId: string;
  classTypeId: string;
  bookingStatus: AnalyticsBookingStatusFilter;
  sort: AnalyticsSortKey;
  /** Comma-separated quick filter keys; empty means all selected. */
  quick: string;
};

export type AnalyticsBarItem = {
  key: string;
  label: string;
  value: number;
  displayValue?: string;
};

export type AnalyticsMetricComparison = {
  current: number;
  previous: number;
  /** null when previous is 0 */
  trendPercent: number | null;
};

export type StudioAnalyticsPayload = {
  range: {
    from: string;
    to: string;
    previousFrom: string;
    previousTo: string;
  };
  comparison: {
    revenueCents: AnalyticsMetricComparison;
    bookings: AnalyticsMetricComparison;
    attendanceRate: AnalyticsMetricComparison;
    occupancyRate: AnalyticsMetricComparison;
    newMembers: AnalyticsMetricComparison;
  };
  kpis: {
    revenueCents: number;
    successfulPaymentsCount: number;
    averageOrderValueCents: number;
    bookingsTotal: number;
    attendanceRate: number | null;
    occupancyRate: number | null;
    cancellationRate: number | null;
    noShowRate: number | null;
    activeMembers: number;
    newMembers: number;
    waitlistActive: number;
    waitlistConversionRate: number | null;
  };
  daily: Array<{
    dateKey: string;
    bookings: number;
    completed: number;
    cancelled: number;
    missed: number;
    revenueCents: number;
    occupiedSeats: number;
    capacity: number;
    occupancyRate: number | null;
  }>;
  revenue: {
    bySource: Record<
      "package" | "dropin" | "gift" | "other",
      { count: number; amountCents: number }
    >;
    byStatus: Array<{ status: string; count: number; amountCents: number }>;
    byPaymentMethod: Array<{
      method: string;
      count: number;
      amountCents: number;
    }>;
    byClassType: Array<{
      id: string;
      label: string;
      amountCents: number;
      bookings: number;
    }>;
    byCoach: Array<{
      id: string;
      label: string;
      amountCents: number;
      bookings: number;
      sessions: number;
    }>;
    byPackage: Array<{
      id: string;
      label: string;
      count: number;
      amountCents: number;
    }>;
    topClients: Array<{
      id: string;
      label: string;
      amountCents: number;
      paymentsCount: number;
    }>;
    giftCredits: {
      issuedCents: number;
      issuedCount: number;
      redeemedCents: number;
      redeemedCount: number;
      spentCents: number;
      spendTransactionsCount: number;
      outstandingCreditsCents: number;
    };
  };
  operations: {
    bookingsByStatus: {
      BOOKED: number;
      COMPLETED: number;
      CANCELLED: number;
      MISSED: number;
      waitlisted: number;
    };
    classPopularity: Array<{
      id: string;
      label: string;
      bookings: number;
      occupancyRate: number | null;
    }>;
    peakWeekdays: Array<{ weekday: number; bookings: number }>;
    peakHours: Array<{ hour: number; bookings: number }>;
    channels: { WEBSITE: number; APP: number };
    waitlist: {
      active: number;
      offered: number;
      converted: number;
      expired: number;
      removed: number;
      conversionRate: number | null;
    };
  };
  members: {
    total: number;
    active: number;
    vip: number;
    newInRange: number;
    returningInRange: number;
    inactive30d: number;
    retentionRate: number | null;
    firstVisitsInRange: number;
    totalVisitsInRange: number;
    lifetimeValueCents: number;
    packages: {
      active: number;
      paused: number;
      expiring7d: number;
      expiredInRange: number;
    };
  };
  coaches: {
    rows: Array<{
      id: string;
      name: string;
      isActive: boolean;
      sessions: number;
      bookings: number;
      completed: number;
      missed: number;
      occupancyRate: number | null;
      attendanceRate: number | null;
      revenueCents: number;
      waitlistActive: number;
    }>;
  };
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
    "package" | "dropin" | "gift" | "other",
    { count: number; amountCents: number }
  >;
  dailyRevenue?: Array<{ date: string; amountCents: number }>;
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
  /** True when the date range has more bookings than {@link sampledLimit}. */
  isSampled: boolean;
  /** Total bookings in range before the sample cap (from API pagination.total). */
  matchedTotal: number;
  /** Booking rows included in the sample (excludes waitlist rows). */
  sampledRowCount: number;
};

export type AnalyticsClientsSummary = {
  total: number;
  active: number;
  vip: number;
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

export type AnalyticsDailyBucket = {
  dateKey: string;
  label: string;
  total: number;
  completed: number;
  revenueCents: number;
  occupancyRate: number | null;
  cancelled?: number;
  missed?: number;
};

export type AdminAnalyticsPayload = {
  locale: string;
  rangeDays: AnalyticsRangeDays;
  fromIso: string;
  toIso: string;
  sortKey: AnalyticsSortKey;
  coachId: string;
  classTypeId: string;
  bookingStatus: AnalyticsBookingStatusFilter;
  quickFilters: AnalyticsQuickFilterOption[];
  studio: StudioAnalyticsPayload;
  dashboard: AnalyticsDashboardOverview;
  finance: AnalyticsFinanceSummary;
  bookings: AnalyticsBookingsPayload;
  clients: AnalyticsClientsSummary;
  coaches: AnalyticsCoachRow[];
  dailyTrend: AnalyticsDailyBucket[];
};
