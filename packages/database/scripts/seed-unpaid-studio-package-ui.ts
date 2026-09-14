/**
 * Dev-only: unpaid cash package + a finished class that ended 2 hours ago.
 * No real payment. Safe to re-run; previous demo rows are replaced.
 */
import {
  BookingStatus,
  ClassSessionStatus,
  ManualPaymentMethod,
  PaymentSource,
  PaymentStatus,
  PrismaClient,
  UserPackageStatus,
} from '@prisma/client';

const prisma = new PrismaClient();
const DEMO_EMAIL = 'payment-due-demo@ommm.local';
const SESSION_MARKER = '[PAYMENT-DUE-DEMO]';
const CLASS_DURATION_MS = 60 * 60 * 1000;
const HOURS_AFTER_CLASS_END = 2;

async function cleanupPreviousDemo(userId: string): Promise<void> {
  const oldSessions = await prisma.classSession.findMany({
    where: { title: SESSION_MARKER },
    select: { id: true },
  });
  const sessionIds = oldSessions.map((row) => row.id);
  if (sessionIds.length > 0) {
    const bookings = await prisma.booking.findMany({
      where: { sessionId: { in: sessionIds } },
      select: { id: true },
    });
    const bookingIds = bookings.map((row) => row.id);
    if (bookingIds.length > 0) {
      await prisma.bookingConsumption.deleteMany({
        where: { bookingId: { in: bookingIds } },
      });
      await prisma.booking.deleteMany({ where: { id: { in: bookingIds } } });
    }
    await prisma.classSession.deleteMany({ where: { id: { in: sessionIds } } });
  }

  const demoPackages = await prisma.userPackage.findMany({
    where: {
      userId,
      planNameSnapshot: { contains: SESSION_MARKER },
    },
    select: { id: true },
  });
  const packageIds = demoPackages.map((row) => row.id);
  if (packageIds.length > 0) {
    await prisma.payment.deleteMany({
      where: { source: PaymentSource.PACKAGE, sourceId: { in: packageIds } },
    });
    await prisma.userPackageBalance.deleteMany({
      where: { userPackageId: { in: packageIds } },
    });
    await prisma.userPackage.deleteMany({ where: { id: { in: packageIds } } });
  }
}

async function main(): Promise<void> {
  const plan = await prisma.packagePlan.findFirst({
    where: { isActive: true, priceCents: { gt: 0 } },
  });
  if (plan === null) {
    throw new Error('No active package plan found');
  }
  const classTypeId = plan.classTypeId;
  if (classTypeId === null) {
    throw new Error('Package plan has no class type');
  }
  const classType = await prisma.classType.findUnique({
    where: { id: classTypeId },
    select: { id: true, name: true },
  });
  if (classType === null) {
    throw new Error('Class type for plan not found');
  }
  const coach = await prisma.coachProfile.findFirst({
    where: { isActive: true },
    select: { id: true },
  });
  if (coach === null) {
    throw new Error('No active coach found');
  }

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { name: 'Payment Due', lastName: 'Demo' },
    create: {
      email: DEMO_EMAIL,
      name: 'Payment Due',
      lastName: 'Demo',
      role: 'USER',
      registrationSource: 'STAFF',
    },
    select: { id: true, email: true, name: true, lastName: true },
  });

  await cleanupPreviousDemo(user.id);

  const now = new Date();
  const endsAt = new Date(now.getTime() - HOURS_AFTER_CLASS_END * CLASS_DURATION_MS);
  const startsAt = new Date(endsAt.getTime() - CLASS_DURATION_MS);
  const periodEnd = new Date(now.getTime() + plan.periodDays * 24 * 60 * 60 * 1000);
  const sessionsTotal = plan.isUnlimited ? null : (plan.sessionsPerMonth ?? 8);
  const sessionsRemaining =
    sessionsTotal === null ? null : Math.max(sessionsTotal - 1, 0);

  const userPackage = await prisma.userPackage.create({
    data: {
      userId: user.id,
      planId: plan.id,
      sourcePlanIdSnapshot: plan.id,
      planNameSnapshot: `${plan.name} ${SESSION_MARKER}`,
      planCategoryNameSnapshot: plan.categoryName,
      planPriceCentsSnapshot: plan.priceCents,
      planPeriodDaysSnapshot: plan.periodDays,
      planIsUnlimitedSnapshot: plan.isUnlimited,
      planSessionsPerMonthSnapshot: plan.sessionsPerMonth,
      freezeAllowedCountSnapshot: plan.freezeAllowedCount,
      freezeMaxDaysPerUseSnapshot: plan.freezeMaxDaysPerUse,
      status: UserPackageStatus.ACTIVE,
      awaitingFirstVisit: false,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      sessionsTotal,
      sessionsRemaining,
      guestSlotsTotal: plan.guestCount,
      guestSlotsRemaining: plan.guestCount,
    },
    select: { id: true },
  });

  const balance = await prisma.userPackageBalance.create({
    data: {
      userPackageId: userPackage.id,
      sourcePlanId: plan.id,
      classTypeId: classType.id,
      coverageKey: `${userPackage.id}:${plan.id}`,
      sourcePackageNameSnapshot: plan.name,
      sourceCategoryNameSnapshot: classType.name,
      sessionsTotal,
      sessionsUsed: plan.isUnlimited ? 1 : 1,
      sessionsRemaining,
      isUnlimited: plan.isUnlimited,
    },
    select: { id: true },
  });

  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      amountCents: plan.priceCents,
      currency: 'amd',
      status: PaymentStatus.PENDING,
      paymentReference: `PKG-DUE-${Date.now()}`,
      source: PaymentSource.PACKAGE,
      sourceId: userPackage.id,
      description: `Package · ${plan.name}`,
      paymentMethod: ManualPaymentMethod.CASH,
      metadata: {
        statusReason: 'AWAITING_CASH',
        studioPackageFulfilled: true,
      },
    },
    select: { id: true, status: true, paymentMethod: true },
  });

  const session = await prisma.classSession.create({
    data: {
      title: SESSION_MARKER,
      classTypeId: classType.id,
      coachId: coach.id,
      startsAt,
      endsAt,
      capacity: 8,
      status: ClassSessionStatus.FINISHED,
    },
    select: { id: true },
  });

  const booking = await prisma.booking.create({
    data: {
      userId: user.id,
      sessionId: session.id,
      status: BookingStatus.COMPLETED,
      attendedAt: endsAt,
    },
    select: { id: true },
  });

  await prisma.bookingConsumption.create({
    data: {
      bookingId: booking.id,
      userPackageId: userPackage.id,
      userPackageBalanceId: balance.id,
      consumedSessions: 1,
    },
  });

  console.log(
    JSON.stringify(
      {
        clientId: user.id,
        email: user.email,
        name: `${user.name} ${user.lastName}`.trim(),
        userPackageId: userPackage.id,
        payment,
        classEndedAt: endsAt.toISOString(),
        hoursAfterClassEnd: HOURS_AFTER_CLASS_END,
        adminUrl: `/en/admin/clients?viewClient=${user.id}&clientTab=packages`,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
