"use client";

import { useTranslations } from "next-intl";
import { USER_SCHEDULE_LIST_ACTIONS_HEADER_CELL, USER_SCHEDULE_LIST_HEADER_CLASS } from "@/components/account/user-schedule-list-layout";
import { USER_LIST_STACK_CLASS } from "@/components/account/user-list-table-layout";
import { UserListBoardViewSwitcher } from "@/components/account/user-list-board-view-switcher";
import { UserSessionBoardCard } from "@/components/account/user-session-board-card";
import { UserSessionCompactRow } from "@/components/account/user-session-compact-row";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { useUserListBoardView } from "@/hooks/use-user-list-board-view";
import { ACCOUNT_SESSION_RANGE_DAYS } from "@/lib/account-constants";
import type { UserSessionRow } from "@/lib/user-booking-types";
import type { UserSessionBookingMap } from "@/lib/user-session-bookings-map";

type UserClassesSectionProps = {
  locale: string;
  sessions: readonly UserSessionRow[];
  sessionBookings: UserSessionBookingMap;
};

export function UserClassesSection({
  locale,
  sessions,
  sessionBookings,
}: UserClassesSectionProps) {
  const t = useTranslations("userPages.classes");
  const [viewMode, setView] = useUserListBoardView("classes");

  const heroSearch = (
    <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
      <UserListBoardViewSwitcher
        pageId="classes"
        namespace="userPages.classes"
        value={viewMode}
        onChange={setView}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <AdminPageHero
        title={t("title")}
        description={t("description", { days: ACCOUNT_SESSION_RANGE_DAYS })}
        search={heroSearch}
      />

      {sessions.length === 0 ? (
        <p className="ommm-body-muted text-sm">{t("noSessions")}</p>
      ) : (
        <>
          <p className="text-sm text-sage-600">{t("sessionsCount", { count: sessions.length })}</p>

          {viewMode === "board" ? (
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {sessions.map((session) => (
                <li key={session.id} className="min-w-0 list-none">
                  <UserSessionBoardCard
                    locale={locale}
                    session={session}
                    userBookingId={sessionBookings[session.id]}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className={USER_LIST_STACK_CLASS}>
              <div className={USER_SCHEDULE_LIST_HEADER_CLASS}>
                <span>{t("listHeaderDate")}</span>
                <span>{t("listHeaderClass")}</span>
                <span>{t("listHeaderTime")}</span>
                <span>{t("listHeaderCoach")}</span>
                <span>{t("listHeaderSpots")}</span>
                <span aria-hidden="true" />
                <span className={USER_SCHEDULE_LIST_ACTIONS_HEADER_CELL}>{t("listHeaderActions")}</span>
              </div>
              <ul className={USER_LIST_STACK_CLASS}>
                {sessions.map((session) => (
                  <li key={session.id} className="list-none">
                    <UserSessionCompactRow
                      locale={locale}
                      session={session}
                      userBookingId={sessionBookings[session.id]}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
