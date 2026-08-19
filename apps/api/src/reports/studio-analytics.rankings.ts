import { PaymentSource, PaymentStatus, Role } from '@prisma/client';
import { isInfluencerPaymentMethod } from '../payments/payment-revenue.util';
import { parseStoredTypeSessionAllocations } from '../packages/packages-plan.helpers';
import {
  STUDIO_ANALYTICS_RANK_LIMIT,
  UNASSIGNED_CLASS_TYPE_ID,
  UNASSIGNED_CLASS_TYPE_LABEL,
  UNKNOWN_PACKAGE_ID,
  UNKNOWN_PACKAGE_LABEL,
} from './studio-analytics.helpers';
import type {
  StudioAnalyticsLabelRow,
  StudioAnalyticsPackagePlanRow,
  StudioAnalyticsPaymentRow,
  StudioAnalyticsPayload,
} from './studio-analytics.types';

export type ClassTypeRevenueBucket = {
  id: string;
  label: string;
  amountCents: number;
  bookings: number;
};

export function rankPackageSales(
  payments: StudioAnalyticsPaymentRow[],
  packagePlans: StudioAnalyticsPackagePlanRow[],
): StudioAnalyticsPayload['revenue']['byPackage'] {
  const plans = new Map(packagePlans.map((plan) => [plan.userPackageId, plan]));
  const buckets = new Map<
    string,
    { id: string; label: string; count: number; amountCents: number }
  >();
  for (const payment of payments) {
    if (!isSucceededPackage(payment)) {
      continue;
    }
    addPackageSaleBucket(buckets, payment, plans.get(payment.sourceId ?? ''));
  }
  return sortAndCap(
    [...buckets.values()],
    (left, right) =>
      right.amountCents - left.amountCents || right.count - left.count,
  );
}

export function rankTopClients(
  payments: StudioAnalyticsPaymentRow[],
): StudioAnalyticsPayload['revenue']['topClients'] {
  const buckets = new Map<
    string,
    { id: string; label: string; amountCents: number; paymentsCount: number }
  >();
  for (const payment of payments) {
    if (
      payment.status !== PaymentStatus.SUCCEEDED ||
      payment.userRole !== Role.USER ||
      isInfluencerPaymentMethod(payment.paymentMethod)
    ) {
      continue;
    }
    addClientSpendBucket(buckets, payment);
  }
  return sortAndCap(
    [...buckets.values()],
    (left, right) =>
      right.amountCents - left.amountCents ||
      right.paymentsCount - left.paymentsCount,
  );
}

export function applyPackageSalesToClassTypes(
  buckets: Map<string, ClassTypeRevenueBucket>,
  payments: StudioAnalyticsPaymentRow[],
  packagePlans: StudioAnalyticsPackagePlanRow[],
  labels: StudioAnalyticsLabelRow[],
  classTypeId?: string,
): void {
  const plans = new Map(packagePlans.map((plan) => [plan.userPackageId, plan]));
  for (const payment of payments) {
    if (!isSucceededPackage(payment)) {
      continue;
    }
    const plan = plans.get(payment.sourceId ?? '');
    for (const share of splitPackageAmount(payment.amountCents, plan, labels)) {
      if (classTypeId && share.id !== classTypeId) {
        continue;
      }
      addClassTypeCash(buckets, share.id, share.amountCents, labels);
    }
  }
}

export function splitAmountByWeights(
  amountCents: number,
  shares: Array<{ id: string; weight: number }>,
): Array<{ id: string; amountCents: number }> {
  const totalWeight = shares.reduce((sum, share) => sum + share.weight, 0);
  if (shares.length === 0 || totalWeight <= 0) {
    return [];
  }
  let remaining = amountCents;
  return shares.map((share, index) => {
    if (index === shares.length - 1) {
      return { id: share.id, amountCents: remaining };
    }
    const part = Math.round((amountCents * share.weight) / totalWeight);
    remaining -= part;
    return { id: share.id, amountCents: part };
  });
}

