import {
  ADMIN_LIST_EMPHASIZED_HEADER,
  ADMIN_LIST_ROW_CLASS,
  ADMIN_LIST_ROW_SURFACE,
  USER_LIST_ACTIONS_CELL,
  USER_LIST_CELL_CLASS,
  USER_LIST_DATE_CELL,
  USER_LIST_SPACER_CELL,
  USER_LIST_TRAILING_HEADER_CELL,
  buildAdminListHeaderClass,
  buildAdminListTableClass,
  USER_LIST_TABLE_ROW_PAD,
} from "@/components/admin/admin-list-table-layout";

export type ScheduleSessionsListPreset = "admin" | "staffReadOnly";

const PRESET_GRID_CLASS: Record<ScheduleSessionsListPreset, string> = {
  admin:
    "md:grid-cols-[minmax(0,1fr)_minmax(11rem,auto)_minmax(8rem,auto)_minmax(7rem,auto)_minmax(8.5rem,auto)_1fr_auto]",
  staffReadOnly:
    "md:grid-cols-[minmax(0,1fr)_minmax(11rem,auto)_minmax(7rem,auto)_minmax(8.5rem,auto)_minmax(6.5rem,auto)]",
};

const READ_ONLY_ROW_CLASS = [
  ADMIN_LIST_ROW_SURFACE,
  "grid w-full grid-cols-1 gap-3 text-left",
  USER_LIST_TABLE_ROW_PAD,
  "md:col-span-full md:grid md:grid-cols-subgrid md:items-center md:gap-y-0",
].join(" ");

export type ScheduleSessionsListLayout = {
  tableClass: string;
  headerClass: string;
  rowClass: string;
  cellClass: string;
  dateTimeCellClass: string;
  capacityCellClass: string;
  tagsCellClass: string;
  statusCellClass: string;
  coachCellClass: string;
  actionsCellClass: string;
  actionsHeaderCellClass: string;
  spacerCellClass: string;
  emphasizedHeaderClass: string;
};

export function getScheduleSessionsListLayout(
  preset: ScheduleSessionsListPreset,
): ScheduleSessionsListLayout {
  return {
    tableClass: buildAdminListTableClass(PRESET_GRID_CLASS[preset]),
    headerClass: buildAdminListHeaderClass(),
    rowClass: preset === "admin" ? ADMIN_LIST_ROW_CLASS : READ_ONLY_ROW_CLASS,
    cellClass: USER_LIST_CELL_CLASS,
    dateTimeCellClass: USER_LIST_DATE_CELL,
    capacityCellClass: `${USER_LIST_CELL_CLASS} tabular-nums`,
    tagsCellClass: `${USER_LIST_CELL_CLASS} flex flex-wrap items-center gap-1.5`,
    statusCellClass: USER_LIST_CELL_CLASS,
    coachCellClass: USER_LIST_CELL_CLASS,
    actionsCellClass: USER_LIST_ACTIONS_CELL,
    actionsHeaderCellClass: USER_LIST_TRAILING_HEADER_CELL,
    spacerCellClass: USER_LIST_SPACER_CELL,
    emphasizedHeaderClass: ADMIN_LIST_EMPHASIZED_HEADER,
  };
}
