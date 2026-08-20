"use client";

import { useEffect, useImperativeHandle, useState, type Ref } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  isValidEmail,
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
} from "@/components/admin/admin-coach-form-helpers";
import type { AdminManagerDirectoryRow } from "@/components/admin/admin-managers-types";
import { FormErrorBanner } from "@/components/ui/form-validation";
import { PhoneInputField } from "@/components/ui/phone-input-field";
import { ApiError, apiFetch } from "@/lib/api";
import { isValidPhone, normalizePhoneForApi } from "@/lib/phone";

export type AdminManagerEditFormHandle = {
  save: () => Promise<void>;
  reset: () => void;
};

type ManagerDraft = {
  name: string;
  lastName: string;
  email: string;
  phone: string;
};

type AdminManagerEditFormProps = {
  manager: AdminManagerDirectoryRow;
  formRef: Ref<AdminManagerEditFormHandle>;
  onSaved: (patch: AdminManagerDirectoryRow) => void;
  onBusyChange: (busy: boolean) => void;
  onDirtyChange: (dirty: boolean) => void;
};

function draftFromManager(manager: AdminManagerDirectoryRow): ManagerDraft {
  return {
    name: manager.name ?? "",
    lastName: manager.lastName ?? "",
    email: manager.email,
    phone: manager.phone ?? "",
  };
}

function managerSourceKey(manager: AdminManagerDirectoryRow): string {
  return `${manager.id}:${manager.updatedAt}`;
}

export function AdminManagerEditForm({
  manager,
  formRef,
  onSaved,
  onBusyChange,
  onDirtyChange,
}: AdminManagerEditFormProps) {
  const t = useTranslations("adminPages.managers");
  const tCreate = useTranslations("adminPages.managers.create");
  const router = useRouter();
  const [draft, setDraft] = useState(() => draftFromManager(manager));
  const [sourceKey, setSourceKey] = useState(() => managerSourceKey(manager));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const nextSourceKey = managerSourceKey(manager);
  if (nextSourceKey !== sourceKey) {
    setSourceKey(nextSourceKey);
    setDraft(draftFromManager(manager));
    setError(null);
  }

  const dirty =
    draft.name.trim() !== (manager.name ?? "") ||
    draft.lastName.trim() !== (manager.lastName ?? "") ||
    draft.email.trim().toLowerCase() !== manager.email ||
    draft.phone.trim() !== (manager.phone ?? "");

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  useEffect(() => {
    onBusyChange(busy);
  }, [busy, onBusyChange]);

  useImperativeHandle(
    formRef,
    () => ({
      save: () =>
        persistManagerEdit({
          busy,
          draft,
          managerId: manager.id,
          tCreate,
          fallbackError: t("genericError"),
          setBusy,
          setError,
          onSaved,
          refresh: () => router.refresh(),
        }),
      reset: () => {
        setDraft(draftFromManager(manager));
        setError(null);
      },
    }),
    [busy, draft, manager, onSaved, router, t, tCreate],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <label className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">{tCreate("nameLabel")}</span>
        <input
          className="ommm-input"
          value={draft.name}
          maxLength={MAX_NAME_LENGTH}
          disabled={busy}
          onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">{tCreate("lastNameLabel")}</span>
        <input
          className="ommm-input"
          value={draft.lastName}
          maxLength={MAX_NAME_LENGTH}
          disabled={busy}
          onChange={(event) =>
            setDraft((current) => ({ ...current, lastName: event.target.value }))
          }
        />
      </label>
      <label className="flex flex-col gap-1 lg:col-span-2">
        <span className="ommm-label text-xs uppercase tracking-wide">{tCreate("emailLabel")}</span>
        <input
          className="ommm-input"
          type="email"
          value={draft.email}
          maxLength={MAX_EMAIL_LENGTH}
          disabled={busy}
          onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
        />
      </label>
      <label className="flex flex-col gap-1 lg:col-span-2">
        <span className="ommm-label text-xs uppercase tracking-wide">{tCreate("phoneLabel")}</span>
        <PhoneInputField
          className="ommm-input"
          value={draft.phone}
          onValueChange={(value) => setDraft((current) => ({ ...current, phone: value }))}
          disabled={busy}
        />
      </label>
      {error !== null ? (
        <div className="lg:col-span-2">
          <FormErrorBanner message={error} />
        </div>
      ) : null}
    </div>
  );
}

async function persistManagerEdit(params: {
  busy: boolean;
  draft: ManagerDraft;
  managerId: string;
  tCreate: (key: string) => string;
  fallbackError: string;
  setBusy: (value: boolean) => void;
  setError: (value: string | null) => void;
  onSaved: (patch: AdminManagerDirectoryRow) => void;
  refresh: () => void;
}): Promise<void> {
  if (params.busy) {
    return;
  }
  const nextName = params.draft.name.trim();
  const nextLastName = params.draft.lastName.trim();
  const nextEmail = params.draft.email.trim().toLowerCase();
  const nextPhone = params.draft.phone.trim();
  const validationError = validateManagerEdit({
    nextName,
    nextLastName,
    nextEmail,
    nextPhone,
    tCreate: params.tCreate,
  });
  if (validationError !== null) {
    params.setError(validationError);
    return;
  }
  params.setBusy(true);
  params.setError(null);
  try {
    const updated = await apiFetch<AdminManagerDirectoryRow>(
      `/managers/${params.managerId}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          name: nextName,
          lastName: nextLastName,
          email: nextEmail,
          phone: normalizePhoneForApi(nextPhone),
        }),
      },
    );
    params.onSaved(updated);
    params.refresh();
  } catch (err) {
    params.setError(err instanceof ApiError ? err.message : params.fallbackError);
  } finally {
    params.setBusy(false);
  }
}

function validateManagerEdit(params: {
  nextName: string;
  nextLastName: string;
  nextEmail: string;
  nextPhone: string;
  tCreate: (key: string) => string;
}): string | null {
  if (params.nextName.length === 0) {
    return params.tCreate("nameRequired");
  }
  if (params.nextLastName.length === 0) {
    return params.tCreate("lastNameRequired");
  }
  if (!isValidEmail(params.nextEmail)) {
    return params.tCreate("emailInvalid");
  }
  if (params.nextPhone.length === 0 || !isValidPhone(params.nextPhone)) {
    return params.tCreate("phoneInvalid");
  }
  return null;
}
