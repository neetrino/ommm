"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { CoachClientBookingsHistory } from "@/components/coach/coach-client-bookings-history";
import { AdminClientPackageBadge } from "@/components/admin/admin-client-package-badge";
import type { ClientRow } from "@/components/admin/admin-clients-types";
import {
  ADMIN_BOOKINGS_DETAILS_SHEET_PANEL_CLASS,
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS,
  ADMIN_DETAILS_SHEET_LEDE_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { AdminSheetPortal } from "@/components/admin/admin-sheet-portal";
import { useAdminAnimatedSheetClose } from "@/components/admin/use-admin-animated-sheet-close";
import { formatDateTimeForUi } from "@/lib/date-display";

type CoachClientBookingsTarget = Pick<
  ClientRow,
  | "id"
  | "name"
  | "lastName"
  | "activePackageId"
  | "activePackageStatus"
  | "activePlanName"
> & {
  lastSessionAt?: string | null;
};

type CoachClientBookingsSheetProps = {
  client: CoachClientBookingsTarget | null;
  locale: string;
  onClose: () => void;
};

function coachClientDisplayName(
  client: Pick<CoachClientBookingsTarget, "name" | "lastName">,
  fallback: string,
): string {
  const label = [client.name, client.lastName]
    .filter((part): part is string => part !== null && part.trim().length > 0)
    .join(" ");
  return label.length > 0 ? label : fallback;
}

export function CoachClientBookingsSheet({
  client,
  locale,
  onClose,
}: CoachClientBookingsSheetProps) {
  if (client === null) {
    return null;
  }
  return (
    <CoachClientBookingsSheetContent
      key={client.id}
      client={client}
      locale={locale}
      onClose={onClose}
    />
  );
}

function CoachClientBookingsSheetContent({
  client,
  locale,
  onClose,
}: {
  client: CoachClientBookingsTarget;
  locale: string;
  onClose: () => void;
}) {
  const t = useTranslations("coachPages.clients");
  const titleId = useId();
  const { isOpen, requestClose, onAfterClose } = useAdminAnimatedSheetClose(onClose);
  const name = coachClientDisplayName(client, t("unnamed"));
  const when =
    client.lastSessionAt == null
      ? null
      : formatDateTimeForUi(client.lastSessionAt, locale);

  return (
    <AdminSheetPortal
      presentation="drawer"
      isOpen={isOpen}
      onClose={requestClose}
      onAfterClose={onAfterClose}
      backdropAriaLabel={t("close")}
      ariaLabelledBy={titleId}
      drawerOverlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
      drawerPanelClassName={ADMIN_BOOKINGS_DETAILS_SHEET_PANEL_CLASS}
    >
      <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id={titleId} className={ADMIN_DETAILS_SHEET_TITLE_CLASS}>
              {name}
            </h2>
            {when !== null ? (
              <p className={ADMIN_DETAILS_SHEET_LEDE_CLASS}>{t("lastSession", { when })}</p>
            ) : null}
            <div className="mt-3 w-fit">
              <AdminClientPackageBadge row={client} />
            </div>
          </div>
          <button
            type="button"
            className={ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS}
            aria-label={t("close")}
            onClick={requestClose}
          >
            ×
          </button>
        </div>
      </header>
      <div className={ADMIN_DETAILS_SHEET_BODY_CLASS}>
        <CoachClientBookingsHistory clientId={client.id} locale={locale} />
      </div>
    </AdminSheetPortal>
  );
}
