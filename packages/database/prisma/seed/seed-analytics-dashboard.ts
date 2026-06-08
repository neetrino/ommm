import {
  BookingChannel,
  BookingStatus,
  ClassSessionStatus,
  ManualPaymentMethod,
  PaymentSource,
  PaymentStatus,
  PrismaClient,
} from "@prisma/client";
import { addDays } from "./class-data";
import type { SeededPlanBySlug } from "./seed-packages";
import type { SeededUsers } from "./seed-users";

export const SEED_ANALYTICS_SESSION_PREFIX = "[Seed Analytics]";
export const SEED_ANALYTICS_PAYMENT_REF_PREFIX = "seed-analytics-pay-";

/** ~2.5 months — enough for 30/90-day analytics and month-over-month growth. */
const ANALYTICS_HISTORY_DAYS = 75;

const MEMBER_EMAILS = [
  "member@ommm.local",
  "member2@ommm.local",
  "member3@ommm.local",
  "member4@ommm.local",
] as const;

const TODAY_BOOKING_STATUSES: readonly BookingStatus[] = [
  BookingStatus.BOOKED,
  BookingStatus.BOOKED,
  BookingStatus.COMPLETED,
  BookingStatus.CANCELLED,
  BookingStatus.MISSED,
  BookingStatus.BOOKED,
];

type ResolvedMember = { id: string; email: string };

type SessionContext = {
  classTypeId: string;
  coachId: string;
};

/** Calendar-month distance from today — matches dashboard month revenue buckets. */
function monthsFromToday(dayOffset: number): number {
  const date = addDays(new Date(), dayOffset);
  const now = new Date();
  return (date.getFullYear() - now.getFullYear()) * 12 + (date.getMonth() - now.getMonth());
}

/** Lower in older months, higher recently — visible MoM ramp on charts. */
function monthGrowthFactor(dayOffset: number): number {
  const monthDelta = monthsFromToday(dayOffset);
  if (monthDelta <= -2) {
    return 0.42;
  }
  if (monthDelta === -1) {
    return 0.68;
  }
  return 1;
}

function dailyRevenueCents(dayOffset: number): number {
  const growth = monthGrowthFactor(dayOffset);
  const weekday = addDays(new Date(), dayOffset).getDay();
  const weekendScale = weekday === 0 || weekday === 6 ? 0.86 : 1;
  const wave = Math.sin(dayOffset / 4) * 4_000;
  const base = 24_000 + growth * 62_000 + wave;
  return Math.max(12_000, Math.round(base * weekendScale));
}

function dailyBookingCount(dayOffset: number): number {
  const growth = monthGrowthFactor(dayOffset);
  const weekday = addDays(new Date(), dayOffset).getDay();
  const weekendScale = weekday === 0 || weekday === 6 ? 0.75 : 1;
  const count = Math.round((2 + growth * 6) * weekendScale);
  return Math.max(1, Math.min(count, 6));
}

function dayAt(dayOffset: number, hour: number): Date {
  const date = addDays(new Date(), dayOffset);
  date.setHours(hour, 0, 0, 0);
  return date;
}

function sessionEndsAt(startsAt: Date): Date {
  const endsAt = new Date(startsAt);
  endsAt.setMinutes(endsAt.getMinutes() + 55);
  return endsAt;
}

async function cleanupAnalyticsSeed(prisma: PrismaClient): Promise<void> {
  await prisma.payment.deleteMany({
    where: { paymentReference: { startsWith: SEED_ANALYTICS_PAYMENT_REF_PREFIX } },
  });
  await prisma.classSession.deleteMany({
    where: { title: { startsWith: SEED_ANALYTICS_SESSION_PREFIX } },
  });
}

function resolveMembers(users: SeededUsers): ResolvedMember[] {
  return MEMBER_EMAILS.flatMap((email) => {
    const user = users.byEmail.get(email);
    return user === undefined ? [] : [{ id: user.id, email }];
  });
}

async function seedDailyRevenuePayments(
  prisma: PrismaClient,
  members: ResolvedMember[],
  plans: SeededPlanBySlug,
): Promise<void> {
  const dropInPlan = plans.get("yoga-1-session");
  const packagePlan = plans.get("reformer-group-8-sessions");

  for (let index = 0; index < ANALYTICS_HISTORY_DAYS; index += 1) {
    const dayOffset = index - (ANALYTICS_HISTORY_DAYS - 1);
    const paymentDate = dayAt(dayOffset, 11);
    const totalCents = dailyRevenueCents(dayOffset);
    const chunks = [
      { source: PaymentSource.PACKAGE, amount: Math.round(totalCents * 0.52) },
      { source: PaymentSource.DROPIN, amount: Math.round(totalCents * 0.33) },
      { source: PaymentSource.GIFT, amount: Math.round(totalCents * 0.15) },
    ];

    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
      const chunk = chunks[chunkIndex];
      const member = members[(index + chunkIndex) % members.length];
      await prisma.payment.create({
        data: {
          userId: member.id,
          amountCents: chunk.amount,
          currency: "amd",
          status: PaymentStatus.SUCCEEDED,
          paymentReference: `${SEED_ANALYTICS_PAYMENT_REF_PREFIX}d${index}-c${chunkIndex}`,
          source: chunk.source,
          description: `Seed analytics ${chunk.source.toLowerCase()} revenue`,
          planId:
            chunk.source === PaymentSource.PACKAGE
              ? packagePlan?.id
              : chunk.source === PaymentSource.DROPIN
                ? dropInPlan?.id
                : null,
          paymentMethod: ManualPaymentMethod.CARD,
          confirmedAt: paymentDate,
          createdAt: paymentDate,
        },
      });
    }
  }
}

