"use client";

import { useId } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  StaffActivityTypeLabel,
} from "@/components/admin/admin-staff-activity-type-copy";
import { OmmButton } from "@/components/ui/omm-button";
import { AdminSheetPortal } from "@/components/admin/admin-sheet-portal";
import { formatDateTimeForUi } from "@/lib/date-display";
import { formatTimeForUi } from "@/lib/format-time-display";
import type { StaffActivityRow } from "@/lib/staff-activity-types";
import { STUDIO_TIMEZONE } from "@/lib/studio-timezone";
import styles from "@/components/account/required-phone-completion-gate.module.css";

type AdminStaffActivityDetailsModalProps = {
  row: StaffActivityRow;
  onClose: () => void;
};

export function AdminStaffActivityDetailsModal({
  row,
  onClose,
}: AdminStaffActivityDetailsModalProps) {
  const locale = useLocale();
  const t = useTranslations("staffActivityPages");
  const titleId = useId();
  const descId = useId();
  const sessionWhen = formatSessionWhen(locale, row.sessionStartsAt);

  return (
    <AdminSheetPortal presentation="modal"
      isOpen
      onClose={onClose}
      dialogRole="dialog"
      ariaLabelledBy={titleId}
      ariaDescribedBy={descId}
      backdropAriaLabel={t("detailsCloseBackdrop")}

      modalOverlayClassName={`${styles.overlay} ommm-modal-overlay z-[115] items-center p-4`}
      modalPanelClassName={`${styles.panel} max-h-[min(90vh,40rem)] overflow-y-auto`}
    >
      <div className={styles.form}>
        <p className={styles.eyebrow}>{t("detailsEyebrow")}</p>
        <h2 id={titleId} className={styles.title}>
          {row.className}
        </h2>
        <p id={descId} className={styles.body}>
          {sessionWhen}
        </p>
        <p className="text-sm text-sage-800">
          <StaffActivityTypeLabel type={row.type} />
          <span className="text-sage-500"> · </span>
          <span className="font-medium">{row.memberName}</span>
        </p>
        <div className="rounded-2xl border border-sand-200/80 bg-white/75 px-4 py-3">
          <p className="text-xs text-sage-500">
            {formatDateTimeForUi(row.createdAt, locale)}
          </p>
        </div>
        <OmmButton type="button" variant="secondary" size="md" className="w-full" onClick={onClose}>
          {t("detailsClose")}
        </OmmButton>
      </div>
    </AdminSheetPortal>
  );
}

function formatSessionWhen(locale: string, startsAt: string): string {
  const start = new Date(startsAt);
  const date = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: STUDIO_TIMEZONE,
  }).format(start);
  return `${date} · ${formatTimeForUi(start, locale)}`;
}
