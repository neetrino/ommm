import type { CoachAnalyticsPayload } from "@/components/coach/coach-analytics-types";

const STRONG_FILL_RATE = 70;
const WEAK_FILL_RATE = 40;
const STRONG_ATTENDANCE_RATE = 80;
const WEAK_ATTENDANCE_RATE = 60;
const HIGH_WAITLIST_PRESSURE = 15;

export type CoachAnalyticsInsightKind = "strength" | "improvement";

export type CoachAnalyticsInsight = {
  key: string;
  kind: CoachAnalyticsInsightKind;
};

export function buildCoachAnalyticsInsights(
  data: CoachAnalyticsPayload,
): CoachAnalyticsInsight[] {
  const insights: CoachAnalyticsInsight[] = [];
  const { totals } = data;

  if (totals.classFillRate >= STRONG_FILL_RATE) {
    insights.push({ key: "strongFillRate", kind: "strength" });
  } else if (totals.classFillRate <= WEAK_FILL_RATE && totals.sessions > 0) {
    insights.push({ key: "weakFillRate", kind: "improvement" });
  }

  if (totals.averageAttendanceRate !== null) {
    if (totals.averageAttendanceRate >= STRONG_ATTENDANCE_RATE) {
      insights.push({ key: "strongAttendance", kind: "strength" });
    } else if (totals.averageAttendanceRate <= WEAK_ATTENDANCE_RATE) {
      insights.push({ key: "weakAttendance", kind: "improvement" });
    }
  }

  if (totals.waitlistPressurePercent >= HIGH_WAITLIST_PRESSURE) {
    insights.push({ key: "highDemand", kind: "strength" });
  }

  if (totals.mostPopularClassType) {
    insights.push({ key: "popularClassType", kind: "strength" });
  }

  if (totals.peakTime) {
    insights.push({ key: "peakTimeInsight", kind: "strength" });
  }

  if (insights.length === 0 && totals.sessions > 0) {
    insights.push({ key: "steadyBaseline", kind: "strength" });
  }

  return insights.slice(0, 4);
}

export function mapCoachTrendForChart(
  trend: CoachAnalyticsPayload["trend"],
  locale: string,
  periodDays: number,
) {
  const useCompactLabels = periodDays > 31;
  const axisLabelFormatter = new Intl.DateTimeFormat(locale, {
    month: "short",
    ...(useCompactLabels ? {} : { day: "numeric" }),
  });
  const tooltipLabelFormatter = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: periodDays > 31 ? "numeric" : undefined,
  });

  return trend.map((point) => {
    const date = new Date(`${point.date}T12:00:00`);
    return {
      label: axisLabelFormatter.format(date),
      tooltipLabel: tooltipLabelFormatter.format(date),
      attendance: point.attendance,
      fillRate: point.fillRate,
      sessions: point.sessions,
    };
  });
}

export function mapClassTypeBarItems(
  breakdown: CoachAnalyticsPayload["classTypeBreakdown"],
) {
  return breakdown.slice(0, 6).map((item) => ({
    key: item.classTypeId,
    label: item.name,
    value: item.attendance,
    displayValue: String(item.attendance),
  }));
}

export function mapHourlyBarItems(
  hourly: CoachAnalyticsPayload["hourlyAttendance"],
  locale: string,
) {
  const hourFormatter = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    hour12: false,
  });

  return hourly
    .filter((bucket) => bucket.attendance > 0)
    .map((bucket) => {
      const sample = new Date();
      sample.setHours(bucket.hour, 0, 0, 0);
      return {
        key: String(bucket.hour),
        label: hourFormatter.format(sample),
        value: bucket.attendance,
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

export function formatPeakTimeLabel(hour: number, locale: string): string {
  const sample = new Date();
  sample.setHours(hour, 0, 0, 0);
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
  }).format(sample);
}
