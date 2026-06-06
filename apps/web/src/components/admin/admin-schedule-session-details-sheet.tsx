"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS,
  ADMIN_DETAILS_SHEET_DETAIL_BLOCK_CLASS,
  ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS,
  ADMIN_DETAILS_SHEET_DETAIL_VALUE_CLASS,
  ADMIN_DETAILS_SHEET_FOOTER_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_LEDE_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_PANEL_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import {
  coachName,
  durationMinutes,
  spotsLeft,
} from "@/components/admin/admin-schedule-session-display";
import { AdminScheduleSessionRowActions } from "@/components/admin/admin-schedule-session-row-actions";
import type { AdminScheduleSession } from "@/components/admin/admin-schedule-management";
import { OmmDrawerPortal } from "@/components/ui/omm-modal";
import { formatDateTimeForUi } from "@/lib/date-display";

type AdminScheduleSessionDetailsSheetProps = {
  locale: string;
  row: AdminScheduleSession | null;
  busy: boolean;
  includeDelete?: boolean;
  onClose: () => void;
  onEdit: (row: AdminScheduleSession) => void;
  onDuplicate: (row: AdminScheduleSession) => void;
  onCancel: (row: AdminScheduleSession) => void;
  onActivate: (row: AdminScheduleSession) => void;
  onDelete?: (row: AdminScheduleSession) => void;
};

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

export function AdminScheduleSessionDetailsSheet({
  locale,
  row,
  busy,
  includeDelete = true,
  onClose,
  onEdit,
  onDuplicate,
  onCancel,
  onActivate,
  onDelete,
}: AdminScheduleSessionDetailsSheetProps) {
  const t = useTranslations("adminPages.classes");
  const titleId = useId();

  if (row === null) {
    return null;
  }

  return (
    <OmmDrawerPortal
      isOpen
      onClose={onClose}
      backdropAriaLabel={t("modalBackdropClose")}
      ariaLabelledBy={titleId}
      overlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
      panelClassName={ADMIN_DETAILS_SHEET_PANEL_CLASS}
    >
      <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h2 id={titleId} className={ADMIN_DETAILS_SHEET_TITLE_CLASS}>
              {row.title}
            </h2>
            <p className={ADMIN_DETAILS_SHEET_LEDE_CLASS}>{t("sessionDetailsLead")}</p>
            <p className="truncate text-sm font-medium text-sage-800">{row.classType.name}</p>
          </div>
          <button
            type="button"
            className={ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS}
            aria-label={t("modalCloseAria")}
            onClick={onClose}
          >
            <CloseGlyph />
          </button>
        </div>
      </header>

      <div className={ADMIN_DETAILS_SHEET_BODY_CLASS}>
        <dl className={ADMIN_DETAILS_SHEET_DETAIL_BLOCK_CLASS}>
          <DetailRow label={t("colType")} value={row.classType.name} />
          <DetailRow
            label={t("colDate")}
            value={formatDateTimeForUi(row.startsAt, locale)}
          />
          <DetailRow label={t("form.endTime")} value={formatDateTimeForUi(row.endsAt, locale)} />
          <DetailRow label={t("fields.duration")} value={`${durationMinutes(row)}m`} />
          <DetailRow label={t("colCoach")} value={coachName(row.coach)} />
          <DetailRow
            label={t("colCapacity")}
            value={`${row._count.bookings}/${row.capacity} · ${t("fields.spotsLeft", { count: spotsLeft(row) })}`}
          />
          <DetailRow label={t("colLevel")} value={row.level ?? "—"} />
          <DetailRow label={t("colStatus")} value={t(`status.${row.status}`)} />
          {row.description ? (
            <DetailRow label={t("form.description")} value={row.description} />
          ) : null}
        </dl>
      </div>

      <footer className={ADMIN_DETAILS_SHEET_FOOTER_CLASS}>
        <AdminScheduleSessionRowActions
          variant="sheet"
          row={row}
          busy={busy}
          includeDelete={includeDelete}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onCancel={onCancel}
          onActivate={onActivate}
          onDelete={onDelete}
        />
      </footer>
    </OmmDrawerPortal>
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
