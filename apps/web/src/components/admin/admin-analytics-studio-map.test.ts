import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildPackageSalesBarItems,
  buildTopClientRankRows,
  pickTopNamedAmount,
} from "./admin-analytics-finance-map";
import {
  buildDailyTrendFromStudio,
  buildPeakHourColumnData,
  buildPeakWeekdayColumnData,
  buildRevenueSourceBarItems,
  formatRatePercent,
  formatTrendDelta,
} from "./admin-analytics-studio-map";
import type { StudioAnalyticsPayload } from "./admin-analytics-types";

function createStudioFixture(): StudioAnalyticsPayload {
  return {
    range: {
      from: "2026-01-01T00:00:00.000Z",
      to: "2026-01-31T23:59:59.999Z",
      previousFrom: "2025-12-02T00:00:00.000Z",
      previousTo: "2025-12-31T23:59:59.999Z",
    },
    comparison: {
      revenueCents: { current: 1000, previous: 800, trendPercent: 25 },
      bookings: { current: 10, previous: 8, trendPercent: 25 },
      attendanceRate: { current: 80, previous: 75, trendPercent: 7 },
      occupancyRate: { current: 60, previous: 50, trendPercent: 20 },
      newMembers: { current: 3, previous: 0, trendPercent: null },
    },
    kpis: {
      revenueCents: 1000,
      successfulPaymentsCount: 4,
      averageOrderValueCents: 250,
      bookingsTotal: 10,
      attendanceRate: 80,
      occupancyRate: 60,
      cancellationRate: 5,
      noShowRate: 10,
      activeMembers: 20,
      newMembers: 3,
      waitlistActive: 2,
      waitlistConversionRate: 50,
    },
    daily: [
      {
        dateKey: "2026-01-01",
        bookings: 2,
        completed: 1,
        cancelled: 0,
        missed: 1,
        revenueCents: 500,
        occupiedSeats: 4,
        capacity: 8,
        occupancyRate: 50,
      },
    ],
    revenue: {
      bySource: {
        package: { count: 1, amountCents: 600 },
        dropin: { count: 2, amountCents: 300 },
        gift: { count: 0, amountCents: 0 },
        other: { count: 1, amountCents: 100 },
      },
      byStatus: [{ status: "SUCCEEDED", count: 4, amountCents: 1000 }],
      byPaymentMethod: [{ method: "CASH", count: 2, amountCents: 400 }],
      byClassType: [{ id: "c1", label: "Yoga", amountCents: 700, bookings: 5 }],
      byCoach: [{ id: "coach1", label: "Ani", amountCents: 700, bookings: 5, sessions: 3 }],
      byPackage: [{ id: "p1", label: "Yoga 8", count: 2, amountCents: 600 }],
      topClients: [{ id: "u1", label: "Ada", amountCents: 400, paymentsCount: 2 }],
      giftCredits: {
        issuedCents: 1000,
        issuedCount: 1,
        redeemedCents: 500,
        redeemedCount: 1,
        spentCents: 200,
        spendTransactionsCount: 1,
        outstandingCreditsCents: 300,
      },
      influencer: { costCents: 0, count: 0 },
    },
    operations: {
      bookingsByStatus: {
        BOOKED: 2,
        COMPLETED: 5,
        CANCELLED: 1,
        MISSED: 2,
        waitlisted: 1,
      },
      classPopularity: [{ id: "c1", label: "Yoga", bookings: 5, occupancyRate: 70 }],
      peakWeekdays: [
        { weekday: 0, bookings: 1 },
        { weekday: 1, bookings: 4 },
      ],
      peakHours: [
        { hour: 9, bookings: 3 },
        { hour: 18, bookings: 5 },
      ],
      channels: { WEBSITE: 6, APP: 4 },
      waitlist: {
        active: 2,
        offered: 1,
        converted: 1,
        expired: 0,
        removed: 0,
        conversionRate: 50,
      },
    },
    members: {
      total: 30,
      active: 20,
      vip: 0,
      newInRange: 3,
      returningInRange: 7,
      inactive30d: 5,
      retentionRate: 65,
      firstVisitsInRange: 4,
      totalVisitsInRange: 40,
      lifetimeValueCents: 50000,
      packages: {
        active: 12,
        paused: 1,
        expiring7d: 2,
        expiredInRange: 1,
      },
    },
    coaches: {
      rows: [
        {
          id: "coach1",
          name: "Ani Coach",
          isActive: true,
          sessions: 3,
          bookings: 5,
          completed: 4,
          missed: 1,
          occupancyRate: 70,
          attendanceRate: 80,
          revenueCents: 700,
          waitlistActive: 1,
        },
      ],
    },
  };
}

describe("formatTrendDelta", () => {
  it("formats positive, negative, zero, and null trends", () => {
    assert.equal(formatTrendDelta(12.4), "+12%");
    assert.equal(formatTrendDelta(-4.6), "-5%");
    assert.equal(formatTrendDelta(0), "0%");
    assert.equal(formatTrendDelta(null), null);
  });
});

describe("formatRatePercent", () => {
  it("returns percent or fallback", () => {
    assert.equal(formatRatePercent(72, "N/A"), "72%");
    assert.equal(formatRatePercent(null, "N/A"), "N/A");
  });
});

describe("buildDailyTrendFromStudio", () => {
  it("maps studio daily rows to chart buckets", () => {
    const trend = buildDailyTrendFromStudio(createStudioFixture(), "en");
    assert.equal(trend.length, 1);
    assert.equal(trend[0]?.total, 2);
    assert.equal(trend[0]?.revenueCents, 500);
    assert.equal(trend[0]?.occupancyRate, 50);
  });
});

describe("buildRevenueSourceBarItems", () => {
  it("sorts cash revenue sources descending by default sort key", () => {
    const items = buildRevenueSourceBarItems(
      createStudioFixture(),
      "revenue-desc",
      {
        package: "Package",
        dropin: "Drop-in",
        gift: "Gift",
        other: "Other",
      },
      "en",
    );
    assert.equal(items[0]?.key, "package");
    assert.equal(items[0]?.value, 600);
  });
});

describe("peak column data", () => {
  it("labels weekdays and hours for charts", () => {
    const studio = createStudioFixture();
    const weekdays = buildPeakWeekdayColumnData(studio, [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
    ]);
    assert.equal(weekdays[1]?.label, "Mon");
    assert.equal(weekdays[1]?.bookings, 4);

    const hours = buildPeakHourColumnData(studio);
    assert.equal(hours[1]?.label, "18:00");
    assert.equal(hours[1]?.bookings, 5);
  });
});

describe("finance rankings", () => {
  it("maps package sales and top clients for tables", () => {
    const studio = createStudioFixture();
    const packages = buildPackageSalesBarItems(studio, "revenue-desc", "en");
    const clients = buildTopClientRankRows(studio, "en");
    assert.equal(packages[0]?.key, "p1");
    assert.equal(packages[0]?.value, 600);
    assert.equal(clients[0]?.key, "u1");
    assert.equal(clients[0]?.secondaryValue, "2");
    assert.equal(pickTopNamedAmount(studio.revenue.byPackage)?.label, "Yoga 8");
  });
});
