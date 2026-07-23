export type CoachAnalyticsPeriod = "month" | "year";

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
  trend: Array<{
    date: string;
    sessions: number;
    bookings: number;
    waitlists: number;
    capacity: number;
    attendance: number;
    fillRate: number;
  }>;
  classTypeBreakdown: Array<{
    classTypeId: string;
    name: string;
    sessions: number;
    bookings: number;
    attendance: number;
  }>;
  hourlyAttendance: Array<{ hour: number; attendance: number }>;
};

export const COACH_ANALYTICS_PERIOD_DAYS: Record<CoachAnalyticsPeriod, number> = {
  month: 30,
  year: 365,
};

export function parseCoachAnalyticsPeriod(value?: string): CoachAnalyticsPeriod {
  return value === "year" ? "year" : "month";
}

export function coachAnalyticsDaysForPeriod(period: CoachAnalyticsPeriod): number {
  return COACH_ANALYTICS_PERIOD_DAYS[period];
}
