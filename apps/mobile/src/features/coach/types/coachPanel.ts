export type CoachSessionStatus = "ACTIVE" | "CANCELLED" | "FULL" | "DRAFT";

export type CoachPanelSessionRow = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  level: string | null;
  classFormat: string | null;
  status: CoachSessionStatus;
  classType: { id: string; name: string };
  _count: { bookings: number };
};

export type CoachPanelBookingRow = {
  id: string;
  status: string;
  user: { name: string | null; email: string };
  session: {
    id: string;
    startsAt: string;
    endsAt: string;
    coachId: string;
    classType: { name: string };
  };
};

export type CoachSalarySummary = {
  coachProfileId: string;
  completedSessions: number;
  totalEarningsCents: number;
  pendingPayoutCents: number;
  paidOutCents: number;
};

export type CoachNotificationPrefs = {
  bookingReminders: boolean;
  waitlistAlerts: boolean;
  promotions: boolean;
  communityUpdates: boolean;
};

export type CoachAccountUser = {
  email: string;
  name: string | null;
  lastName: string | null;
  phone: string | null;
  locale: string | null;
  role: string;
  homeImageUrl: string | null;
  dateOfBirth: string | null;
};

export type CoachAccountMe = {
  user: CoachAccountUser;
  coachProfileId: string | null;
  coachBio: string | null;
  notificationPrefs: CoachNotificationPrefs;
};

export type CoachAnalyticsPeakTime = {
  hour: number;
  attendance: number;
};

export type CoachAnalyticsPayload = {
  range: { from: string; to: string };
  periodDays: number;
  totals: {
    totalClassesTaught: number;
    totalClientsTrained: number;
    averageAttendanceRate: number | null;
    classFillRate: number;
    mostPopularClassType: string | null;
    peakTime: CoachAnalyticsPeakTime | null;
    sessions: number;
    bookings: number;
    completed: number;
    missed: number;
    activeWaitlists: number;
    utilizationPercent: number;
    waitlistPressurePercent: number;
  };
  trend: {
    date: string;
    sessions: number;
    bookings: number;
    waitlists: number;
    capacity: number;
    attendance: number;
    fillRate: number;
  }[];
  classTypeBreakdown: {
    classTypeId: string;
    name: string;
    sessions: number;
    bookings: number;
    attendance: number;
  }[];
  hourlyAttendance: { hour: number; attendance: number }[];
};

export type SessionSortOrder = "upcoming" | "date-asc" | "date-desc";

export type CoachScheduleStatusFilter = "all" | CoachSessionStatus;

export type CoachScheduleFilterValues = {
  search: string;
  from: string;
  to: string;
  classType: string;
  status: CoachScheduleStatusFilter;
  order: SessionSortOrder;
};

export type CoachRosterFilterValues = {
  search: string;
  from: string;
  to: string;
  classType: string;
  order: SessionSortOrder;
};
