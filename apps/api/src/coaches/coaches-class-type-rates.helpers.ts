import { BadRequestException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import {
  COACH_SALARY_PER_CLASS_MAX_AMD,
  COACH_SALARY_PER_CLASS_MIN_AMD,
} from './coaches-salary.constants';

export type CoachClassTypeRateInput = {
  classTypeId: string;
  amountAmd: number;
};

export type CoachClassTypeRateRow = {
  classTypeId: string;
  amountAmd: number;
};

type TxClient = Prisma.TransactionClient;

export function normalizeCoachClassTypeRates(
  rates: CoachClassTypeRateInput[] | undefined,
): CoachClassTypeRateInput[] | undefined {
  if (rates === undefined) {
    return undefined;
  }
  const byClassTypeId = new Map<string, number>();
  for (const rate of rates) {
    const classTypeId = rate.classTypeId.trim();
    if (classTypeId.length === 0) {
      throw new BadRequestException('classTypeRates.classTypeId is required');
    }
    if (
      !Number.isInteger(rate.amountAmd) ||
      rate.amountAmd < COACH_SALARY_PER_CLASS_MIN_AMD ||
      rate.amountAmd > COACH_SALARY_PER_CLASS_MAX_AMD
    ) {
      throw new BadRequestException(
        `classTypeRates.amountAmd must be ${COACH_SALARY_PER_CLASS_MIN_AMD}–${COACH_SALARY_PER_CLASS_MAX_AMD}`,
      );
    }
    byClassTypeId.set(classTypeId, rate.amountAmd);
  }
  return Array.from(byClassTypeId.entries()).map(([classTypeId, amountAmd]) => ({
    classTypeId,
    amountAmd,
  }));
}

export function mapCoachClassTypeRates(
  rates: readonly { classTypeId: string; amountAmd: number }[],
): CoachClassTypeRateRow[] {
  return rates.map((rate) => ({
    classTypeId: rate.classTypeId,
    amountAmd: rate.amountAmd,
  }));
}

/**
 * Replaces all class-type rates for a coach. Rows with amountAmd === 0 are omitted.
 */
export async function replaceCoachClassTypeRates(
  tx: TxClient,
  coachProfileId: string,
  rates: readonly CoachClassTypeRateInput[],
): Promise<void> {
  await tx.coachClassTypeRate.deleteMany({ where: { coachProfileId } });
  const positive = rates.filter((rate) => rate.amountAmd > 0);
  if (positive.length === 0) {
    return;
  }
  await tx.coachClassTypeRate.createMany({
    data: positive.map((rate) => ({
      coachProfileId,
      classTypeId: rate.classTypeId,
      amountAmd: rate.amountAmd,
    })),
  });
}

export async function assertClassTypeIdsExist(
  tx: TxClient | { classType: { findMany: TxClient['classType']['findMany'] } },
  classTypeIds: readonly string[],
): Promise<void> {
  if (classTypeIds.length === 0) {
    return;
  }
  const uniqueIds = Array.from(new Set(classTypeIds));
  const found = await tx.classType.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true },
  });
  if (found.length !== uniqueIds.length) {
    throw new BadRequestException('One or more classTypeRates.classTypeId values are invalid');
  }
}