export function matchClassTypeByName(
  value: string,
  labels: StudioAnalyticsLabelRow[],
): StudioAnalyticsLabelRow | undefined {
  const needle = normalizeLabel(value);
  if (needle.length === 0) {
    return undefined;
  }
  const exact = labels.find((row) => normalizeLabel(row.label) === needle);
  if (exact) {
    return exact;
  }
  return [...labels]
    .filter((row) => isLooseClassTypeNameMatch(needle, row.label))
    .sort(
      (left, right) =>
        normalizeLabel(right.label).length - normalizeLabel(left.label).length,
    )[0];
}

function isSucceededPackage(payment: StudioAnalyticsPaymentRow): boolean {
  return (
    payment.status === PaymentStatus.SUCCEEDED &&
    payment.source === PaymentSource.PACKAGE &&
    !isInfluencerPaymentMethod(payment.paymentMethod)
  );
}

function addPackageSaleBucket(
  buckets: Map<
    string,
    { id: string; label: string; count: number; amountCents: number }
  >,
  payment: StudioAnalyticsPaymentRow,
  plan: StudioAnalyticsPackagePlanRow | undefined,
): void {
  const id =
    plan?.planId ?? plan?.planName ?? payment.sourceId ?? UNKNOWN_PACKAGE_ID;
  const label =
    plan?.planName && plan.planName.trim().length > 0
      ? plan.planName
      : UNKNOWN_PACKAGE_LABEL;
  const entry = buckets.get(id) ?? { id, label, count: 0, amountCents: 0 };
  entry.count += 1;
  entry.amountCents += payment.amountCents;
  buckets.set(id, entry);
}

function addClientSpendBucket(
  buckets: Map<
    string,
    { id: string; label: string; amountCents: number; paymentsCount: number }
  >,
  payment: StudioAnalyticsPaymentRow,
): void {
  const entry = buckets.get(payment.userId) ?? {
    id: payment.userId,
    label: payment.userLabel,
    amountCents: 0,
    paymentsCount: 0,
  };
  entry.amountCents += payment.amountCents;
  entry.paymentsCount += 1;
  buckets.set(payment.userId, entry);
}

function splitPackageAmount(
  amountCents: number,
  plan: StudioAnalyticsPackagePlanRow | undefined,
  labels: StudioAnalyticsLabelRow[],
): Array<{ id: string; amountCents: number }> {
  const shares = resolvePackageClassTypeShares(plan, labels);
  if (shares.length === 0) {
    return [{ id: UNASSIGNED_CLASS_TYPE_ID, amountCents }];
  }
  return splitAmountByWeights(amountCents, shares);
}

function resolvePackageClassTypeShares(
  plan: StudioAnalyticsPackagePlanRow | undefined,
  labels: StudioAnalyticsLabelRow[],
): Array<{ id: string; weight: number }> {
  if (!plan) {
    return [];
  }
  const allocations = parseStoredTypeSessionAllocations(
    plan.typeSessionAllocations,
  );
  if (allocations.length > 0) {
    return allocations.map((allocation) => ({
      id: allocation.classTypeId,
      weight: allocation.sessionCount,
    }));
  }
  if (plan.classTypeId) {
    return [{ id: plan.classTypeId, weight: 1 }];
  }
  const matched =
    matchClassTypeByName(plan.planName, labels) ??
    matchClassTypeByName(plan.categoryName, labels);
  return matched ? [{ id: matched.id, weight: 1 }] : [];
}

function addClassTypeCash(
  buckets: Map<string, ClassTypeRevenueBucket>,
  classTypeId: string,
  amountCents: number,
  labels: StudioAnalyticsLabelRow[],
): void {
  const entry = buckets.get(classTypeId) ?? {
    id: classTypeId,
    label:
      classTypeId === UNASSIGNED_CLASS_TYPE_ID
        ? UNASSIGNED_CLASS_TYPE_LABEL
        : (labels.find((row) => row.id === classTypeId)?.label ?? classTypeId),
    amountCents: 0,
    bookings: 0,
  };
  entry.amountCents += amountCents;
  buckets.set(classTypeId, entry);
}

function isLooseClassTypeNameMatch(needle: string, label: string): boolean {
  const name = normalizeLabel(label);
  return name.length >= 4 && (needle.includes(name) || name.includes(needle));
}

function normalizeLabel(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function sortAndCap<T>(rows: T[], compare: (left: T, right: T) => number): T[] {
  return [...rows].sort(compare).slice(0, STUDIO_ANALYTICS_RANK_LIMIT);
}
