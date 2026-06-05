/** Shared grid for user Schedule list view — header and rows must match exactly. */
export const USER_SCHEDULE_LIST_GRID_COLS =
  "md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)_minmax(0,1.45fr)_minmax(0,1fr)_auto]";

export const USER_SCHEDULE_LIST_HEADER_CLASS = [
  "hidden border-b border-white/70 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-sage-500",
  "md:grid",
  USER_SCHEDULE_LIST_GRID_COLS,
  "md:items-end md:gap-x-4",
].join(" ");

export const USER_SCHEDULE_LIST_ROW_CLASS = [
  "grid w-full grid-cols-1 gap-4 px-4 py-4 text-left",
  USER_SCHEDULE_LIST_GRID_COLS,
  "md:items-start md:gap-x-4 md:gap-y-0",
].join(" ");

export const USER_SCHEDULE_LIST_CELL_CLASS = "min-w-0 justify-self-start text-left";

export const USER_SCHEDULE_LIST_ACTIONS_CLASS =
  "flex shrink-0 justify-self-end md:items-center md:justify-end md:self-center";
