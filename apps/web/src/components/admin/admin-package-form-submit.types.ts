import type { MutableRefObject } from "react";
import type {
  AdminPackageFormCategoryOption,
  AdminPackageFormMode,
} from "@/components/admin/admin-package-form.types";
import type { AdminPackageFormValues } from "@/components/admin/admin-package-form-utils";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import type { PackageTypeSessionFormEntry } from "@/components/admin/admin-package-type-sessions.util";
import type { TierFieldErrors } from "@/components/admin/admin-package-tier-field-errors";

export type AdminPackageFormMergedCategoryOption = {
  id: string;
  label: string;
};

export type PackageTranslateFn = (
  key: string,
  values?: Record<string, string | number | Date>,
) => string;

export type AdminPackageFormSubmitParams = {
  mode: AdminPackageFormMode;
  packageId?: string;
  initialCategoryName: string;
  initialPackage?: AdminPackageRow;
  nextDisplayOrder?: number;
  values: AdminPackageFormValues;
  typeSessionEntries: PackageTypeSessionFormEntry[];
  categoryOptions: readonly AdminPackageFormCategoryOption[];
  mergedCategoryOptions: readonly AdminPackageFormMergedCategoryOption[];
  categoryNameCandidates: readonly string[];
  classTypeNameById: ReadonlyMap<string, string>;
  t: PackageTranslateFn;
  onSaved: (saved: AdminPackageRow) => void;
  setError: (error: string | null) => void;
  setTierFieldErrors: (errors: TierFieldErrors) => void;
  setPending: (pending: boolean) => void;
  submitLockRef: MutableRefObject<boolean>;
  pending: boolean;
  /** Used to scroll/focus the first invalid tier field after client validation. */
  form?: HTMLFormElement;
};

export type AdminPackageFormSubmitPrepared = {
  mode: AdminPackageFormMode;
  packageId?: string;
  initialPackage?: AdminPackageRow;
  nextDisplayOrder?: number;
  values: AdminPackageFormValues;
  isCreateMode: boolean;
  isPricingMode: boolean;
  isAddTierMode: boolean;
  isEditTierMode: boolean;
  isEditMode: boolean;
  description: string;
  createCategoryName: string;
  tierCategorySlug: string;
  tierCategoryName: string;
  categoryName: string;
  priceCents: number;
  discountedPriceCents: number | null;
  periodDays: number | null;
  guestCount: number | null;
  freezeAllowedCount: number | null;
  freezeMaxDaysPerUse: number | null;
  stockCount: number | null;
  tierClassTypeId: string;
  payloadName: string;
  slug: string;
  isTierPackage: boolean;
  resolvedSessionsPerMonth: number;
  typeSessionAllocations?: Array<{ classTypeId: string; sessionCount: number }>;
  pricePerSessionCents: number | null;
};
