import { prepareAdminPackageFormSubmit } from "@/components/admin/admin-package-form-submit.prepare";
import {
  buildAdminPackageFormSubmitPayload,
  resolveAdminPackageFormShouldPatch,
} from "@/components/admin/admin-package-form-submit.payload";
import type { AdminPackageFormSubmitParams } from "@/components/admin/admin-package-form-submit.types";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import { focusFormField } from "@/components/ui/form-validation";
import { ApiError, apiFetch } from "@/lib/api";
import { revalidatePublicPackages } from "@/lib/revalidate-public-packages";

export type { AdminPackageFormSubmitParams } from "@/components/admin/admin-package-form-submit.types";

export async function submitAdminPackageForm(
  params: AdminPackageFormSubmitParams,
): Promise<void> {
  const {
    form,
    pending,
    submitLockRef,
    setError,
    setTierFieldErrors,
    setPending,
    onSaved,
    t,
    packageId,
  } = params;

  if (pending || submitLockRef.current) {
    return;
  }

  setError(null);
  setTierFieldErrors({});

  const preparedResult = prepareAdminPackageFormSubmit(params);
  if (!preparedResult.ok) {
    setError(preparedResult.error);
    if (form !== undefined && preparedResult.focusField !== undefined) {
      focusFormField(form, preparedResult.focusField);
    }
    return;
  }

  const prepared = preparedResult.prepared;
  const payload = buildAdminPackageFormSubmitPayload(prepared);
  const shouldPatch = resolveAdminPackageFormShouldPatch(prepared);

  submitLockRef.current = true;
  setPending(true);
  try {
    const saved = shouldPatch
      ? await apiFetch<AdminPackageRow>(`/packages/plans/${packageId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        })
      : await apiFetch<AdminPackageRow>("/packages/plans", {
          method: "POST",
          body: JSON.stringify(payload),
        });
    onSaved(saved);
    await revalidatePublicPackages();
  } catch (err) {
    if (err instanceof ApiError) {
      setError(err.message);
    } else if (err instanceof Error && err.message.trim().length > 0) {
      setError(err.message);
    } else {
      setError(t("genericError"));
    }
  } finally {
    setPending(false);
    submitLockRef.current = false;
  }
}
