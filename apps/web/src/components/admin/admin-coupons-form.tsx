"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  ADMIN_BOOKINGS_DETAILS_SHEET_PANEL_CLASS,
  ADMIN_CREATE_FORM_ACTIONS_CLASS,
  ADMIN_CREATE_FORM_CLASS,
  ADMIN_CREATE_SHEET_BODY_SHELL_CLASS,
  ADMIN_CREATE_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_SHEET_PHONE_HIDE_CLOSE_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import {
  AudienceSection,
  CodeSection,
  DiscountSection,
  DatesSection,
  LimitsSection,
} from "@/components/admin/admin-coupon-form-sections";
import {
  couponDraftFromRow,
  couponPayloadFromDraft,
  type CouponDraft,
} from "@/components/admin/admin-coupon-form.util";
import type { AdminCouponRow } from "@/components/admin/admin-coupons-types";
import { AdminSheetPortal } from "@/components/admin/admin-sheet-portal";
import { useAdminAnimatedSheetClose } from "@/components/admin/use-admin-animated-sheet-close";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { ApiError, apiFetch } from "@/lib/api";

type AdminCouponsFormProps = {
  editing: AdminCouponRow | null;
  canDelete: boolean;
  onSaved: () => void;
  onCancel: () => void;
  onDelete: () => void;
};

export function AdminCouponsForm({ editing, canDelete, onSaved, onCancel, onDelete }: AdminCouponsFormProps) {
  const t = useTranslations("adminPages.coupons");
  const titleId = useId();
  const [draft, setDraft] = useState<CouponDraft>(() => couponDraftFromRow(editing));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { isOpen, requestClose, onAfterClose } = useAdminAnimatedSheetClose(onCancel);

  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await apiFetch(editing ? `/coupons/${editing.id}` : "/coupons", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(couponPayloadFromDraft(draft)),
      });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("loadFailed"));
    } finally {
      setBusy(false);
    }
  }

  function patch(next: Partial<CouponDraft>) {
    setDraft({ ...draft, ...next });
  }

  const code = editing?.code ?? draft.code;
  return (
    <>
    <AdminSheetPortal
      presentation="drawer"
      isOpen={isOpen}
      onClose={requestClose}
      onAfterClose={onAfterClose}
      backdropAriaLabel={t("close")}
      ariaLabelledBy={titleId}
      drawerOverlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
      drawerPanelClassName={ADMIN_BOOKINGS_DETAILS_SHEET_PANEL_CLASS}
      closeDisabled={busy}
    >
      <div className={ADMIN_CREATE_SHEET_HEADER_CLASS}>
        <div className="min-w-0">
          <h2 id={titleId} className="font-serif text-2xl font-normal leading-none text-sage-900">
            {editing ? t("edit") : t("newCoupon")}
          </h2>
        </div>
        <button
          type="button"
          className={`${ADMIN_SHEET_PHONE_HIDE_CLOSE_CLASS} shrink-0 rounded-full p-2 text-sage-500 hover:bg-white/70 hover:text-sage-900`}
          aria-label={t("close")}
          onClick={requestClose}
        >
          <CloseGlyph />
        </button>
      </div>
      <div className={ADMIN_CREATE_SHEET_BODY_SHELL_CLASS}>
        <form className={ADMIN_CREATE_FORM_CLASS} onSubmit={(event) => void save(event)}>
          <div className="flex flex-col gap-3 px-5 py-4 sm:px-6">
            <FormGroup>
              <CodeSection draft={draft} t={t} onChange={(code) => patch({ code })} />
              <DiscountSection draft={draft} t={t} onPatch={patch} />
            </FormGroup>
            <FormGroup>
              <DatesSection draft={draft} t={t} onPatch={patch} />
            </FormGroup>
            <FormGroup>
              <LimitsSection draft={draft} t={t} onPatch={patch} />
            </FormGroup>
            <FormGroup>
              <AudienceSection draft={draft} t={t} onPatch={patch} />
            </FormGroup>
            {error ? <p className="text-sm text-red-800" role="alert">{error}</p> : null}
            <div className={`${ADMIN_CREATE_FORM_ACTIONS_CLASS} justify-between`}>
              {canDelete && editing?.status === "DRAFT" && editing.usedCount === 0 ? (
                <OmmButton type="button" variant="danger" disabled={busy} onClick={() => setConfirmDelete(true)}>
                  {t("delete")}
                </OmmButton>
              ) : <span />}
              <div className="flex flex-wrap gap-2">
                <OmmButton type="button" variant="secondary" onClick={requestClose}>{t("cancel")}</OmmButton>
                <OmmButton type="submit" disabled={busy}>{editing ? t("save") : t("createDraft")}</OmmButton>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminSheetPortal>
    <OmmConfirmDialog
      isOpen={confirmDelete}
      title={t("deleteTitle")}
      description={t("deleteDescription", { code })}
      confirmLabel={t("delete")}
      cancelLabel={t("cancel")}
      backdropAriaLabel={t("close")}
      tone="danger"
      confirmVariant="danger"
      forceCenteredModal
      pending={busy}
      onConfirm={() => {
        setConfirmDelete(false);
        onDelete();
      }}
      onCancel={() => {
        if (!busy) {
          setConfirmDelete(false);
        }
      }}
    />
    </>
  );
}

function FormGroup({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-sand-200/80 bg-white p-3">
      {children}
    </div>
  );
}

function CloseGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}
