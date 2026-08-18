"use client";

import type { KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import {
  ADMIN_COACH_CLASS_BADGE_BOARD_CLASS,
  COACH_BOARD_AVATAR_CLASS,
  CoachClassBadges,
  CoachDirectoryAvatar,
  classNamesForCoach,
  coachDirectoryDisplayName,
} from "@/components/admin/admin-coach-directory-display";
import { AdminCoachRowActions } from "@/components/admin/admin-coach-row-actions";
import type { CoachClassOption } from "@/components/admin/admin-coach-form-helpers";
import type { AdminCoachDirectoryRow } from "@/components/admin/admin-coaches-types";
import { ADMIN_LIST_ROW_SURFACE } from "@/components/admin/admin-list-table-layout";
import { DashboardNavIcon } from "@/components/shell/dashboard-nav-icon";
import { USER_LIST_ROW_INTERACTIVE } from "@/components/account/user-list-table-layout";
import { displayPhoneOrFallback } from "@/lib/phone";

const BOARD_CARD_CLASS = [
  ADMIN_LIST_ROW_SURFACE,
  USER_LIST_ROW_INTERACTIVE,
  "flex h-full w-full min-w-0 flex-col p-5 text-left",
].join(" ");

const BOARD_CARD_STACK_CLASS = "flex min-h-0 flex-1 flex-col gap-4";
const BOARD_CARD_DIVIDER_SECTION_CLASS = "flex flex-col gap-4 border-t border-sage-100 pt-4";
const BOARD_ICON_WELL_CLASS =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sand-100 text-sage-700";
const BOARD_META_TEXT_CLASS = "min-w-0 text-sm font-medium text-sage-800";

type AdminCoachBoardCardProps = {
  coach: AdminCoachDirectoryRow;
  classTypeOptions: readonly string[];
  classOptions: readonly CoachClassOption[];
  locale?: string;
  readOnly?: boolean;
  onSelect: (coach: AdminCoachDirectoryRow) => void;
};

type BoardMetaRowProps = {
  icon: "user" | "calendar";
  children: string;
};

function activateCard(
  event: KeyboardEvent<HTMLElement>,
  onActivate: () => void,
): void {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onActivate();
  }
}

function BoardMetaRow({ icon, children }: BoardMetaRowProps) {
  return (
    <div className="flex items-center gap-3">
      <span className={BOARD_ICON_WELL_CLASS} aria-hidden>
        <DashboardNavIcon name={icon} className="h-4 w-4" />
      </span>
      <p className={BOARD_META_TEXT_CLASS}>{children}</p>
    </div>
  );
}

function BoardCardHeader({
  coach,
  classTypeOptions,
  classOptions,
  locale,
  readOnly,
}: Omit<AdminCoachBoardCardProps, "onSelect">) {
  const displayName = coachDirectoryDisplayName(coach);

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <CoachDirectoryAvatar coach={coach} sizeClassName={COACH_BOARD_AVATAR_CLASS} />
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-sage-900" title={displayName}>
            {displayName}
          </p>
          <p className="mt-0.5 truncate text-xs text-sage-500">
            {displayPhoneOrFallback(coach.user.phone)}
          </p>
        </div>
      </div>
      {readOnly ? null : (
        <div
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <AdminCoachRowActions
            coach={coach}
            classTypeOptions={classTypeOptions}
            classOptions={classOptions}
            locale={locale}
            variant="board"
          />
        </div>
      )}
    </div>
  );
}

export function AdminCoachBoardCard({
  coach,
  classTypeOptions,
  classOptions,
  locale,
  readOnly = false,
  onSelect,
}: AdminCoachBoardCardProps) {
  const t = useTranslations("adminPages.coaches");
  const displayName = coachDirectoryDisplayName(coach);
  const classLabels = classNamesForCoach(coach.assignedClassTypeIds, classOptions);
  const specialization = coach.specialization?.trim() || "—";

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={displayName}
      onClick={() => onSelect(coach)}
      onKeyDown={(event) => activateCard(event, () => onSelect(coach))}
      className={BOARD_CARD_CLASS}
    >
      <div className={BOARD_CARD_STACK_CLASS}>
        <BoardCardHeader
          coach={coach}
          classTypeOptions={classTypeOptions}
          classOptions={classOptions}
          locale={locale}
          readOnly={readOnly}
        />
        <BoardMetaRow icon="user">{specialization}</BoardMetaRow>
        <div className={`${BOARD_CARD_DIVIDER_SECTION_CLASS} flex-1`}>
          <div className="flex flex-wrap content-start items-center gap-2">
            <CoachClassBadges
              labels={classLabels}
              badgeClassName={ADMIN_COACH_CLASS_BADGE_BOARD_CLASS}
            />
          </div>
        </div>
        <div className={BOARD_CARD_DIVIDER_SECTION_CLASS}>
          <BoardMetaRow icon="calendar">
            {t("workloadSummary", {
              classes: coach.totalClasses,
              slots: coach.schedule.length,
            })}
          </BoardMetaRow>
        </div>
      </div>
    </article>
  );
}
