/** Shared list-table spacing and cell styles for user account pages. */
export const USER_LIST_TABLE_ROW_PAD = "px-4 py-2.5";

export const USER_LIST_TABLE_HEADER_PAD = "px-4 py-2.5";

export const USER_LIST_TABLE_HEADER_TEXT =
  "text-left text-xs font-semibold uppercase tracking-[0.08em] text-sage-500";

export const USER_LIST_CELL_CLASS = "min-w-0 justify-self-start text-left";

export const USER_LIST_DATE_CELL = USER_LIST_CELL_CLASS;

export const USER_LIST_CLASS_CELL = USER_LIST_CELL_CLASS;

export const USER_LIST_TIME_CELL = USER_LIST_CELL_CLASS;

/** Flexible spacer — pushes trailing columns to the right edge. */
export const USER_LIST_SPACER_CELL = "hidden min-w-0 md:block";

export const USER_LIST_SPOTS_CELL = USER_LIST_CELL_CLASS;

export const USER_LIST_STATUS_CELL = USER_LIST_CELL_CLASS;

export const USER_LIST_ACTIONS_CELL =
  "flex shrink-0 justify-self-end md:items-center md:justify-end md:self-center";

/** Date · Class · Time · ⟨flex⟩ · Spots · Actions */
export const USER_SCHEDULE_LIST_GRID_COLS =
  "md:grid-cols-[3.25rem_minmax(0,11rem)_minmax(10rem,auto)_1fr_5.75rem_auto]";

/** Date · Class · Time · ⟨flex⟩ · Status */
export const USER_BOOKINGS_LIST_GRID_COLS =
  "md:grid-cols-[3.25rem_minmax(0,11rem)_minmax(10rem,auto)_1fr_5.5rem]";

export const USER_LIST_TABLE_GRID_GAP = "md:gap-x-4";
