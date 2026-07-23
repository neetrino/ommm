import {
  ADMIN_LIST_EMPHASIZED_HEADER,
  ADMIN_LIST_ROW_CLASS,
  ADMIN_LIST_ROW_SURFACE,
  USER_LIST_ACTIONS_CELL,
  USER_LIST_CELL_CLASS,
  USER_LIST_DATE_CELL,
  USER_LIST_SPACER_CELL,
  USER_LIST_TRAILING_CELL,
  USER_LIST_TRAILING_HEADER_CELL,
  buildAdminListHeaderClass,
  USER_LIST_TABLE_GRID_GAP,
  USER_LIST_TABLE_ROW_PAD,
} from "@/components/admin/admin-list-table-layout";
import scheduleListLayoutStyles from "@/components/shared/schedule/schedule-sessions-list-layout.module.css";

export type ScheduleSessionsListPreset = "admin" | "staffReadOnly" | "staffWithCoach";

const PRESET_TABLE_GRID_CLASS: Record<ScheduleSessionsListPreset, string> = {
  admin: scheduleListLayoutStyles.tableAdmin,
  staffReadOnly: scheduleListLayoutStyles.tableStaffReadOnly,
  staffWithCoach: scheduleListLayoutStyles.tableStaffWithCoach,
};

const READ_ONLY_ROW_CLASS = [
  ADMIN_LIST_ROW_SURFACE,
  "grid w-full grid-cols-1 gap-3 text-left",
  USER_LIST_TABLE_ROW_PAD,
  "md:col-span-full md:grid md:grid-cols-subgrid md:items-center md:gap-y-0",
].join(" ");

function buildScheduleSessionsListTableClass(preset: ScheduleSessionsListPreset): string {
  return [
    "max-md:space-y-3",
    "md:grid",
    PRESET_TABLE_GRID_CLASS[preset],
    USER_LIST_TABLE_GRID_GAP,
    "md:gap-y-3",
  ].join(" ");
}

export type ScheduleSessionsListLayout = {
  tableClass: string;
  headerClass: string;
  rowClass: string;
  cellClass: string;
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
};

export function getScheduleSessionsListLayout(
  preset: ScheduleSessionsListPreset,
): ScheduleSessionsListLayout {
  const isStaffReadOnly = preset === "staffReadOnly";

  return {
    tableClass: buildScheduleSessionsListTableClass(preset),
    headerClass: buildAdminListHeaderClass(),
    rowClass: preset === "admin" ? ADMIN_LIST_ROW_CLASS : READ_ONLY_ROW_CLASS,
    cellClass: USER_LIST_CELL_CLASS,
    dateTimeCellClass: isStaffReadOnly ? USER_LIST_DATE_CELL : `${USER_LIST_DATE_CELL} md:pl-6`,
    dateTimeHeaderCellClass: isStaffReadOnly
      ? ADMIN_LIST_EMPHASIZED_HEADER
      : `${ADMIN_LIST_EMPHASIZED_HEADER} md:pl-6`,
    capacityCellClass: isStaffReadOnly
      ? `${USER_LIST_CELL_CLASS} tabular-nums md:justify-self-stretch`
      : `${USER_LIST_CELL_CLASS} tabular-nums md:min-w-[14rem] md:justify-self-stretch`,
    levelCellClass: `${USER_LIST_CELL_CLASS} flex flex-wrap items-center gap-1.5 md:justify-self-stretch`,
    levelHeaderCellClass: ADMIN_LIST_EMPHASIZED_HEADER,
    tagsCellClass: `${USER_LIST_CELL_CLASS} flex flex-wrap items-center gap-1.5 md:justify-self-stretch`,
    tagsHeaderCellClass: ADMIN_LIST_EMPHASIZED_HEADER,
    statusCellClass: `${USER_LIST_TRAILING_CELL} md:justify-self-end`,
    statusHeaderCellClass: `${ADMIN_LIST_EMPHASIZED_HEADER} ${USER_LIST_TRAILING_HEADER_CELL}`,
    coachCellClass: USER_LIST_CELL_CLASS,
    actionsCellClass: USER_LIST_ACTIONS_CELL,
    actionsHeaderCellClass: USER_LIST_TRAILING_HEADER_CELL,
    spacerCellClass: USER_LIST_SPACER_CELL,
    emphasizedHeaderClass: ADMIN_LIST_EMPHASIZED_HEADER,
  };
}
