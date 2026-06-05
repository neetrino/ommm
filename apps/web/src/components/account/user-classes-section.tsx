"use client";

import { useTranslations } from "next-intl";
import {
  USER_SCHEDULE_LIST_HEADER_CLASS,
} from "@/components/account/user-schedule-list-layout";
import { UserListBoardViewSwitcher } from "@/components/account/user-list-board-view-switcher";
import { UserSessionBoardCard } from "@/components/account/user-session-board-card";
import { UserSessionCompactRow } from "@/components/account/user-session-compact-row";
import { useUserListBoardView } from "@/hooks/use-user-list-board-view";
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
            pageId="classes"
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
          <div className={USER_SCHEDULE_LIST_HEADER_CLASS}>
            <span>{t("listHeaderClass")}</span>
            <span>{t("listHeaderCoach")}</span>
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
    </div>
  );
}
