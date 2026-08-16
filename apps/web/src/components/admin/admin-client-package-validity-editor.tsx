"use client";

import { useId, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import type { ClientSheetPackageItem } from "@/components/admin/admin-clients-types";
import {
  AdminSheetEditableField,
  ADMIN_SHEET_FORM_SECTION_CLASS,
} from "@/components/admin/admin-sheet-editable-field";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";

type AdminClientPackageValidityEditorProps = {
  item: ClientSheetPackageItem;
  onCancel: () => void;
  onSuccess: () => void;
};

type ValidityUpdateResponse = {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
};

/** Extracts `YYYY-MM-DD` for HTML date inputs from an ISO timestamp. */
function toDateInputValue(isoValue: string): string {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(isoValue.trim());
  return match?.[1] ?? "";
}

export function AdminClientPackageValidityEditor({
  item,
  onCancel,
  onSuccess,
}: AdminClientPackageValidityEditorProps) {
  const t = useTranslations("adminPages.clients");
  const formId = useId();
  const [expirationDate, setExpirationDate] = useState(() =>
    toDateInputValue(item.expirationDate),
  );
  const [activationDate, setActivationDate] = useState(() =>
    toDateInputValue(item.activationDate),
  );
  const [expirationError, setExpirationError] = useState<string | undefined>();
  const [activationError, setActivationError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "ok" | "err" } | null>(
    null,
  );

  function validate(): boolean {
    const end = expirationDate.trim();
    const start = activationDate.trim();
    let valid = true;

    if (end.length === 0) {
      setExpirationError(t("packages.expirationRequired"));
      valid = false;
    } else {
      setExpirationError(undefined);
    }

    if (start.length > 0 && end.length > 0 && end <= start) {
      setActivationError(t("packages.expirationMustFollowActivation"));
      valid = false;
    } else {
      setActivationError(undefined);
    }

    return valid;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (submitting || !validate()) {
      return;
    }

    setSubmitting(true);
    setToast(null);

    const body: { currentPeriodEnd: string; currentPeriodStart?: string } = {
      currentPeriodEnd: `${expirationDate.trim()}T23:59:59.999Z`,
    };
    const start = activationDate.trim();
    if (start.length > 0) {
      body.currentPeriodStart = `${start}T00:00:00.000Z`;
    }

    try {
      await apiFetch<ValidityUpdateResponse>(
        `/packages/admin/user-packages/${item.id}/validity`,
        {
          method: "PATCH",
          body: JSON.stringify(body),
        },
      );
      onSuccess();
    } catch (err) {
      setToast({
        message:
          err instanceof ApiError ? err.message : t("packages.validityUpdateError"),
        tone: "err",
      });
      setSubmitting(false);
    }
  }

  return (
    <>
      {toast ? (
        <AdminCenterToast
          message={toast.message}
          tone={toast.tone}
          onDismiss={() => setToast(null)}
        />
      ) : null}

      <form
        id={formId}
        className={`${ADMIN_SHEET_FORM_SECTION_CLASS} space-y-4`}
        onSubmit={(event) => void handleSubmit(event)}
      >
        <div className="flex items-start gap-2 sm:gap-3">
          <AdminSheetEditableField
            className="min-w-0 flex-1"
            label={t("packages.activationDate")}
            error={activationError}
            hint={t("packages.activationDateOptionalHint")}
          >
            <DatePickerInput
              name="activationDate"
              value={activationDate}
              disabled={submitting}
              allowManualEntry
              placeholder="DD/MM/YYYY"
              onChange={(nextValue) => {
                setActivationDate(nextValue);
                setActivationError(undefined);
              }}
            />
          </AdminSheetEditableField>
          <span
            className="mt-7 shrink-0 select-none px-0.5 font-serif text-lg leading-none text-sand-400"
            aria-hidden="true"
          >
            –
          </span>
          <AdminSheetEditableField
            className="min-w-0 flex-1"
            label={t("packages.expirationDate")}
            required
            error={expirationError}
          >
            <DatePickerInput
              name="expirationDate"
              value={expirationDate}
              required
              disabled={submitting}
              allowManualEntry
              placeholder="DD/MM/YYYY"
              onChange={(nextValue) => {
                setExpirationDate(nextValue);
                setExpirationError(undefined);
              }}
            />
          </AdminSheetEditableField>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <OmmButton
            type="button"
            variant="secondary"
            disabled={submitting}
            onClick={() => {
              if (!submitting) {
                onCancel();
              }
            }}
          >
            {t("cancelButton")}
          </OmmButton>
          <OmmButton type="submit" variant="primary" disabled={submitting}>
            {submitting ? t("packages.savingValidity") : t("packages.saveValidity")}
          </OmmButton>
        </div>
      </form>
    </>
  );
}
