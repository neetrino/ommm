import {
  ManualPaymentMethod,
  PackageStatus,
  PaymentSource,
  PaymentStatus,
  PrismaClient,
} from "@prisma/client";
import type { SeededUsers } from "./seed-users";
import { PACKAGE_PLAN_SEEDS } from "./package-plans-data";

export type SeededPlanBySlug = Map<string, { id: string; slug: string }>;

function addDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

export async function seedPackagePlans(prisma: PrismaClient): Promise<SeededPlanBySlug> {
  const bySlug: SeededPlanBySlug = new Map();
  const activeSlugs = PACKAGE_PLAN_SEEDS.map((plan) => plan.slug);

  for (const plan of PACKAGE_PLAN_SEEDS) {
    const record = await prisma.packagePlan.upsert({
      where: { slug: plan.slug },
      update: {
        name: plan.name,
        categoryName: plan.categoryName,
        description: plan.description,
        priceCents: plan.priceCents,
        currency: "AMD",
        sessionsPerMonth: plan.sessionsPerMonth,
        isUnlimited: false,
        periodDays: plan.periodDays,
        billingPeriod: "one_time",
        features: plan.features,
        buttonLabel: plan.buttonLabel ?? "Choose plan",
        isPopular: plan.isPopular ?? false,
        displayOrder: plan.displayOrder,
        guestCount: plan.guestCount,
        isActive: true,
      },
      create: {
        slug: plan.slug,
        name: plan.name,
        categoryName: plan.categoryName,
        description: plan.description,
        priceCents: plan.priceCents,
        currency: "AMD",
        sessionsPerMonth: plan.sessionsPerMonth,
        isUnlimited: false,
        periodDays: plan.periodDays,
        billingPeriod: "one_time",
        features: plan.features,
        buttonLabel: plan.buttonLabel ?? "Choose plan",
        isPopular: plan.isPopular ?? false,
        displayOrder: plan.displayOrder,
        guestCount: plan.guestCount,
        isActive: true,
      },
      select: { id: true, slug: true },
    });
    bySlug.set(record.slug, record);
  }

  await prisma.packagePlan.updateMany({
    where: { slug: { notIn: activeSlugs } },
    data: { isActive: false },
  });

  return bySlug;
}

const OBSOLETE_PAYMENT_REFERENCES = [
  "seed-pay-active-reformer-8",
  "seed-pay-pending-yoga-8",
  "seed-pay-expired-mat-12",
  "seed-pay-paused-dances-12",
] as const;

async function removeObsoleteSeedPackages(prisma: PrismaClient): Promise<void> {
  for (const paymentReference of OBSOLETE_PAYMENT_REFERENCES) {
    const payment = await prisma.payment.findUnique({
      where: { paymentReference },
      include: { userPackage: true },
    });
    if (payment === null) {
      continue;
    }
    if (payment.userPackage !== null) {
      await prisma.userPackage.delete({ where: { id: payment.userPackage.id } });
    }
    await prisma.payment.delete({ where: { id: payment.id } });
  }
}

/** All package statuses + payment variants on member@ommm.local for UI QA. */
export async function seedMemberPackages(
  prisma: PrismaClient,
  users: SeededUsers,
  plans: SeededPlanBySlug,
): Promise<void> {
  await removeObsoleteSeedPackages(prisma);

  const now = new Date();
  const memberId = users.memberId;

  const activePlan = plans.get("reformer-group-8-sessions");
  const pendingPlan = plans.get("yoga-8-sessions");
  const pausedPlan = plans.get("mat-pilates-12-sessions");
  const expiredPlan = plans.get("dances-12-sessions");
  const cancelledPlan = plans.get("reformer-individual-8-sessions");
  if (
    activePlan === undefined ||
    pendingPlan === undefined ||
    pausedPlan === undefined ||
    expiredPlan === undefined ||
    cancelledPlan === undefined
  ) {
    throw new Error("Seed package plans missing required slugs");
  }

  await upsertUserPackage(prisma, {
    userId: memberId,
    planId: activePlan.id,
    status: PackageStatus.ACTIVE,
    sessionsTotal: 8,
    sessionsRemaining: 5,
    periodStart: addDays(now, -10),
    periodEnd: addDays(now, 30),
    paymentStatus: PaymentStatus.SUCCEEDED,
    paymentReference: "seed-pay-member-active",
    paymentMethod: ManualPaymentMethod.CARD,
  });

  await upsertUserPackage(prisma, {
    userId: memberId,
    planId: pendingPlan.id,
    status: PackageStatus.PENDING,
    sessionsTotal: 8,
    sessionsRemaining: 8,
    periodStart: now,
    periodEnd: addDays(now, 40),
    paymentStatus: PaymentStatus.PENDING,
    paymentReference: "seed-pay-member-pending",
    paymentMethod: ManualPaymentMethod.BANK_TRANSFER,
  });

  await upsertUserPackage(prisma, {
    userId: memberId,
    planId: pausedPlan.id,
    status: PackageStatus.PAUSED,
    sessionsTotal: 12,
    sessionsRemaining: 9,
    periodStart: addDays(now, -5),
    periodEnd: addDays(now, 25),
    pausedUntil: addDays(now, 14),
    paymentStatus: PaymentStatus.SUCCEEDED,
    paymentReference: "seed-pay-member-paused",
    paymentMethod: ManualPaymentMethod.CASH,
  });

  await upsertUserPackage(prisma, {
    userId: memberId,
    planId: expiredPlan.id,
    status: PackageStatus.EXPIRED,
    sessionsTotal: 12,
    sessionsRemaining: 0,
    periodStart: addDays(now, -120),
    periodEnd: addDays(now, -10),
    paymentStatus: PaymentStatus.SUCCEEDED,
    paymentReference: "seed-pay-member-expired",
    paymentMethod: ManualPaymentMethod.CARD,
  });

  await upsertUserPackage(prisma, {
    userId: memberId,
    planId: cancelledPlan.id,
    status: PackageStatus.CANCELLED,
    sessionsTotal: 8,
    sessionsRemaining: 6,
    periodStart: addDays(now, -20),
    periodEnd: addDays(now, 10),
    paymentStatus: PaymentStatus.REFUNDED,
    paymentReference: "seed-pay-member-cancelled",
    paymentMethod: ManualPaymentMethod.OTHER,
  });

  await seedMemberStandalonePayments(prisma, memberId);
  await prisma.user.update({
    where: { id: memberId },
    data: { giftCreditsCents: 15_000 },
  });
}

