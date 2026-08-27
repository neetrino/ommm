"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { AdminCallTasksActions } from "@/components/admin/admin-call-tasks-actions";
import {
  ADMIN_CALL_TASK_STATUS_BADGE_CLASS,
  callTaskStatusBadgeTone,
} from "@/components/admin/admin-call-tasks-list-badges";
import type { CallTaskRow } from "@/components/admin/admin-call-tasks-query";
import {
  ADMIN_BOOKINGS_DETAILS_SHEET_PANEL_CLASS,
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS,
  ADMIN_DETAILS_SHEET_DETAIL_BLOCK_CLASS,
  ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS,
  ADMIN_DETAILS_SHEET_DETAIL_VALUE_CLASS,
  ADMIN_DETAILS_SHEET_FOOTER_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { AdminSheetPortal } from "@/components/admin/admin-sheet-portal";
import { useAdminAnimatedSheetClose } from "@/components/admin/use-admin-animated-sheet-close";
import { formatDateForUi } from "@/lib/date-display";
import { displayPhoneOrFallback } from "@/lib/phone";

type AdminCallTasksDetailsSheetProps = {
  row: CallTaskRow;
  busy: boolean;
  onClose: () => void;
  onComplete: () => void;
  onEdit: () => void;
  onCancel: () => void;
};

export function AdminCallTasksDetailsSheet({
  row,
  busy,
  onClose,
  onComplete,
  onEdit,
  onCancel,
}: AdminCallTasksDetailsSheetProps) {
  const t = useTranslations("adminPages.calls");
  const titleId = useId();
  const { isOpen: sheetOpen, requestClose, onAfterClose } = useAdminAnimatedSheetClose(onClose);
  const pending = row.status === "PENDING";
  const statusLabel = row.isOverdue && pending ? t("overdue") : t(`status.${row.status}`);

  return (
    <AdminSheetPortal
      presentation="drawer"
      isOpen={sheetOpen}
      onClose={requestClose}
      onAfterClose={onAfterClose}
      backdropAriaLabel={t("detailsCloseBackdrop")}
      ariaLabelledBy={titleId}
      drawerOverlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
      drawerPanelClassName={ADMIN_BOOKINGS_DETAILS_SHEET_PANEL_CLASS}
      closeDisabled={busy}
    >
      <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <h2 id={titleId} className={ADMIN_DETAILS_SHEET_TITLE_CLASS}>
              {row.contactName}
            </h2>
            <span
              className={`${ADMIN_CALL_TASK_STATUS_BADGE_CLASS} ${callTaskStatusBadgeTone(row.status, row.isOverdue)}`}
            >
              {statusLabel}
            </span>
          </div>
          <button
            type="button"
            className={ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS}
            aria-label={t("close")}
            disabled={busy}
            onClick={requestClose}
          >
            <CloseGlyph />
          </button>
        </div>
      </header>

      <div className={ADMIN_DETAILS_SHEET_BODY_CLASS}>
        <dl className={ADMIN_DETAILS_SHEET_DETAIL_BLOCK_CLASS}>
          <DetailRow label={t("colPhone")} value={displayPhoneOrFallback(row.phone)} />
          <DetailRow label={t("colDue")} value={formatDateForUi(row.dueOnDate)} />
          <div className="flex flex-col gap-1">
            <dt className={ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS}>{t("colComment")}</dt>
            <dd className={`${ADMIN_DETAILS_SHEET_DETAIL_VALUE_CLASS} whitespace-pre-wrap`}>
              {row.comment}
            </dd>
          </div>
        </dl>
      </div>

      {pending ? (
        <footer className={ADMIN_DETAILS_SHEET_FOOTER_CLASS}>
          <AdminCallTasksActions
            pending={pending}
            busy={busy}
            onComplete={onComplete}
            onEdit={onEdit}
            onCancel={onCancel}
          />
        </footer>
      ) : null}
    </AdminSheetPortal>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
      <dt className={ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS}>{label}</dt>
      <dd className={ADMIN_DETAILS_SHEET_DETAIL_VALUE_CLASS}>{value}</dd>
    </div>
  );
}

function CloseGlyph() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
