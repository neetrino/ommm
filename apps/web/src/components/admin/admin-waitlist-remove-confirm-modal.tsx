"use client";

import type { useTranslations } from "next-intl";
import type { AdminWaitlistRow } from "@/components/admin/admin-waitlist-query";

type AdminWaitlistRemoveConfirmModalProps = {
  pendingRemove: AdminWaitlistRow;
  confirmRemoveLabel: string;
  busyAction: string | null;
  onCancel: () => void;
  onConfirm: () => void;
  t: ReturnType<typeof useTranslations<"adminPages.waitlists">>;
};

export function AdminWaitlistRemoveConfirmModal({
  confirmRemoveLabel,
  busyAction,
  onCancel,
  onConfirm,
  t,
}: AdminWaitlistRemoveConfirmModalProps) {
  return (
    <div className="ommm-modal-overlay z-[95] items-center p-4" role="presentation">
      <button
        type="button"
        className="ommm-modal-backdrop"
        aria-label={t("removeConfirm.cancel")}
        onClick={onCancel}
        disabled={busyAction !== null}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/60 bg-white p-5 shadow-[0_20px_50px_-25px_rgba(45,40,35,0.35)]">
        <h3 className="text-base font-semibold text-sage-900">{t("removeConfirm.title")}</h3>
        <p className="mt-2 text-sm text-sage-700">
          {t("removeConfirm.description", { user: confirmRemoveLabel })}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="ommm-cta-secondary h-9 px-4"
            onClick={onCancel}
            disabled={busyAction !== null}
          >
            {t("removeConfirm.cancel")}
          </button>
          <button
            type="button"
            className="ommm-cta-primary h-9 px-4"
            onClick={onConfirm}
            disabled={busyAction !== null}
          >
            {t("removeConfirm.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
