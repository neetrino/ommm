import {
  ManualPaymentMethod,
  PaymentSource,
  PaymentStatus,
  type Prisma,
} from '@prisma/client';
import { loadStudioPackagePaymentDueIds } from '../packages/studio-package-payment-due';
import { joinName } from './reports.helpers';

export const DASHBOARD_STUDIO_PAYMENT_DUE_LIMIT = 8;

export type DashboardStudioPaymentDueItem = {
  clientId: string;
  clientName: string;
  packageId: string;
  packageName: string;
};

export type DashboardStudioPaymentDue = {
  count: number;
  items: DashboardStudioPaymentDueItem[];
};

type DashboardPaymentDueDb = {
  payment: {
    findMany: (args: {
      where: Prisma.PaymentWhereInput;
      select: { sourceId: true };
    }) => Promise<Array<{ sourceId: string | null }>>;
  };
  bookingConsumption: {
    findMany: (args: {
      where: Prisma.BookingConsumptionWhereInput;
      select: { userPackageId: true };
    }) => Promise<Array<{ userPackageId: string }>>;
  };
  userPackage: {
    findMany: (args: {
      where: Prisma.UserPackageWhereInput;
      select: {
        id: true;
        planNameSnapshot: true;
        user: {
          select: {
            id: true;
            name: true;
            lastName: true;
            email: true;
          };
        };
      };
      orderBy: { createdAt: 'asc' };
    }) => Promise<
      Array<{
        id: string;
        planNameSnapshot: string;
        user: {
          id: string;
          name: string | null;
          lastName: string | null;
          email: string;
        };
      }>
    >;
  };
};

function uniquePackageIds(
  payments: Array<{ sourceId: string | null }>,
): string[] {
  return [
    ...new Set(
      payments
        .map((payment) => payment.sourceId)
        .filter((id): id is string => typeof id === 'string' && id.length > 0),
    ),
  ];
}

/** Unpaid cash/terminal packages whose consumed class ended at least one hour ago. */
export async function loadDashboardStudioPaymentDue(
  db: DashboardPaymentDueDb,
  now: Date = new Date(),
  limit: number = DASHBOARD_STUDIO_PAYMENT_DUE_LIMIT,
): Promise<DashboardStudioPaymentDue> {
  const payments = await db.payment.findMany({
    where: {
      status: PaymentStatus.PENDING,
      source: PaymentSource.PACKAGE,
      sourceId: { not: null },
      paymentMethod: {
        in: [ManualPaymentMethod.CASH, ManualPaymentMethod.CARD_TERMINAL],
      },
    },
    select: { sourceId: true },
  });
  const packageIds = uniquePackageIds(payments);
  const dueIds = await loadStudioPackagePaymentDueIds(db, packageIds, now);
  if (dueIds.size === 0) {
    return { count: 0, items: [] };
  }

  const packages = await db.userPackage.findMany({
    where: { id: { in: [...dueIds] } },
    select: {
      id: true,
      planNameSnapshot: true,
      user: {
        select: { id: true, name: true, lastName: true, email: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return {
    count: packages.length,
    items: packages.slice(0, limit).map((row) => ({
      clientId: row.user.id,
      clientName: joinName(row.user.name, row.user.lastName, row.user.email),
      packageId: row.id,
      packageName: row.planNameSnapshot,
    })),
  };
}
