import type { PaymentListSource } from './payments.types';

const PACKAGE_DESCRIPTION_PREFIX = 'Package:';

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
  if (!normalized.toLowerCase().startsWith(PACKAGE_DESCRIPTION_PREFIX.toLowerCase())) {
    return null;
  }
  const name = normalized.slice(PACKAGE_DESCRIPTION_PREFIX.length).trim();
  return name.length > 0 ? name : null;
}

type ResolveAdminPaymentRelatedItemNameArgs = {
  source: PaymentListSource;
  description: string | null;
  sourceId: string | null;
  packageNameByUserPackageId: ReadonlyMap<string, string>;
};

/** Resolves the purchased item label shown in admin finance payment views. */
export function resolveAdminPaymentRelatedItemName({
  source,
  description,
  sourceId,
  packageNameByUserPackageId,
}: ResolveAdminPaymentRelatedItemNameArgs): string | null {
  if (source === 'package') {
    if (sourceId !== null) {
      const fromUserPackage = packageNameByUserPackageId.get(sourceId);
      if (fromUserPackage !== undefined && fromUserPackage.length > 0) {
        return fromUserPackage;
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
