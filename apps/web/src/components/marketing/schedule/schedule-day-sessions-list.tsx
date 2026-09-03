"use client";

import { useTranslations } from "next-intl";
import type { CSSProperties, RefObject } from "react";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import styles from "@/components/marketing/schedule/marketing-schedule-view.module.css";
import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import { MarketingScheduleSessionsSkeleton } from "@/components/marketing/schedule/marketing-schedule-sessions-skeleton";
import { ScheduleEmptyState } from "@/components/marketing/schedule/schedule-empty-state";
import { ScheduleSessionRow } from "@/components/marketing/schedule/schedule-session-row";
import { SCHEDULE_SESSION_LIST } from "@/components/marketing/schedule/schedule-public-design";
import type { ScheduleAnimationPhase } from "@/components/marketing/schedule/use-schedule-day-transition";
import { formatScheduleTimeHHmm } from "@/lib/format-time-display";
import { isUpcomingPublicScheduleSession } from "@/lib/filter-public-schedule-items";
import {
  resolveMemberOnWaitlistBadge,
  resolveMemberScheduleRowDisplay,
} from "@/lib/schedule-session-spots";
import {
  sessionBookingCreatedAt,
  sessionBookingId,
  type UserSessionBookingMap,
} from "@/lib/user-session-bookings-map";
import type { ScheduleSessionEligibilityMap } from "@/lib/schedule-session-eligibility";

type ScheduleDaySessionsListProps = {
  locale: string;
  audience: PublicPackageCategoryCardsAudience;
  sessionsReady: boolean;
  scheduleNow: Date;
  renderedDayKey: string;
  renderedSessions: readonly MarketingScheduleItem[];
  animationPhase: ScheduleAnimationPhase;
  contentRef: RefObject<HTMLDivElement | null>;
  getItemStyle: (index: number) => CSSProperties;
  bookedBySessionId: UserSessionBookingMap;
  waitlistedSessionIds: ReadonlySet<string>;
  memberWaitlistLoaded: boolean;
  memberActionStateReady: boolean;
  eligibilityBySessionId: ScheduleSessionEligibilityMap;
  eligibilityLoaded: boolean;
  onBooked: (sessionId: string, bookingId: string) => void;
  onCancelled: (sessionId: string) => void;
  onWaitlisted: (sessionId: string) => void;
  onWaitlistLeft: (sessionId: string) => void;
};

/** Mobile / narrow schedule — single-day session list with enter/exit motion. */
export function ScheduleDaySessionsList({
  locale,
  audience,
  sessionsReady,
  scheduleNow,
  renderedDayKey,
  renderedSessions,
  animationPhase,
  contentRef,
  getItemStyle,
  bookedBySessionId,
  waitlistedSessionIds,
  memberWaitlistLoaded,
  memberActionStateReady,
  eligibilityBySessionId,
  eligibilityLoaded,
  onBooked,
  onCancelled,
  onWaitlisted,
  onWaitlistLeft,
}: ScheduleDaySessionsListProps) {
  const t = useTranslations("marketingPages.schedule");

  return (
    <div className="mt-0 overflow-hidden">
      <div
        ref={contentRef}
        className={
          animationPhase === "exit"
            ? styles.scheduleListExit
            : animationPhase === "enter"
              ? styles.scheduleListEnter
              : ""
        }
      >
        <ul key={renderedDayKey} className={SCHEDULE_SESSION_LIST}>
          {!sessionsReady ? (
            <MarketingScheduleSessionsSkeleton />
          ) : renderedSessions.length === 0 ? (
            <li
              className={animationPhase === "enter" ? styles.scheduleItemEnter : ""}
              style={getItemStyle(0)}
            >
              <ScheduleEmptyState />
            </li>
          ) : (
            renderedSessions.map((row, index) => {
              const isClosed = !isUpcomingPublicScheduleSession(row, scheduleNow);
              const userOnWaitlist =
                bookedBySessionId[row.id] === undefined &&
                waitlistedSessionIds.has(row.id);
              const displayRow = resolveMemberScheduleRowDisplay({
                row,
                onWaitlist: userOnWaitlist,
                capacityReady: memberWaitlistLoaded,
              });
              const showOnWaitlist = resolveMemberOnWaitlistBadge({
                userBookingId: sessionBookingId(bookedBySessionId, row.id),
                onWaitlist: userOnWaitlist,
                availableSpots: displayRow.availableSpots,
                sessionStatus: displayRow.status,
                capacityReady: memberWaitlistLoaded,
              });

              return (
                <ScheduleSessionRow
                  key={row.id}
                  row={displayRow}
                  locale={locale}
                  bookLabel={t("bookCta")}
                  closedLabel={t("sessionClosed")}
                  isClosed={isClosed}
                  audience={audience}
                  withInstructorLabel={t("withInstructor", {
                    name: row.instructorName,
                  })}
                  spotsFullLabel={t("spotsFull")}
                  spotsLeftLabel={t("spotsLeft", {
                    count: displayRow.availableSpots,
                  })}
                  spotsLoadingLabel={t("actionLoading")}
                  durationLabel={
                    row.durationMinutes !== null
                      ? t("minutesShort", { count: row.durationMinutes })
                      : row.endTime !== null
                        ? `${formatScheduleTimeHHmm(locale, row.startTime)} - ${formatScheduleTimeHHmm(locale, row.endTime)}`
                        : "-"
                  }
                  userBookingId={sessionBookingId(bookedBySessionId, row.id)}
                  userBookingCreatedAt={sessionBookingCreatedAt(
                    bookedBySessionId,
                    row.id,
                  )}
                  bookingStateReady={memberActionStateReady}
                  isOnWaitlist={showOnWaitlist}
                  packageEligibility={eligibilityBySessionId.get(row.id)}
                  eligibilityLoaded={eligibilityLoaded}
                  onBooked={onBooked}
                  onCancelled={onCancelled}
                  onWaitlisted={onWaitlisted}
                  onWaitlistLeft={onWaitlistLeft}
                  className={
                    animationPhase === "enter" ? styles.scheduleItemEnter : ""
                  }
                  style={getItemStyle(index)}
                />
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
