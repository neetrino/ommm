import { BadRequestException } from '@nestjs/common';
import { ClassSessionStatus } from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service';
import { planCoversClassType } from '../packages/plan-covers-class-type';
import {
  parseStoredTypeSessionAllocations,
  resolveFinalPriceCents,
} from '../packages/packages-plan.helpers';

export const CLASS_GIFT_MAX_QUANTITY = 100;

type ClassGiftRequest = {
  classTypeId?: string;
  classQuantity?: number;
  packagePlanId?: string;
};

type ClassGiftDb = Pick<
  PrismaService,
  'classType' | 'classSession' | 'packagePlan'
>;

export async function resolveClassGiftCharge(
  db: ClassGiftDb,
  params: ClassGiftRequest,
): Promise<{
  amountCents: number;
  classTypeId: string;
  classQuantity: number;
}> {
  const classTypeId = params.classTypeId?.trim() ?? '';
  const classQuantity = params.classQuantity ?? 0;
  if (
    classTypeId.length === 0 ||
    classQuantity < 1 ||
    classQuantity > CLASS_GIFT_MAX_QUANTITY
  ) {
    throw new BadRequestException(
      'Class gift cards need a class type and quantity',
    );
  }
  const packagePlanId = params.packagePlanId?.trim() ?? '';
  if (packagePlanId.length > 0) {
    return chargePackageClassGift(db, packagePlanId, classTypeId);
  }
  const unitPriceAmd = await quoteClassUnitPriceAmd(db, classTypeId);
  return {
    amountCents: unitPriceAmd * classQuantity,
    classTypeId,
    classQuantity,
  };
}

/** The gift is the package. Price and session count come from the plan, not a class day. */
async function chargePackageClassGift(
  db: Pick<PrismaService, 'packagePlan'>,
  packagePlanId: string,
  classTypeId: string,
): Promise<{
  amountCents: number;
  classTypeId: string;
  classQuantity: number;
}> {
  const plan = await db.packagePlan.findFirst({
    where: { id: packagePlanId, isActive: true },
    select: {
      priceCents: true,
      discountedPriceCents: true,
      classTypeId: true,
      typeSessionAllocations: true,
    },
  });
  if (!plan || !planCoversClassType(plan, classTypeId)) {
    throw new BadRequestException('This package does not include that class');
  }
  const amountCents = resolveFinalPriceCents(plan);
  if (amountCents <= 0) {
    throw new BadRequestException('This package has no price');
  }
  return {
    amountCents,
    classTypeId,
    classQuantity: packageGiftSessionCount(
      plan.typeSessionAllocations,
      classTypeId,
    ),
  };
}

function packageGiftSessionCount(
  allocations: unknown,
  classTypeId: string,
): number {
  const match = parseStoredTypeSessionAllocations(allocations).find(
    (item) => item.classTypeId === classTypeId,
  );
  const count = match?.sessionCount ?? 1;
  if (count < 1 || count > CLASS_GIFT_MAX_QUANTITY) {
    throw new BadRequestException(
      'Class gift cards need a class type and quantity',
    );
  }
  return count;
}

/** Latest priced session for this class. Shop price and admin conversion use the same rate. */
export async function quoteClassUnitPriceAmd(
  db: Pick<PrismaService, 'classType' | 'classSession'>,
  classTypeId: string,
): Promise<number> {
  const classType = await db.classType.findFirst({
    where: { id: classTypeId, archivedAt: null },
    select: { id: true },
  });
  if (!classType) {
    throw new BadRequestException('Class type not found');
  }
  const session = await db.classSession.findFirst({
    where: {
      classTypeId,
      priceCents: { gt: 0 },
      status: { not: ClassSessionStatus.CANCELLED },
    },
    orderBy: { startsAt: 'desc' },
    select: { priceCents: true },
  });
  if (!session) {
    throw new BadRequestException('This class has no drop-in price');
  }
  return session.priceCents;
}
