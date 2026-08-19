import { PaymentSource } from '@prisma/client';
import { joinName } from './reports.helpers';
import type { PrismaService } from '../prisma/prisma.service';
import { STUDIO_ANALYTICS_ROW_CAP } from './studio-analytics.helpers';
import type {
  StudioAnalyticsPackagePlanRow,
  StudioAnalyticsPaymentRow,
} from './studio-analytics.types';

export async function loadStudioAnalyticsPayments(
  prisma: PrismaService,
  from: Date,
  to: Date,
): Promise<StudioAnalyticsPaymentRow[]> {
  const rows = await prisma.payment.findMany({
    where: { createdAt: { gte: from, lte: to } },
    select: {
      amountCents: true,
      description: true,
      status: true,
      createdAt: true,
      source: true,
      sourceId: true,
      paymentMethod: true,
      userId: true,
      user: { select: { role: true, name: true, lastName: true, email: true } },
    },
    take: STUDIO_ANALYTICS_ROW_CAP,
  });
  return rows.map((row) => ({
    amountCents: row.amountCents,
    description: row.description,
    status: row.status,
    createdAt: row.createdAt,
    source: row.source,
    sourceId: row.sourceId,
    paymentMethod: row.paymentMethod,
    userId: row.userId,
    userRole: row.user.role,
    userLabel: joinName(row.user.name, row.user.lastName, row.user.email),
  }));
}

export async function loadStudioAnalyticsPackagePlans(
  prisma: PrismaService,
  payments: StudioAnalyticsPaymentRow[],
): Promise<StudioAnalyticsPackagePlanRow[]> {
  const packageIds = [
    ...new Set(
      payments.flatMap((payment) =>
        payment.source === PaymentSource.PACKAGE && payment.sourceId
          ? [payment.sourceId]
          : [],
      ),
    ),
  ];
  if (packageIds.length === 0) {
    return [];
  }
  const rows = await prisma.userPackage.findMany({
    where: { id: { in: packageIds } },
    select: {
      id: true,
      planId: true,
      planNameSnapshot: true,
      planCategoryNameSnapshot: true,
      plan: {
        select: {
          name: true,
          categoryName: true,
          classTypeId: true,
          typeSessionAllocations: true,
        },
      },
    },
    take: STUDIO_ANALYTICS_ROW_CAP,
  });
  return rows.map((row) => ({
    userPackageId: row.id,
    planId: row.planId,
    planName: row.plan?.name ?? row.planNameSnapshot,
    categoryName: row.plan?.categoryName ?? row.planCategoryNameSnapshot,
    classTypeId: row.plan?.classTypeId ?? null,
    typeSessionAllocations: row.plan?.typeSessionAllocations ?? [],
  }));
}