async function seedMemberStandalonePayments(
  prisma: PrismaClient,
  memberId: string,
): Promise<void> {
  const standalonePayments = [
    {
      paymentReference: "seed-pay-member-dropin-failed",
      amountCents: 15_000,
      status: PaymentStatus.FAILED,
      source: PaymentSource.DROPIN,
      description: "Drop-in reformer — card declined",
      paymentMethod: ManualPaymentMethod.CARD,
    },
    {
      paymentReference: "seed-pay-member-gift-succeeded",
      amountCents: 50_000,
      status: PaymentStatus.SUCCEEDED,
      source: PaymentSource.GIFT,
      description: "Gift card purchase for a friend",
      paymentMethod: ManualPaymentMethod.CASH,
    },
    {
      paymentReference: "seed-pay-member-other-pending",
      amountCents: 9_000,
      status: PaymentStatus.PENDING,
      source: PaymentSource.OTHER,
      description: "Manual studio adjustment — awaiting confirmation",
      paymentMethod: ManualPaymentMethod.OTHER,
    },
  ] as const;

  for (const payment of standalonePayments) {
    await prisma.payment.upsert({
      where: { paymentReference: payment.paymentReference },
      update: {
        status: payment.status,
        source: payment.source,
        description: payment.description,
        paymentMethod: payment.paymentMethod,
        confirmedAt: payment.status === PaymentStatus.SUCCEEDED ? new Date() : null,
      },
      create: {
        userId: memberId,
        amountCents: payment.amountCents,
        currency: "amd",
        status: payment.status,
        paymentReference: payment.paymentReference,
        source: payment.source,
        description: payment.description,
        paymentMethod: payment.paymentMethod,
        confirmedAt: payment.status === PaymentStatus.SUCCEEDED ? new Date() : null,
      },
    });
  }
}

type UserPackageSeed = {
  userId: string;
  planId: string;
  status: PackageStatus;
  sessionsTotal: number;
  sessionsRemaining: number;
  periodStart: Date;
  periodEnd: Date;
  pausedUntil?: Date;
  paymentStatus: PaymentStatus;
  paymentReference: string;
  paymentMethod?: ManualPaymentMethod;
};

async function upsertUserPackage(
  prisma: PrismaClient,
  seed: UserPackageSeed,
): Promise<void> {
  const existingPayment = await prisma.payment.findUnique({
    where: { paymentReference: seed.paymentReference },
    include: { userPackage: true },
  });

  if (existingPayment?.userPackage !== null && existingPayment?.userPackage !== undefined) {
    await prisma.userPackage.update({
      where: { id: existingPayment.userPackage.id },
      data: {
        status: seed.status,
        sessionsTotal: seed.sessionsTotal,
        sessionsRemaining: seed.sessionsRemaining,
        currentPeriodStart: seed.periodStart,
        currentPeriodEnd: seed.periodEnd,
        pausedUntil: seed.pausedUntil ?? null,
      },
    });
    await prisma.payment.update({
      where: { id: existingPayment.id },
      data: {
        status: seed.paymentStatus,
        paymentMethod: seed.paymentMethod ?? null,
        confirmedAt:
          seed.paymentStatus === PaymentStatus.SUCCEEDED ||
          seed.paymentStatus === PaymentStatus.REFUNDED
            ? new Date()
            : null,
      },
    });
    return;
  }

  const plan = await prisma.packagePlan.findUniqueOrThrow({ where: { id: seed.planId } });
  const userPackage = await prisma.userPackage.create({
    data: {
      userId: seed.userId,
      planId: seed.planId,
      status: seed.status,
      sessionsTotal: seed.sessionsTotal,
      sessionsRemaining: seed.sessionsRemaining,
      currentPeriodStart: seed.periodStart,
      currentPeriodEnd: seed.periodEnd,
      pausedUntil: seed.pausedUntil ?? null,
    },
  });

  await prisma.payment.create({
    data: {
      userId: seed.userId,
      planId: seed.planId,
      userPackageId: userPackage.id,
      amountCents: plan.priceCents,
      currency: "amd",
      status: seed.paymentStatus,
      paymentReference: seed.paymentReference,
      source: PaymentSource.PACKAGE,
      sourceId: userPackage.id,
      description: `Seed payment for ${plan.name}`,
      paymentMethod: seed.paymentMethod ?? null,
      confirmedAt:
        seed.paymentStatus === PaymentStatus.SUCCEEDED ||
        seed.paymentStatus === PaymentStatus.REFUNDED
          ? new Date()
          : null,
    },
  });
}
