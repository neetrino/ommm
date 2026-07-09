/** One package validity day in milliseconds. */
export const PACKAGE_PERIOD_DAY_MS = 86_400_000;

export function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

/**
 * Resolves when a purchased package becomes active.
 * Future plan start dates defer activation; past or same-day dates keep purchase time.
 */
export function resolveUserPackagePeriodStart(
  planStartDate: Date | null | undefined,
  purchasedAt: Date,
): Date {
  if (planStartDate == null) {
    return purchasedAt;
  }
  const configuredStart = startOfUtcDay(planStartDate);
  const purchaseDayStart = startOfUtcDay(purchasedAt);
  if (configuredStart.getTime() > purchaseDayStart.getTime()) {
    return configuredStart;
  }
  return purchasedAt;
}

export function resolveUserPackagePeriodBounds(params: {
  planStartDate: Date | null | undefined;
  purchasedAt: Date;
  periodDays: number;
}): { currentPeriodStart: Date; currentPeriodEnd: Date } {
  const currentPeriodStart = resolveUserPackagePeriodStart(
    params.planStartDate,
    params.purchasedAt,
  );
  const currentPeriodEnd = new Date(
    currentPeriodStart.getTime() + params.periodDays * PACKAGE_PERIOD_DAY_MS,
  );
  return { currentPeriodStart, currentPeriodEnd };
}

export function parsePlanStartDate(value: string): Date {
  const [yearRaw, monthRaw, dayRaw] = value.slice(0, 10).split('-');
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    Number.isNaN(parsed.getTime())
  ) {
    throw new Error('Invalid package start date');
  }
  return parsed;
}
