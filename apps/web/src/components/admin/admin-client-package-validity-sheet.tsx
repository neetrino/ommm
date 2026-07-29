"use client";

import { useId, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import type { ClientSheetPackageItem } from "@/components/admin/admin-clients-types";
import {
  ADMIN_DETAILS_SHEET_FOOTER_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_ELEVATED_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
  ADMIN_NESTED_DETAILS_SHEET_BODY_CLASS,
  ADMIN_NESTED_WIDE_DRAWER_PANEL_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { formatPackagePlanName } from "@/components/admin/admin-packages-display";
import {
  AdminSheetEditableField,
  ADMIN_SHEET_FORM_SECTION_CLASS,
} from "@/components/admin/admin-sheet-editable-field";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmDrawerPortal, OMM_DRAWER_NESTED_BACKDROP_CLASS } from "@/components/ui/omm-modal";
import { ApiError, apiFetch } from "@/lib/api";

type AdminClientPackageValiditySheetProps = {
  item: ClientSheetPackageItem;
  onClose: () => void;
  onSuccess: () => void;
};

type ValidityUpdateResponse = {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
};

const DATE_INPUT_CLASS = "ommm-input";

/** Extracts `YYYY-MM-DD` for HTML date inputs from an ISO timestamp. */
function toDateInputValue(isoValue: string): string {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(isoValue.trim());
  return match?.[1] ?? "";
}

export function AdminClientPackageValiditySheet({
  item,
  onClose,
  onSuccess,
}: AdminClientPackageValiditySheetProps) {
  const t = useTranslations("adminPages.clients");
  const titleId = useId();
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

  const packageLabel = formatPackagePlanName(item.packageName, item.totalSessions);

  function handleClose(): void {
    if (submitting) {
      return;
    }
    onClose();
  }

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
    <OmmDrawerPortal
      isOpen
      onClose={handleClose}
      closeDisabled={submitting}
      backdropAriaLabel={t("modalBackdropClose")}
      ariaLabelledBy={titleId}
      overlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_ELEVATED_CLASS}
      panelClassName={ADMIN_NESTED_WIDE_DRAWER_PANEL_CLASS}
      backdropClassName={OMM_DRAWER_NESTED_BACKDROP_CLASS}
      lockBodyScroll={false}
      useOverlayPortalRoot
    >
      <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h2 id={titleId} className={ADMIN_DETAILS_SHEET_TITLE_CLASS}>
              {t("packages.editValidityTitle")}
            </h2>
            <p className="truncate text-sm text-sage-600">{packageLabel}</p>
          </div>
          <button
            type="button"
            className={ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS}
            aria-label={t("modalCloseAria")}
            disabled={submitting}
            onClick={handleClose}
          >
            ×
          </button>
        </div>
      </header>

      <div className={`${ADMIN_NESTED_DETAILS_SHEET_BODY_CLASS} min-h-0 flex-1`}>
        {toast ? (
          <AdminCenterToast
            message={toast.message}
            tone={toast.tone}
            onDismiss={() => setToast(null)}
          />
        ) : null}

        <form id={formId} className="space-y-5" onSubmit={(event) => void handleSubmit(event)}>
          <p className="text-sm text-sage-600">{t("packages.editValidityLead")}</p>
          <div className={`${ADMIN_SHEET_FORM_SECTION_CLASS} space-y-4`}>
            <AdminSheetEditableField
              label={t("packages.expirationDate")}
              required
              error={expirationError}
            >
              <input
                type="date"
                name="expirationDate"
                required
                className={DATE_INPUT_CLASS}
                value={expirationDate}
                disabled={submitting}
                onChange={(event) => {
                  setExpirationDate(event.target.value);
                  setExpirationError(undefined);
                }}
              />
            </AdminSheetEditableField>
            <AdminSheetEditableField
              label={t("packages.activationDate")}
              error={activationError}
              hint={t("packages.activationDateOptionalHint")}
            >
              <input
                type="date"
                name="activationDate"
                className={DATE_INPUT_CLASS}
                value={activationDate}
                disabled={submitting}
                onChange={(event) => {
                  setActivationDate(event.target.value);
                  setActivationError(undefined);
                }}
              />
            </AdminSheetEditableField>
          </div>
        </form>
      </div>

      <footer
        className={`${ADMIN_DETAILS_SHEET_FOOTER_CLASS} flex flex-wrap items-center justify-end gap-2`}
      >
        <OmmButton
          type="button"
          variant="secondary"
          disabled={submitting}
          onClick={handleClose}
        >
          {t("cancelButton")}
        </OmmButton>
        <OmmButton
          type="submit"
          form={formId}
          variant="primary"
          disabled={submitting}
        >
          {submitting ? t("packages.savingValidity") : t("packages.saveValidity")}
        </OmmButton>
      </footer>
    </OmmDrawerPortal>
  );
}
