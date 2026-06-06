"use client";

import { useTranslations } from "next-intl";
import { AdminListMobileLabel } from "@/components/admin/admin-list-mobile-label";
import { adminChrome } from "@/components/admin/admin-chrome";
import {
  coachName,
  durationMinutes,
  spotsLeft,
  splitSessionLevels,
} from "@/components/admin/admin-schedule-session-display";
import { ScheduleSessionLevelLabels } from "@/components/shared/schedule/schedule-session-level-labels";
import {
  ADMIN_SCHEDULE_STATUS_BADGE_CLASS,
  sessionStatusBadgeTone,
} from "@/components/admin/admin-schedule-session-list-badges";
import { ScheduleSessionDateTimeCellClient } from "@/components/shared/schedule/schedule-session-datetime-cell-client";
import { getScheduleSessionsListLayout } from "@/components/shared/schedule/schedule-sessions-list-layout";
import type { ScheduleSessionListRow } from "@/components/shared/schedule/schedule-session-list-types";

type StaffScheduleSessionsTableProps = {
  locale: string;
  rows: readonly ScheduleSessionListRow[];
  emptyTitle: string;
  emptyBody: string;
  preset?: "staffReadOnly" | "staffWithCoach";
};

export function StaffScheduleSessionsTable({
  locale,
  rows,
  emptyTitle,
  emptyBody,
  preset = "staffWithCoach",
}: StaffScheduleSessionsTableProps) {
  const t = useTranslations("adminPages.classes");
  const layout = getScheduleSessionsListLayout(preset);
  const showCoach = preset === "staffWithCoach";
  const sorted = [...rows].sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  if (sorted.length === 0) {
    return (
      <div className={adminChrome.panel}>
        <p className="font-medium text-sage-900">{emptyTitle}</p>
        <p className="mt-1 text-sm text-sage-600">{emptyBody}</p>
      </div>
    );
  }

  return (
    <div className={layout.tableClass}>
      <div className={layout.headerClass}>
        <span>{t("colClass")}</span>
        <span className={layout.emphasizedHeaderClass}>{t("colDateTime")}</span>
        {showCoach ? (
          <span className={layout.emphasizedHeaderClass}>{t("colCoach")}</span>
        ) : null}
        <span className={layout.emphasizedHeaderClass}>{t("colCapacity")}</span>
        {showCoach ? null : (
          <span className={layout.emphasizedHeaderClass}>{t("colTags")}</span>
        )}
        <span className={layout.emphasizedHeaderClass}>{t("colStatus")}</span>
      </div>
      {sorted.map((row) => (
        <StaffScheduleSessionRowClient
          key={row.id}
          locale={locale}
          row={row}
          preset={preset}
        />
      ))}
    </div>
  );
}

function StaffScheduleSessionRowClient({
  locale,
  row,
  preset,
}: {
  locale: string;
  row: ScheduleSessionListRow;
  preset: "staffReadOnly" | "staffWithCoach";
}) {
  const t = useTranslations("adminPages.classes");
  const layout = getScheduleSessionsListLayout(preset);
  const classFormat = row.classFormat?.trim();
  const levels = splitSessionLevels(row.level);
  const duration = durationMinutes(row);
  const showCoach = preset === "staffWithCoach";

  return (
    <article className={layout.rowClass}>
      <div className={layout.cellClass}>
        <AdminListMobileLabel label={t("colClass")} />
        <p className="truncate text-sm font-medium text-sage-900" title={row.title}>
          {row.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-sage-500">
          {row.classType.name}
          {classFormat ? ` · ${classFormat}` : ""}
          {` · ${duration}m`}
        </p>
      </div>

      <div className={layout.dateTimeCellClass}>
        <AdminListMobileLabel label={t("colDateTime")} />
        <ScheduleSessionDateTimeCellClient
          locale={locale}
          startsAt={row.startsAt}
          endsAt={row.endsAt}
        />
      </div>

      {showCoach ? (
        <div className={layout.coachCellClass}>
          <AdminListMobileLabel label={t("colCoach")} />
          <p
            className="truncate text-sm text-sage-800"
            title={row.coach ? coachName(row.coach) : undefined}
          >
            {row.coach ? coachName(row.coach) : t("fallback.notSpecified")}
          </p>
        </div>
      ) : null}

      <div className={layout.capacityCellClass}>
        <AdminListMobileLabel label={t("colCapacity")} />
        <p className="text-sm font-medium text-sage-800">
          {row._count.bookings}/{row.capacity}
        </p>
        <p className={`${adminChrome.metaText} mt-0.5`}>
          {t("fields.spotsLeft", { count: spotsLeft(row) })}
        </p>
      </div>

      {showCoach ? null : (
        <div className={layout.tagsCellClass}>
          <AdminListMobileLabel label={t("colTags")} />
          <ScheduleSessionLevelLabels
            levels={levels}
            emptyLabel={t("fallback.notSpecified")}
          />
        </div>
      )}

      <div className={layout.statusCellClass}>
        <AdminListMobileLabel label={t("colStatus")} />
        <span
          className={`${ADMIN_SCHEDULE_STATUS_BADGE_CLASS} ${sessionStatusBadgeTone(row.status)}`}
        >
          {t(`status.${row.status}`)}
        </span>
      </div>
    </article>
  );
}
