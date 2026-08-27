"use client";

import type { useTranslations } from "next-intl";
import { AdminSheetPortal } from "@/components/admin/admin-sheet-portal";
import { useAdminAnimatedSheetClose } from "@/components/admin/use-admin-animated-sheet-close";
import { ADMIN_MODAL_PANEL_SHELL_CLASS } from "@/components/admin/admin-mobile-sheet-layout";
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
  const { isOpen: sheetOpen, requestClose, onAfterClose } = useAdminAnimatedSheetClose(onCancel);

  return (
    <AdminSheetPortal
      presentation="modal"
      isOpen={sheetOpen}
      onClose={requestClose}
      onAfterClose={onAfterClose}
      backdropAriaLabel={t("removeConfirm.cancel")}
      closeDisabled={busyAction !== null}
      modalOverlayClassName="ommm-modal-overlay z-[95] items-center p-4"
      modalPanelClassName={`${ADMIN_MODAL_PANEL_SHELL_CLASS} max-w-md p-5 sm:p-6`}
      zIndexClass="z-[95]"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-y-contain">
        <h3 className="text-base font-semibold text-sage-900">{t("removeConfirm.title")}</h3>
        <p className="text-sm text-sage-700">
          {t("removeConfirm.description", { user: confirmRemoveLabel })}
        </p>
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            className="ommm-cta-secondary h-9 px-4"
            onClick={requestClose}
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
    </AdminSheetPortal>
  );
}
