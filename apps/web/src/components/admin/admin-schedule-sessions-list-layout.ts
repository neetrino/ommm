import { getScheduleSessionsListLayout } from "@/components/shared/schedule/schedule-sessions-list-layout";

const adminLayout = getScheduleSessionsListLayout("admin");

export const ADMIN_SCHEDULE_SESSIONS_LIST_TABLE_CLASS = adminLayout.tableClass;

export const ADMIN_SCHEDULE_SESSIONS_LIST_HEADER_CLASS = adminLayout.headerClass;

export const ADMIN_SCHEDULE_SESSIONS_LIST_ROW_CLASS = adminLayout.rowClass;

export const ADMIN_SCHEDULE_SESSIONS_LIST_CELL = adminLayout.cellClass;

export const ADMIN_SCHEDULE_SESSIONS_LIST_SELECT_CELL = adminLayout.selectCellClass;

export const ADMIN_SCHEDULE_SESSIONS_LIST_DATE_TIME_CELL = adminLayout.dateTimeCellClass;

export const ADMIN_SCHEDULE_SESSIONS_LIST_DATE_TIME_HEADER_CELL =
  adminLayout.dateTimeHeaderCellClass;

export const ADMIN_SCHEDULE_SESSIONS_LIST_TAGS_CELL = adminLayout.tagsCellClass;

export const ADMIN_SCHEDULE_SESSIONS_LIST_TAGS_HEADER_CELL = adminLayout.tagsHeaderCellClass;

export const ADMIN_SCHEDULE_SESSIONS_LIST_CAPACITY_CELL = adminLayout.capacityCellClass;

export const ADMIN_SCHEDULE_SESSIONS_LIST_ACTIONS_CELL = adminLayout.actionsCellClass;

export const ADMIN_SCHEDULE_SESSIONS_LIST_ACTIONS_HEADER_CELL =
  adminLayout.actionsHeaderCellClass;

export const ADMIN_SCHEDULE_SESSIONS_LIST_SPACER_CELL = adminLayout.spacerCellClass;

export const ADMIN_SCHEDULE_SESSIONS_LIST_EMPHASIZED_HEADER =
  adminLayout.emphasizedHeaderClass;
