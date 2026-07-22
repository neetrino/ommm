"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { AdminScheduleFormFields } from "@/components/admin/admin-schedule-form-fields";
import {
  adminScheduleFormInitialState,
  adminSchedulePayloadFromState,
  buildSlugFromScheduleTypeName,
  toScheduleDayOptions,
  toScheduleFilterOptions,
} from "@/components/admin/admin-schedule-form.helpers";
import {
  ADMIN_SCHEDULE_FORM_MAX_CLASS_TYPE_LENGTH,
  ADMIN_SCHEDULE_FORM_MAX_TYPE_SLUG_LENGTH,
  type AdminScheduleClassTypeCreateResponse,
  type AdminScheduleFormProps,
  type AdminScheduleFormState,
  type AdminScheduleMutationPayload,
} from "@/components/admin/admin-schedule-form.types";
import type { AdminScheduleItem } from "@/components/admin/admin-schedule-types";
import { SCHEDULE_DAY_OPTIONS } from "@/components/admin/admin-schedule-helpers";
import { ApiError, apiFetch } from "@/lib/api";
import { FormErrorBanner } from "@/components/ui/form-validation";
import { OmmButton } from "@/components/ui/omm-button";

export type { AdminScheduleFormProps } from "@/components/admin/admin-schedule-form.types";

export function AdminScheduleForm({
  mode,
  classTypeOptions,
  item,
  onSaved,
  onCancel,
}: AdminScheduleFormProps) {
  const t = useTranslations("adminPages.schedule");
  const [form, setForm] = useState<AdminScheduleFormState>(() => adminScheduleFormInitialState(item));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typePending, setTypePending] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeError, setNewTypeError] = useState<string | null>(null);
  const [typeOptions, setTypeOptions] = useState<string[]>(() => [...classTypeOptions]);
  const submitLockRef = useRef(false);
  const mappedDayOptions = toScheduleDayOptions(SCHEDULE_DAY_OPTIONS, t);
  const mappedTypeOptions = toScheduleFilterOptions(typeOptions);

  async function onAddType() {
    if (typePending || pending) {
      return;
    }
    const normalized = newTypeName.trim();
    setNewTypeError(null);

    if (normalized.length === 0) {
      setNewTypeError(t("form.errors.classTypeRequired"));
      return;
    }
    if (normalized.length > ADMIN_SCHEDULE_FORM_MAX_CLASS_TYPE_LENGTH) {
      setNewTypeError(t("form.errors.classTypeTooLong"));
      return;
    }
    const alreadyExists = typeOptions.some(
      (option) => option.toLowerCase() === normalized.toLowerCase(),
    );
    if (alreadyExists) {
      setForm((prev) => ({ ...prev, classType: normalized }));
      setNewTypeName("");
      return;
    }

    const slug = buildSlugFromScheduleTypeName(normalized, ADMIN_SCHEDULE_FORM_MAX_TYPE_SLUG_LENGTH);
    if (slug.length === 0) {
      setNewTypeError(t("form.errors.classTypeRequired"));
      return;
    }

    setTypePending(true);
    try {
      const created = await apiFetch<AdminScheduleClassTypeCreateResponse>("/classes/types", {
        method: "POST",
        body: JSON.stringify({
          name: normalized,
          slug,
        }),
      });
      setTypeOptions((prev) => [...prev, created.name].sort((a, b) => a.localeCompare(b)));
      setForm((prev) => ({ ...prev, classType: created.name }));
      setNewTypeName("");
      setNewTypeError(null);
    } catch (requestError) {
      setNewTypeError(
        requestError instanceof ApiError
          ? requestError.message
          : t("messages.genericError"),
      );
    } finally {
      setTypePending(false);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || submitLockRef.current) {
      return;
    }
    setError(null);

    let payload: AdminScheduleMutationPayload;
    try {
      payload = adminSchedulePayloadFromState(form, t);
    } catch (validationError) {
      setError(
        validationError instanceof Error
          ? validationError.message
          : t("messages.genericError"),
      );
      return;
    }

    submitLockRef.current = true;
    setPending(true);
    try {
      if (mode === "create") {
        await apiFetch<AdminScheduleItem>("/schedule/admin", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch<AdminScheduleItem>(`/schedule/admin/${item?.id ?? ""}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      }
      onSaved();
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : t("messages.genericError"),
      );
    } finally {
      submitLockRef.current = false;
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      className="mt-5 flex flex-col gap-4"
    >
      <AdminScheduleFormFields
        form={form}
        setForm={setForm}
        pending={pending}
        typePending={typePending}
        newTypeName={newTypeName}
        setNewTypeName={setNewTypeName}
        newTypeError={newTypeError}
        onAddType={() => {
          void onAddType();
        }}
        mappedDayOptions={mappedDayOptions}
        mappedTypeOptions={mappedTypeOptions}
        t={t}
      />

      {error !== null ? <FormErrorBanner message={error} variant="inline" /> : null}

      <div className="flex flex-wrap justify-end gap-3 pt-2">
        <OmmButton
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCancel}
          disabled={pending}
        >
          {t("cancelButton")}
        </OmmButton>
        <OmmButton type="submit" variant="primary" size="sm" disabled={pending}>
          {pending
            ? mode === "create"
              ? t("savingCreate")
              : t("savingEdit")
            : mode === "create"
              ? t("submitCreate")
              : t("submitEdit")}
        </OmmButton>
      </div>
    </form>
  );
}