async function createAnalyticsSession(
  prisma: PrismaClient,
  ctx: SessionContext,
  dayOffset: number,
  hour: number,
  label: string,
): Promise<string> {
  const startsAt = dayAt(dayOffset, hour);
  const session = await prisma.classSession.create({
    data: {
      title: `${SEED_ANALYTICS_SESSION_PREFIX} ${label}`,
      description: "Seeded session for dashboard and analytics charts.",
      classTypeId: ctx.classTypeId,
      coachId: ctx.coachId,
      startsAt,
      endsAt: sessionEndsAt(startsAt),
      capacity: 12,
      level: "Open",
      priceCents: 15_000,
      status: ClassSessionStatus.ACTIVE,
    },
    select: { id: true },
  });
  return session.id;
}

function resolveBookingStatus(
  dayOffset: number,
  slot: number,
): BookingStatus {
  if (dayOffset === 0) {
    return TODAY_BOOKING_STATUSES[slot % TODAY_BOOKING_STATUSES.length];
  }
  if (dayOffset > 0) {
    return BookingStatus.BOOKED;
  }
  if (slot % 6 === 5) {
    return BookingStatus.MISSED;
  }
  if (slot % 5 === 4) {
    return BookingStatus.CANCELLED;
  }
  return BookingStatus.COMPLETED;
}

async function upsertAnalyticsBooking(
  prisma: PrismaClient,
  userId: string,
  sessionId: string,
  status: BookingStatus,
  sessionStart: Date,
): Promise<void> {
  await prisma.booking.upsert({
    where: { userId_sessionId: { userId, sessionId } },
    update: { status, channel: BookingChannel.WEBSITE },
    create: {
      userId,
      sessionId,
      status,
      channel: BookingChannel.WEBSITE,
      attendedAt: status === BookingStatus.COMPLETED ? sessionStart : null,
      cancelledAt: status === BookingStatus.CANCELLED ? addDays(sessionStart, -1) : null,
    },
  });
}

async function seedHistoricalSessionsAndBookings(
  prisma: PrismaClient,
  members: ResolvedMember[],
  ctx: SessionContext,
): Promise<void> {
  for (let index = 0; index < ANALYTICS_HISTORY_DAYS; index += 1) {
    const dayOffset = index - (ANALYTICS_HISTORY_DAYS - 1);
    const bookingTotal = dailyBookingCount(dayOffset);

    for (let slot = 0; slot < bookingTotal; slot += 1) {
      const hour = 8 + slot * 2;
      const sessionId = await createAnalyticsSession(
        prisma,
        ctx,
        dayOffset,
        hour,
        `Day ${dayOffset} · ${slot + 1}`,
      );
      const member = members[(index + slot) % members.length];
      const startsAt = dayAt(dayOffset, hour);
      const status = resolveBookingStatus(dayOffset, slot);
      await upsertAnalyticsBooking(prisma, member.id, sessionId, status, startsAt);
    }
  }
}

async function markRecentUsers(prisma: PrismaClient, users: SeededUsers): Promise<void> {
  const today = dayAt(0, 9);
  const recentEmails = ["member3@ommm.local", "member4@ommm.local"] as const;
  for (const email of recentEmails) {
    const user = users.byEmail.get(email);
    if (user === undefined) {
      continue;
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { createdAt: today },
    });
  }
}

export async function seedAnalyticsDashboard(
  prisma: PrismaClient,
  users: SeededUsers,
  plans: SeededPlanBySlug,
): Promise<void> {
  await cleanupAnalyticsSeed(prisma);

  const members = resolveMembers(users);
  if (members.length === 0) {
    throw new Error("Analytics seed requires at least one member user");
  }

  const classType = await prisma.classType.findFirst({ where: { slug: "reformer-group" } });
  const coach = users.coaches[0];
  if (classType === undefined || coach === undefined) {
    throw new Error("Analytics seed missing class type or coach");
  }

  const ctx: SessionContext = { classTypeId: classType.id, coachId: coach.profileId };

  await seedDailyRevenuePayments(prisma, members, plans);
  await seedHistoricalSessionsAndBookings(prisma, members, ctx);
  await markRecentUsers(prisma, users);
}
