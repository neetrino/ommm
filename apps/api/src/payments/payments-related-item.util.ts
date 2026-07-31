import type { PaymentListSource } from './payments.types';

const PACKAGE_DESCRIPTION_PREFIX = 'Package:';

export type AdminPaymentPackageLabels = {
  name: string;
  groupName: string | null;
};

/** Human-readable description stored on new package payments. */
export function buildPackagePaymentDescription(planName: string): string {
  const trimmed = planName.trim();
  return `${PACKAGE_DESCRIPTION_PREFIX} ${trimmed}`;
}

/** Parses a stored package payment description when it already contains the plan name. */
export function readPackageNameFromPaymentDescription(
  description: string | null,
): string | null {
  if (description === null) {
    return null;
  }
  const normalized = description.trim();
  if (
    !normalized
      .toLowerCase()
      .startsWith(PACKAGE_DESCRIPTION_PREFIX.toLowerCase())
  ) {
    return null;
  }
  const name = normalized.slice(PACKAGE_DESCRIPTION_PREFIX.length).trim();
  return name.length > 0 ? name : null;
}

type ResolveAdminPaymentRelatedItemArgs = {
  source: PaymentListSource;
  description: string | null;
  sourceId: string | null;
  packageLabelsByUserPackageId: ReadonlyMap<string, AdminPaymentPackageLabels>;
};

/** Resolves the purchased package (tier) name for admin finance payment views. */
export function resolveAdminPaymentRelatedItemName({
  source,
  description,
  sourceId,
  packageLabelsByUserPackageId,
}: ResolveAdminPaymentRelatedItemArgs): string | null {
  if (source === 'package') {
    if (sourceId !== null) {
      const fromUserPackage = packageLabelsByUserPackageId.get(sourceId);
      if (fromUserPackage !== undefined && fromUserPackage.name.length > 0) {
        return fromUserPackage.name;
      }
    }
    return readPackageNameFromPaymentDescription(description);
  }

  if (source === 'gift') {
    return description?.trim() || null;
  }

  if (source === 'dropin') {
    return description?.trim() || null;
  }

  return description?.trim() || null;
}

/** Resolves the package group (category) name for package payments. */
export function resolveAdminPaymentRelatedItemGroupName({
  source,
  sourceId,
  packageLabelsByUserPackageId,
}: ResolveAdminPaymentRelatedItemArgs): string | null {
  if (source !== 'package' || sourceId === null) {
    return null;
  }
  const fromUserPackage = packageLabelsByUserPackageId.get(sourceId);
  const groupName = fromUserPackage?.groupName?.trim() ?? '';
  return groupName.length > 0 ? groupName : null;
}
