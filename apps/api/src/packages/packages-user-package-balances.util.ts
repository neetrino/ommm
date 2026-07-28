import { BadRequestException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { parseStoredTypeSessionAllocations } from './packages-plan.helpers';
import type { AdminPlanRecord } from './packages-plan.types';

/** Creates session balances for a newly purchased user package (type splits or single pool). */
export async function createBalancesForUserPackage(
  tx: Prisma.TransactionClient,
  params: { plan: AdminPlanRecord; userPackageId: string },
): Promise<void> {
  const typeAllocations = parseStoredTypeSessionAllocations(
    params.plan.typeSessionAllocations,
  );
  if (typeAllocations.length > 0) {
    const classTypes = await tx.classType.findMany({
      where: { id: { in: typeAllocations.map((item) => item.classTypeId) } },
      select: { id: true, name: true },
    });
    const classTypeNameById = new Map(
      classTypes.map((classType) => [classType.id, classType.name]),
    );
    const missingClassTypeIds = typeAllocations
      .map((allocation) => allocation.classTypeId)
      .filter((classTypeId) => !classTypeNameById.has(classTypeId));
    if (missingClassTypeIds.length > 0) {
      throw new BadRequestException(
        `Package plan references missing class type(s): ${missingClassTypeIds.join(', ')}. Fix plan allocations before purchase.`,
      );
    }
    for (const allocation of typeAllocations) {
      const classTypeName = classTypeNameById.get(allocation.classTypeId);
      if (classTypeName === undefined) {
        throw new BadRequestException(
          `Package plan references missing class type: ${allocation.classTypeId}`,
        );
      }
      await (
        tx as unknown as {
          userPackageBalance: {
            create(args: unknown): Promise<unknown>;
          };
        }
      ).userPackageBalance.create({
        data: {
          userPackageId: params.userPackageId,
          sourcePlanId: params.plan.id,
          classTypeId: allocation.classTypeId,
          coverageKey: `${params.userPackageId}:${params.plan.id}:${allocation.classTypeId}`,
          sourcePackageNameSnapshot: params.plan.name,
          sourceCategoryNameSnapshot: classTypeName,
          sessionsTotal: allocation.sessionCount,
          sessionsRemaining: allocation.sessionCount,
          isUnlimited: false,
        },
      });
    }
    return;
  }
  await (
    tx as unknown as {
      userPackageBalance: {
        create(args: unknown): Promise<unknown>;
      };
    }
  ).userPackageBalance.create({
    data: {
      userPackageId: params.userPackageId,
      sourcePlanId: params.plan.id,
      classTypeId: params.plan.classTypeId ?? null,
      coverageKey: `${params.userPackageId}:${params.plan.id}`,
      sourcePackageNameSnapshot: params.plan.name,
      sourceCategoryNameSnapshot: params.plan.categoryName,
      sessionsTotal: params.plan.isUnlimited
        ? null
        : (params.plan.sessionsPerMonth ?? 0),
      sessionsRemaining: params.plan.isUnlimited
        ? null
        : (params.plan.sessionsPerMonth ?? 0),
      isUnlimited: params.plan.isUnlimited,
    },
  });
}
