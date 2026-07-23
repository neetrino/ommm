import { BadRequestException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

type PackageStockSnapshot = {
  availableQuantity: number | null;
};

export function assertPackageHasAvailableStock(
  plan: PackageStockSnapshot,
): void {
  if (plan.availableQuantity === null) {
    return;
  }
  if (plan.availableQuantity < 1) {
    throw new BadRequestException('Package is out of stock');
  }
}

export function packageHasPublicStock(plan: PackageStockSnapshot): boolean {
  return plan.availableQuantity === null || plan.availableQuantity > 0;
}

/** Tracked inventory at zero — hide from public listings and block purchase. */
export function packageStockRequiresDeactivation(
  availableQuantity: number | null | undefined,
): boolean {
  return availableQuantity === 0;
}

/** Atomically decrements tracked stock; no-op when inventory is unlimited. */
export async function decrementPackagePlanStock(
  tx: Prisma.TransactionClient,
  planId: string,
): Promise<boolean> {
  const decremented = await tx.packagePlan.updateMany({
    where: {
      id: planId,
      availableQuantity: { gt: 0 },
    },
    data: { availableQuantity: { decrement: 1 } },
  });
  if (decremented.count === 1) {
    await tx.packagePlan.updateMany({
      where: {
        id: planId,
        availableQuantity: 0,
      },
      data: { isActive: false },
    });
    return true;
  }

  const plan = await tx.packagePlan.findUnique({
    where: { id: planId },
    select: { availableQuantity: true },
  });
  if (plan === null) {
    throw new BadRequestException('Package plan not found');
  }
  if (plan.availableQuantity === null) {
    return false;
  }
  throw new BadRequestException('Package is out of stock');
}
