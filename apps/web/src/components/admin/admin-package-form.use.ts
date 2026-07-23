"use client";

import { useMemo, useRef, useState } from "react";
import {
  buildInitialPackageFormValues,
  resolveAdminPackageFormKey,
} from "@/components/admin/admin-package-form.helpers";
import type { AdminPackageFormProps } from "@/components/admin/admin-package-form.types";
import {
  resolveTierPricePerSessionField,
  type AdminPackageFormValues,
} from "@/components/admin/admin-package-form-utils";
import {
  type TierFieldErrors,
  initialTypeSessionEntries,
  sumTypeSessionEntries,
  type PackageTypeSessionFormEntry,
} from "@/components/admin/admin-package-type-sessions.util";
import { categoryPackagesToOptions } from "@/components/admin/package-category-utils";

export function useAdminPackageForm({
  mode,
  packageId,
  initialCategoryName,
  categoryOptions,
  classTypeOptions,
  initialPackage,
}: Pick<
  AdminPackageFormProps,
  | "mode"
  | "packageId"
  | "initialCategoryName"
  | "categoryOptions"
  | "classTypeOptions"
  | "initialPackage"
>) {
  const formKey = resolveAdminPackageFormKey(mode, packageId, initialCategoryName);
  const [values, setValues] = useState<AdminPackageFormValues>(() =>
    buildInitialPackageFormValues(mode, initialCategoryName, initialPackage),
  );
  const [typeSessionEntries, setTypeSessionEntries] = useState<PackageTypeSessionFormEntry[]>(() =>
    mode === "add-tier" || mode === "edit-tier"
      ? initialTypeSessionEntries(mode === "edit-tier" ? initialPackage : undefined)
      : [],
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tierFieldErrors, setTierFieldErrors] = useState<TierFieldErrors>({});
  const submitLockRef = useRef(false);

  const mergedCategoryOptions = useMemo(
    () =>
      categoryPackagesToOptions(
        categoryOptions.map((option) => ({
          categoryName: option.label,
          categorySlug: option.id,
          slug: option.id,
        })),
      ),
    [categoryOptions],
  );

  const categoryNameCandidates = useMemo(
    () => mergedCategoryOptions.map((option) => option.label),
    [mergedCategoryOptions],
  );
  const classTypeNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const classType of classTypeOptions) {
      map.set(classType.id, classType.name.trim());
    }
    return map;
  }, [classTypeOptions]);

  function clearTierValidationState(): void {
    setTierFieldErrors({});
    setError(null);
  }

  function updateValues(patch: Partial<AdminPackageFormValues>) {
    if (mode === "add-tier" || mode === "edit-tier") {
      clearTierValidationState();
    }
    setValues((current) => ({ ...current, ...patch }));
  }

  function updateTierPricingValues(patch: Partial<AdminPackageFormValues>) {
    if (mode === "add-tier" || mode === "edit-tier") {
      clearTierValidationState();
    }
    setValues((current) => {
      const next = { ...current, ...patch };
      if ("price" in patch || "discountedPrice" in patch) {
        const sessionsCount = String(sumTypeSessionEntries(typeSessionEntries));
        const derived = resolveTierPricePerSessionField(
          next.price,
          sessionsCount,
          next.discountedPrice,
        );
        next.pricePerSession =
          derived.length > 0 ? derived : next.pricePerSession;
      }
      return next;
    });
  }

  function handleTypeSessionEntriesChange(entries: PackageTypeSessionFormEntry[]): void {
    if (mode === "add-tier" || mode === "edit-tier") {
      clearTierValidationState();
    }
    setTypeSessionEntries(entries);
  }

  return {
    formKey,
    values,
    typeSessionEntries,
    pending,
    setPending,
    error,
    setError,
    tierFieldErrors,
    setTierFieldErrors,
    submitLockRef,
    mergedCategoryOptions,
    categoryNameCandidates,
    classTypeNameById,
    updateValues,
    updateTierPricingValues,
    handleTypeSessionEntriesChange,
  };
}
