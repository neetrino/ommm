"use client";

import { useTranslations } from "next-intl";
import {
  resolveSessionCoachName,
  SessionCoachLine,
} from "@/components/account/session-coach-line";
import { SessionClassTitle } from "@/components/account/session-class-title";
import { SessionDateTimeHighlight } from "@/components/account/session-datetime-highlight";
import { UserListBoardViewSwitcher } from "@/components/account/user-list-board-view-switcher";
import { UserWaitlistBoardCard } from "@/components/account/user-waitlist-board-card";
import {
  USER_BOOKINGS_LIST_ACTIONS_CELL,
  USER_BOOKINGS_LIST_ACTIONS_HEADER_CELL,
  USER_BOOKINGS_LIST_CLASS_CELL,
  USER_BOOKINGS_LIST_DATE_CELL,
  USER_BOOKINGS_LIST_HEADER_CLASS,
  USER_BOOKINGS_LIST_ROW_CLASS,
  USER_BOOKINGS_LIST_SPACER_CELL,
  USER_BOOKINGS_LIST_STATUS_CELL,
  USER_BOOKINGS_LIST_TIME_CELL,
} from "@/components/account/user-bookings-list-layout";
import { USER_LIST_STACK_CLASS } from "@/components/account/user-list-table-layout";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { useUserListBoardView } from "@/hooks/use-user-list-board-view";
import type { UserWaitlistRow } from "@/lib/user-booking-types";

type UserWaitlistsSectionProps = {
  locale: string;
  rows: readonly UserWaitlistRow[];
  loadError: boolean;
};

export function UserWaitlistsSection({ locale, rows, loadError }: UserWaitlistsSectionProps) {
  const t = useTranslations("userPages.waitlists");
  const [viewMode, setView] = useUserListBoardView("waitlists");

  const heroSearch = (
    <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
      <UserListBoardViewSwitcher
        pageId="waitlists"
        namespace="userPages.waitlists"
        value={viewMode}
        onChange={setView}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <AdminPageHero title={t("title")} description={t("description")} search={heroSearch} />

      {loadError ? (
        <section className="rounded-[20px] border border-rose-100 bg-rose-50/70 p-5 text-sm text-rose-800">
          {t("loadError")}
        </section>
      ) : rows.length === 0 ? (
        <section className="rounded-[20px] border border-white/60 bg-white/75 p-5 sm:p-6">
          <h2 className="ommm-h3 text-sage-800">{t("emptyTitle")}</h2>
          <p className="ommm-body-muted mt-2 text-sm">{t("emptyDescription")}</p>
        </section>
      ) : (
        <>
          <p className="text-sm text-sage-600">{t("waitlistsCount", { count: rows.length })}</p>

          {viewMode === "board" ? (
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {rows.map((item) => (
                <li key={item.id} className="min-w-0 list-none">
                  <UserWaitlistBoardCard locale={locale} waitlist={item} />
                </li>
              ))}
            </ul>
          ) : (
            <div className={USER_LIST_STACK_CLASS}>
              <div className={USER_BOOKINGS_LIST_HEADER_CLASS}>
                <span>{t("listHeaderDate")}</span>
                <span>{t("listHeaderClass")}</span>
                <span>{t("listHeaderTime")}</span>
                <span>{t("listHeaderStatus")}</span>
                <span aria-hidden="true" />
                <span className={USER_BOOKINGS_LIST_ACTIONS_HEADER_CELL}>{t("listHeaderActions")}</span>
              </div>
              <ul className={USER_LIST_STACK_CLASS}>
                {rows.map((item) => (
                  <li key={item.id} className={`list-none ${USER_BOOKINGS_LIST_ROW_CLASS}`}>
                    <div className={USER_BOOKINGS_LIST_DATE_CELL}>
                      <SessionDateTimeHighlight
                        locale={locale}
                        startsAt={item.session.startsAt}
                        endsAt={item.session.endsAt}
                        variant="listDate"
                      />
                    </div>
                    <div className={USER_BOOKINGS_LIST_CLASS_CELL}>
                      <SessionClassTitle variant="list" name={item.session.classType.name} />
                      <SessionCoachLine
                        coachName={resolveSessionCoachName(item.session.coach)}
                        variant="list"
                        className="mt-1"
                      />
                    </div>
                    <div className={USER_BOOKINGS_LIST_TIME_CELL}>
                      <SessionDateTimeHighlight
                        locale={locale}
                        startsAt={item.session.startsAt}
                        endsAt={item.session.endsAt}
                        variant="listTime"
                      />
                    </div>
                    <div className={USER_BOOKINGS_LIST_STATUS_CELL}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-sage-500">
                        {t("waitlistBadge", { pos: item.position, status: item.status })}
                      </p>
                    </div>
                    <div className={USER_BOOKINGS_LIST_SPACER_CELL} aria-hidden="true" />
                    <div className={USER_BOOKINGS_LIST_ACTIONS_CELL} aria-hidden="true" />
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
