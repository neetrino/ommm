import {
  createEmptyPackageFormValues,
  createEmptyTierFormValues,
  packageRowToFormValues,
  packageRowToTierFormValues,
  type AdminPackageFormValues,
} from "@/components/admin/admin-package-form-utils";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import type {
  AdminPackageFormMode,
} from "@/components/admin/admin-package-form.types";

const FALLBACK_PACKAGE_SLUG_PREFIX = "package";

export function resolveAdminPackageFormKey(
  mode: AdminPackageFormMode,
  packageId: string | undefined,
  initialCategoryName: string,
): string {
  if (mode === "create") {
    return "create";
  }
  if (mode === "add-tier") {
    return `add-tier-${initialCategoryName}-${packageId ?? "new"}`;
  }
  if (mode === "edit-tier") {
    return `edit-tier-${packageId ?? "unknown"}`;
  }
  if (packageId !== undefined) {
    return `${mode}-${packageId}`;
  }
  return mode;
}

export function buildPackageSlug(name: string): string {
  const normalized = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  if (normalized.length > 0) {
    return normalized;
  }
  const fallbackSuffix =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().slice(0, 8)
      : `${Date.now()}`;
  return `${FALLBACK_PACKAGE_SLUG_PREFIX}-${fallbackSuffix}`;
}

export function buildInitialPackageFormValues(
  mode: AdminPackageFormMode,
  initialCategoryName: string,
  initialPackage?: AdminPackageRow,
): AdminPackageFormValues {
  if (mode === "edit-tier" && initialPackage !== undefined) {
    return packageRowToTierFormValues(initialPackage, initialCategoryName);
  }
  if (mode === "add-tier") {
    return createEmptyTierFormValues(initialCategoryName);
  }
  if (
    (mode === "edit" || mode === "pricing") &&
    initialPackage !== undefined
  ) {
    return packageRowToFormValues(initialPackage, initialCategoryName);
  }
  return createEmptyPackageFormValues(initialCategoryName);
}

export { FALLBACK_PACKAGE_SLUG_PREFIX };
