"use client";

import { useTranslations } from "next-intl";
import { DashboardNavIcon } from "@/components/shell/dashboard-nav-icon";
import type { DashboardNavIcon as DashboardNavIconName } from "@/lib/dashboard-nav";
import {
  ADMIN_SCHEDULE_SESSIONS_LIST_ACTIONS_HEADER_CELL,
  ADMIN_SCHEDULE_SESSIONS_LIST_DATE_TIME_HEADER_CELL,
  ADMIN_SCHEDULE_SESSIONS_LIST_EMPHASIZED_HEADER,
  ADMIN_SCHEDULE_SESSIONS_LIST_TAGS_HEADER_CELL,
} from "@/components/admin/admin-schedule-sessions-list-layout";
import type { SessionSortOrder } from "@/lib/list-sort";

const HEADER_ICON_CLASS = "h-3.5 w-3.5 shrink-0 text-mint-600";
const SORT_ICON_ACTIVE_OPACITY = 1;
const SORT_ICON_MUTED_OPACITY = 0.4;

const SORT_HEADER_BUTTON_CLASS = [
  "inline-flex min-w-0 max-w-full items-center gap-1.5",
  "-ml-1 rounded-md px-1 py-0.5",
  "transition-colors hover:bg-sand-100/80 hover:text-sage-700",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-400/50",
].join(" ");

type AdminScheduleColumnKey = "class" | "coach" | "capacity" | "labels" | "actions";

const ICON_BY_COLUMN: Record<AdminScheduleColumnKey, DashboardNavIconName> = {
  class: "layoutGrid",
  coach: "user",
  capacity: "users",
  labels: "tag",
  actions: "settings",
};

type AdminScheduleHeaderLabelProps = {
  column: AdminScheduleColumnKey;
  label: string;
  className?: string;
};

function AdminScheduleHeaderLabel({ column, label, className }: AdminScheduleHeaderLabelProps) {
  return (
    <span
      className={["flex w-full min-w-0 items-center gap-1.5", className].filter(Boolean).join(" ")}
    >
      <DashboardNavIcon name={ICON_BY_COLUMN[column]} className={HEADER_ICON_CLASS} />
      <span className="truncate">{label}</span>
    </span>
  );
}

type ScheduleDateTimeSortIconProps = {
  order: SessionSortOrder;
};

function ScheduleDateTimeSortIcon({ order }: ScheduleDateTimeSortIconProps) {
  const upOpacity =
    order === "date-desc" ? SORT_ICON_MUTED_OPACITY : SORT_ICON_ACTIVE_OPACITY;
  const downOpacity =
    order === "date-asc" ? SORT_ICON_MUTED_OPACITY : SORT_ICON_ACTIVE_OPACITY;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={HEADER_ICON_CLASS}
      aria-hidden
    >
      <path d="M8 10l4-4 4 4" opacity={upOpacity} />
      <path d="M8 14l4 4 4-4" opacity={downOpacity} />
    </svg>
  );
}

type AdminScheduleDateTimeSortHeaderProps = {
  label: string;
  sortOrder: SessionSortOrder;
  onSort: () => void;
};

function AdminScheduleDateTimeSortHeader({
  label,
  sortOrder,
  onSort,
}: AdminScheduleDateTimeSortHeaderProps) {
  const tSort = useTranslations("listSort");
  const isDateSort = sortOrder === "date-asc" || sortOrder === "date-desc";
  const ariaSort = sortOrder === "date-asc" ? "ascending" : sortOrder === "date-desc" ? "descending" : "none";
  const sortLabel =
    sortOrder === "date-asc"
      ? tSort("dateAsc")
      : sortOrder === "date-desc"
        ? tSort("dateDesc")
        : tSort("sort");

  return (
    <button
      type="button"
      role="columnheader"
      className={`${SORT_HEADER_BUTTON_CLASS} ${ADMIN_SCHEDULE_SESSIONS_LIST_DATE_TIME_HEADER_CELL}`}
      onClick={onSort}
      aria-sort={ariaSort}
      aria-label={`${label}, ${sortLabel}`}
    >
      <ScheduleDateTimeSortIcon order={sortOrder} />
      <span className="truncate">{label}</span>
      {isDateSort ? (
        <span className="sr-only">{sortLabel}</span>
      ) : null}
    </button>
  );
}

type AdminScheduleSessionsListHeaderProps = {
  sortOrder: SessionSortOrder;
  onDateTimeSort: () => void;
};

/** Desktop column headers for the admin schedule sessions list. */
export function AdminScheduleSessionsListHeader({
  sortOrder,
  onDateTimeSort,
}: AdminScheduleSessionsListHeaderProps) {
  const t = useTranslations("adminPages.classes");

  return (
    <>
      <AdminScheduleHeaderLabel column="class" label={t("colClass")} />
      <AdminScheduleDateTimeSortHeader
        label={t("colDateTime")}
        sortOrder={sortOrder}
        onSort={onDateTimeSort}
      />
      <AdminScheduleHeaderLabel
        column="coach"
        label={t("colCoach")}
        className={ADMIN_SCHEDULE_SESSIONS_LIST_EMPHASIZED_HEADER}
      />
      <span aria-hidden="true" />
      <AdminScheduleHeaderLabel
        column="capacity"
        label={t("colCapacity")}
        className={ADMIN_SCHEDULE_SESSIONS_LIST_EMPHASIZED_HEADER}
      />
      <AdminScheduleHeaderLabel
        column="labels"
        label={t("colTags")}
        className={ADMIN_SCHEDULE_SESSIONS_LIST_TAGS_HEADER_CELL}
      />
      <AdminScheduleHeaderLabel
        column="actions"
        label={t("colActions")}
        className={`${ADMIN_SCHEDULE_SESSIONS_LIST_ACTIONS_HEADER_CELL} justify-end`}
      />
    </>
  );
}
