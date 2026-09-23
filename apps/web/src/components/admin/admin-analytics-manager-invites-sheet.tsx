"use client";

import { useId, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_PANEL_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import type {
  ManagerInviteAnalyticsRow,
  ManagerInviteReferredUser,
} from "@/components/admin/admin-analytics-managers-types";
import { AdminClientDrawerById } from "@/components/admin/admin-client-drawer-by-id";
import { AdminSheetPortal } from "@/components/admin/admin-sheet-portal";
import { useAdminAnimatedSheetClose } from "@/components/admin/use-admin-animated-sheet-close";
import { useRouter } from "@/i18n/navigation";
import { formatDateForUi } from "@/lib/date-display";

type AdminAnalyticsManagerInvitesSheetProps = {
  manager: ManagerInviteAnalyticsRow;
  onClose: () => void;
};

export function AdminAnalyticsManagerInvitesSheet({
  manager,
  onClose,
}: AdminAnalyticsManagerInvitesSheetProps) {
  const t = useTranslations("adminPages.analytics.sections.managerInvites");
  const locale = useLocale();
  const router = useRouter();
  const titleId = useId();
  const { isOpen: sheetOpen, requestClose, onAfterClose } =
    useAdminAnimatedSheetClose(onClose);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  return (
    <>
      <AdminSheetPortal
        presentation="drawer"
        isOpen={sheetOpen}
        onClose={requestClose}
        onAfterClose={onAfterClose}
        backdropAriaLabel={t("sheetCloseBackdrop")}
        ariaLabelledBy={titleId}
        drawerOverlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
        drawerPanelClassName={ADMIN_DETAILS_SHEET_PANEL_CLASS}
      >
        <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 id={titleId} className={ADMIN_DETAILS_SHEET_TITLE_CLASS}>
                {manager.name}
              </h2>
              <p className="mt-1 text-sm text-sage-500">
                {t("sheetSubtitle", { count: manager.referredCount })}
              </p>
            </div>
            <button
              type="button"
              className={ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS}
              aria-label={t("sheetClose")}
              onClick={requestClose}
            >
              <CloseGlyph />
            </button>
          </div>
        </header>

        <div className={ADMIN_DETAILS_SHEET_BODY_CLASS}>
          {manager.referredUsers.length === 0 ? (
            <p className="text-sm text-sage-500">{t("sheetEmpty")}</p>
          ) : (
            <ul className="divide-y divide-white/50">
              {manager.referredUsers.map((user) => (
                <ReferredUserRow
                  key={user.id}
                  user={user}
                  openLabel={t("openMemberAria", { name: user.name })}
                  onOpen={() => setSelectedClientId(user.id)}
                />
              ))}
            </ul>
          )}
        </div>
      </AdminSheetPortal>
      <AdminClientDrawerById
        clientId={selectedClientId}
        locale={locale}
        onClose={() => setSelectedClientId(null)}
        onChanged={() => router.refresh()}
        useOverlayPortalRoot
      />
    </>
  );
}

function ReferredUserRow({
  user,
  openLabel,
  onOpen,
}: {
  user: ManagerInviteReferredUser;
  openLabel: string;
  onOpen: () => void;
}) {
  return (
    <li className="first:pt-0 last:pb-0">
      <button
        type="button"
        className="flex w-full items-baseline justify-between gap-2 py-3 text-left transition-colors hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ommm-admin-olive)]/40 focus-visible:ring-offset-2"
        aria-label={openLabel}
        onClick={onOpen}
      >
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-sage-900">
            {user.name}
          </span>
          {user.name !== user.email ? (
            <span className="mt-0.5 block truncate text-xs text-sage-500">
              {user.email}
            </span>
          ) : null}
        </span>
        <time
          dateTime={user.createdAt}
          className="shrink-0 text-xs tabular-nums text-sage-500"
        >
          {formatDateForUi(user.createdAt)}
        </time>
      </button>
    </li>
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
