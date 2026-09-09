"use client";

import { useId, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_MEDIUM_PANEL_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import type { CoachFinanceRow } from "@/components/admin/admin-finance-types";
import { CoachSalarySessionsList } from "@/components/coaches/coach-salary-sessions-list";
import { coachCardDisplayName } from "@/components/coaches/coach-card-display";
import { OmmButton } from "@/components/ui/omm-button";
import { AdminSheetPortal } from "@/components/admin/admin-sheet-portal";
import { useAdminAnimatedSheetClose } from "@/components/admin/use-admin-animated-sheet-close";

type Props = {
  coach: CoachFinanceRow | null;
  locale: string;
  month: string;
  onClose: () => void;
};

export function AdminCoachSessionsDrawer({ coach, locale, month, onClose }: Props) {
  const t = useTranslations("adminPages.finance.coachDrawer");
  const titleId = useId();
  const { isOpen: sheetOpen, requestClose, onAfterClose } = useAdminAnimatedSheetClose(onClose, {
    openKey: coach?.coachProfileId ?? null,
  });

  const coachName = useMemo(
    () =>
      coach !== null
        ? coachCardDisplayName({
            name: coach.user.name,
            lastName: coach.user.lastName,
            email: coach.user.email,
            avatarUrl: null,
          })
        : "",
    [coach],
  );

  return (
    <AdminSheetPortal presentation="drawer"
      isOpen={coach !== null && sheetOpen}
      onClose={requestClose}
      onAfterClose={onAfterClose}
      backdropAriaLabel={t("close")}
      ariaLabelledBy={titleId}
      drawerOverlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
      drawerPanelClassName={ADMIN_DETAILS_SHEET_MEDIUM_PANEL_CLASS}
    >
      <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className={ADMIN_DETAILS_SHEET_TITLE_CLASS}>
              {coachName}
            </h2>
            <p className="mt-1 text-sm text-sage-600">{t("monthLabel", { month })}</p>
          </div>
          <OmmButton type="button" variant="ghost" size="sm" onClick={requestClose}>
            {t("close")}
          </OmmButton>
        </div>
        <p className="mt-3 text-xs text-sage-500">{t("earningsHint")}</p>
      </header>
      <div className={ADMIN_DETAILS_SHEET_BODY_CLASS}>
        {coach !== null ? (
          <CoachSalarySessionsList
            endpoint={`/coaches/admin/${coach.coachProfileId}/salary-sessions`}
            month={month}
            locale={locale}
            loadingLabel={t("loading")}
            loadFailedLabel={t("loadFailed")}
            emptyLabel={t("empty")}
          />
        ) : null}
      </div>
    </AdminSheetPortal>
  );
}
