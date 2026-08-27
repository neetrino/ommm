import {
  ADMIN_CARD_CONTAIN_CLASS,
  ADMIN_LIST_EMPHASIZED_HEADER,
  ADMIN_LIST_ROW_SURFACE,
  USER_LIST_ACTIONS_CELL,
  USER_LIST_CELL_CLASS,
  USER_LIST_DATE_CELL,
  USER_LIST_SPACER_CELL,
  USER_LIST_TRAILING_CELL,
  USER_LIST_TRAILING_HEADER_CELL,
  buildAdminListHeaderClass,
  USER_LIST_TABLE_GRID_GAP,
} from "@/components/admin/admin-list-table-layout";
import { USER_LIST_ROW_INTERACTIVE } from "@/components/account/user-list-table-layout";
import scheduleListLayoutStyles from "@/components/shared/schedule/schedule-sessions-list-layout.module.css";

const SCHEDULE_LIST_ROW_PAD = "max-md:px-4 max-md:pb-4 max-md:pt-5 md:px-6 md:py-5";

export type ScheduleSessionsListPreset = "admin" | "staffReadOnly" | "staffWithCoach";

const PRESET_TABLE_GRID_CLASS: Record<ScheduleSessionsListPreset, string> = {
  admin: scheduleListLayoutStyles.tableAdmin,
  staffReadOnly: scheduleListLayoutStyles.tableStaffReadOnly,
  staffWithCoach: scheduleListLayoutStyles.tableStaffWithCoach,
};

function buildScheduleSessionsListRowClass(preset: ScheduleSessionsListPreset): string {
  return [
    ADMIN_LIST_ROW_SURFACE,
    preset === "admin" ? USER_LIST_ROW_INTERACTIVE : "",
    "group relative overflow-x-visible overflow-y-visible",
    "grid w-full max-md:gap-3 text-left",
    SCHEDULE_LIST_ROW_PAD,
    "max-md:bg-gradient-to-br max-md:from-white max-md:via-white max-md:to-sand-100/40",
    "md:col-span-full md:grid md:grid-cols-subgrid md:items-center md:gap-y-0",
    scheduleListLayoutStyles.row,
    preset === "admin" ? scheduleListLayoutStyles.rowWithActions : "",
    preset === "staffWithCoach" ? scheduleListLayoutStyles.rowWithStatus : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function buildScheduleSessionsListTableClass(preset: ScheduleSessionsListPreset): string {
  return [
    ADMIN_CARD_CONTAIN_CLASS,
    "max-md:space-y-3",
    "md:grid",
    PRESET_TABLE_GRID_CLASS[preset],
    USER_LIST_TABLE_GRID_GAP,
    "md:gap-y-4",
  ].join(" ");
}

export type ScheduleSessionsListLayout = {
  tableClass: string;
  headerClass: string;
  rowClass: string;
  cellClass: string;
  selectCellClass: string;
  dateTimeCellClass: string;
  dateTimeHeaderCellClass: string;
  capacityCellClass: string;
  levelCellClass: string;
  levelHeaderCellClass: string;
  tagsCellClass: string;
  tagsHeaderCellClass: string;
  statusCellClass: string;
  statusHeaderCellClass: string;
  coachCellClass: string;
  actionsCellClass: string;
  actionsHeaderCellClass: string;
  spacerCellClass: string;
  emphasizedHeaderClass: string;
  classAreaClass: string;
  datetimeAreaClass: string;
  capacityAreaClass: string;
  coachAreaClass: string;
  actionsAreaClass: string;
  statusAreaClass: string;
  tagsAreaClass: string;
  titleClass: string;
  subtitleClass: string;
};

export function getScheduleSessionsListLayout(
  preset: ScheduleSessionsListPreset,
): ScheduleSessionsListLayout {
  const isStaffReadOnly = preset === "staffReadOnly";
  const selectCellClass =
    "flex items-center max-md:absolute max-md:left-3 max-md:top-3 max-md:z-10 md:justify-center";

  return {
    tableClass: buildScheduleSessionsListTableClass(preset),
    headerClass: buildAdminListHeaderClass(),
    rowClass: buildScheduleSessionsListRowClass(preset),
    cellClass: USER_LIST_CELL_CLASS,
    selectCellClass,
    dateTimeCellClass: isStaffReadOnly
      ? `${USER_LIST_DATE_CELL} overflow-visible`
      : `${USER_LIST_DATE_CELL} overflow-visible md:pl-6`,
    dateTimeHeaderCellClass: isStaffReadOnly
      ? ADMIN_LIST_EMPHASIZED_HEADER
      : `${ADMIN_LIST_EMPHASIZED_HEADER} md:pl-6`,
    capacityCellClass: `${USER_LIST_CELL_CLASS} tabular-nums md:justify-self-stretch`,
    levelCellClass: `${USER_LIST_CELL_CLASS} flex flex-wrap items-center gap-1.5 md:justify-self-stretch`,
    levelHeaderCellClass: ADMIN_LIST_EMPHASIZED_HEADER,
    tagsCellClass: `${USER_LIST_CELL_CLASS} flex flex-wrap items-center gap-1.5 md:justify-self-stretch`,
    tagsHeaderCellClass: ADMIN_LIST_EMPHASIZED_HEADER,
    statusCellClass: `${USER_LIST_TRAILING_CELL} md:justify-self-end`,
    statusHeaderCellClass: `${ADMIN_LIST_EMPHASIZED_HEADER} ${USER_LIST_TRAILING_HEADER_CELL}`,
    coachCellClass: USER_LIST_CELL_CLASS,
    actionsCellClass: USER_LIST_ACTIONS_CELL,
    actionsHeaderCellClass: USER_LIST_TRAILING_HEADER_CELL,
    spacerCellClass: `${USER_LIST_SPACER_CELL} ${scheduleListLayoutStyles.spacer}`,
    emphasizedHeaderClass: ADMIN_LIST_EMPHASIZED_HEADER,
    classAreaClass: scheduleListLayoutStyles.classArea,
    datetimeAreaClass: scheduleListLayoutStyles.datetime,
    capacityAreaClass: scheduleListLayoutStyles.capacity,
    coachAreaClass: `${scheduleListLayoutStyles.coach} max-md:hidden`,
    actionsAreaClass: scheduleListLayoutStyles.actions,
    statusAreaClass: scheduleListLayoutStyles.status,
    tagsAreaClass: scheduleListLayoutStyles.tags,
    titleClass: "text-lg font-semibold leading-snug break-words text-sage-900",
    subtitleClass: "mt-1 text-sm leading-snug text-sage-600",
  };
}
