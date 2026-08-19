import type {
  BookingChannel,
  BookingStatus,
  ManualPaymentMethod,
  PaymentSource,
  PaymentStatus,
  Role,
  WaitlistStatus,
} from '@prisma/client';

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
      'package' | 'dropin' | 'gift' | 'other',
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
    influencer: {
      costCents: number;
      count: number;
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

export type StudioAnalyticsFilters = {
  coachId?: string;
  classTypeId?: string;
};

export type StudioAnalyticsLoadMode = 'full' | 'comparison';

export type StudioAnalyticsSessionRow = {
  id: string;
  startsAt: Date;
  capacity: number;
  coachId: string;
  classTypeId: string;
  priceCents: number;
};

export type StudioAnalyticsBookingGroup = {
  sessionId: string;
  status: BookingStatus;
  channel: BookingChannel;
  count: number;
};

export type StudioAnalyticsWaitlistGroup = {
  sessionId: string;
  status: WaitlistStatus;
  count: number;
};

export type StudioAnalyticsPaymentRow = {
  amountCents: number;
  description: string | null;
  status: PaymentStatus;
  createdAt: Date;
  source: PaymentSource;
  sourceId: string | null;
  paymentMethod: ManualPaymentMethod | null;
  userId: string;
  userRole: Role;
  userLabel: string;
};

export type StudioAnalyticsPackagePlanRow = {
  userPackageId: string;
  planId: string | null;
  planName: string;
  categoryName: string;
  classTypeId: string | null;
  typeSessionAllocations: unknown;
};

export type StudioAnalyticsConsumptionRow = {
  restoredAt: Date | null;
  consumedSessions: number;
  sessionId: string;
  coachId: string;
  classTypeId: string;
  sessionPriceCents: number;
  planPriceCentsSnapshot: number;
  sessionsTotal: number | null;
  isInfluencerComp?: boolean;
};

export type StudioAnalyticsLabelRow = {
  id: string;
  label: string;
  isActive?: boolean;
};

export type StudioAnalyticsMemberCounts = {
  total: number;
  active: number;
  vip: number;
  newInRange: number;
  returningInRange: number;
  inactive30d: number;
  firstVisitsInRange: number;
  totalVisitsInRange: number;
  lifetimeValueCents: number;
  retentionCohortSize: number;
  retentionReturned: number;
  packages: StudioAnalyticsPayload['members']['packages'];
};

export type StudioAnalyticsLoadedRange = {
  from: Date;
  to: Date;
  sessions: StudioAnalyticsSessionRow[];
  bookingGroups: StudioAnalyticsBookingGroup[];
  waitlistGroups: StudioAnalyticsWaitlistGroup[];
  payments: StudioAnalyticsPaymentRow[];
  packagePlans: StudioAnalyticsPackagePlanRow[];
  consumptions: StudioAnalyticsConsumptionRow[];
  coaches: StudioAnalyticsLabelRow[];
  classTypes: StudioAnalyticsLabelRow[];
  filters: StudioAnalyticsFilters;
  members: StudioAnalyticsMemberCounts;
  giftCredits: StudioAnalyticsPayload['revenue']['giftCredits'];
};
