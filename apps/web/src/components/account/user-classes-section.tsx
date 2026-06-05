"use client";

import { useTranslations } from "next-intl";
import { UserListBoardViewSwitcher } from "@/components/account/user-list-board-view-switcher";
import { UserSessionBoardCard } from "@/components/account/user-session-board-card";
import { UserSessionCompactRow } from "@/components/account/user-session-compact-row";
import { useUserListBoardView } from "@/hooks/use-user-list-board-view";
import { Link } from "@/i18n/navigation";
import type { UserSessionRow } from "@/lib/user-booking-types";

type UserClassesSectionProps = {
  locale: string;
  sessions: readonly UserSessionRow[];
};

export function UserClassesSection({ locale, sessions }: UserClassesSectionProps) {
  const t = useTranslations("userPages.classes");
  const [viewMode, setView] = useUserListBoardView("classes");

  return (
    <div className="space-y-5">
      {sessions.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-sage-600">{t("sessionsCount", { count: sessions.length })}</p>
          <UserListBoardViewSwitcher
            namespace="userPages.classes"
            value={viewMode}
            onChange={setView}
          />
        </div>
      ) : null}

      {sessions.length === 0 ? (
        <p className="ommm-body-muted text-sm">{t("noSessions")}</p>
      ) : viewMode === "board" ? (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {sessions.map((session) => (
            <li key={session.id} className="min-w-0 list-none">
              <UserSessionBoardCard locale={locale} session={session} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="overflow-hidden rounded-[20px] border border-white/60 bg-white/75">
          <div className="hidden border-b border-white/70 px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-sage-500 md:grid md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_auto] md:gap-4">
            <span>{t("listHeaderClass")}</span>
            <span>{t("listHeaderTime")}</span>
            <span>{t("listHeaderSpots")}</span>
            <span className="sr-only">{t("listHeaderActions")}</span>
          </div>
          <ul className="divide-y divide-white/70">
            {sessions.map((session) => (
              <li key={session.id}>
                <UserSessionCompactRow locale={locale} session={session} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="ommm-body-muted mt-8 text-sm">
        <Link href="/user/bookings" className="ommm-link-sage">
          {t("myBookingsLink")}
        </Link>
      </p>
    </div>
  );
}
