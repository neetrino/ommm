"use client";

import { useTranslations } from "next-intl";
import {
  CoachClassBadges,
  CoachDirectoryAvatar,
  coachDirectoryDisplayName,
} from "@/components/admin/admin-coach-directory-display";
import { AdminCoachRowActions } from "@/components/admin/admin-coach-row-actions";
import {
  ADMIN_COACHES_LIST_ACTIONS_CELL,
  ADMIN_COACHES_LIST_CELL,
  ADMIN_COACHES_LIST_ROW_ACTIONS_HOVER_REVEAL,
  ADMIN_COACHES_LIST_ROW_CLASS,
  ADMIN_COACHES_LIST_SPECIALIZATION_CELL,
  ADMIN_COACHES_LIST_TAGS_CELL,
  ADMIN_COACHES_LIST_WORKLOAD_CELL,
} from "@/components/admin/admin-coaches-list-layout";
import type { CoachClassOption } from "@/components/admin/admin-coach-form-helpers";
import type { AdminCoachDirectoryRow } from "@/components/admin/admin-coaches-types";
import { AdminListMobileLabel } from "@/components/admin/admin-list-mobile-label";
import { ADMIN_LIST_TITLE_TEXT_CLASS } from "@/components/admin/admin-list-table-layout";
import { displayPhoneOrFallback } from "@/lib/phone";

type AdminCoachCompactRowProps = {
  coach: AdminCoachDirectoryRow;
  classTypeOptions: readonly string[];
  classOptions: readonly CoachClassOption[];
  locale: string;
  onSelect: (coach: AdminCoachDirectoryRow) => void;
  readOnly?: boolean;
};

export function AdminCoachCompactRow({
  coach,
  classTypeOptions,
  classOptions,
  locale,
  onSelect,
  readOnly = false,
}: AdminCoachCompactRowProps) {
  const t = useTranslations("adminPages.coaches");
  const displayName = coachDirectoryDisplayName(coach);

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={displayName}
      onClick={() => onSelect(coach)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(coach);
        }
      }}
      className={ADMIN_COACHES_LIST_ROW_CLASS}
    >
      <div className={ADMIN_COACHES_LIST_CELL}>
        <AdminListMobileLabel label={t("colCoaches")} />
        <div className="flex min-w-0 items-center gap-3">
          <CoachDirectoryAvatar coach={coach} />
          <div className="min-w-0 flex-1">
            <p className={ADMIN_LIST_TITLE_TEXT_CLASS} title={displayName}>
              {displayName}
            </p>
            <p className="mt-0.5 truncate text-xs text-sage-500">{displayPhoneOrFallback(coach.user.phone)}</p>
          </div>
        </div>
      </div>

      <div className={ADMIN_COACHES_LIST_SPECIALIZATION_CELL}>
        <AdminListMobileLabel label={t("colSpecialization")} />
        <p className="truncate text-sm text-sage-800">{coach.specialization ?? "—"}</p>
      </div>

      <div className={ADMIN_COACHES_LIST_TAGS_CELL}>
        <AdminListMobileLabel label={t("colTags")} />
        <CoachClassBadges
          assignedClassTypeIds={coach.assignedClassTypeIds}
          classOptions={classOptions}
        />
      </div>

      <div className={ADMIN_COACHES_LIST_WORKLOAD_CELL}>
        <AdminListMobileLabel label={t("colWorkload")} />
        <p className="text-sm text-sage-800">
          {t("workloadSummary", {
            classes: coach.totalClasses,
            slots: coach.schedule.length,
          })}
        </p>
      </div>

      {readOnly ? null : (
        <div
          className={`${ADMIN_COACHES_LIST_ACTIONS_CELL} ${ADMIN_COACHES_LIST_ROW_ACTIONS_HOVER_REVEAL}`}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <AdminListMobileLabel label={t("colActions")} />
          <AdminCoachRowActions
            coach={coach}
            classTypeOptions={classTypeOptions}
            classOptions={classOptions}
            locale={locale}
          />
        </div>
      )}
    </article>
  );
}
