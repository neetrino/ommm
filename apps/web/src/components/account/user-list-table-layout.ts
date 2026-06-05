/** Shared list-table spacing and cell styles for user account pages. */
export const USER_LIST_TABLE_ROW_PAD = "px-5 py-4";

export const USER_LIST_TABLE_HEADER_PAD = "px-5 py-3";

export const USER_LIST_TABLE_HEADER_TEXT =
  "text-left text-xs font-semibold uppercase tracking-[0.08em] text-sage-500";

/** Card surface — matches board view row styling. */
export const USER_LIST_ROW_CARD = [
  "rounded-[24px] border border-white/80 bg-white/95",
  "shadow-[0_22px_54px_-34px_rgba(45,40,35,0.34)]",
  "transition-all hover:border-white hover:shadow-[0_28px_64px_-34px_rgba(45,40,35,0.4)]",
].join(" ");

export const USER_LIST_HEADER_SURFACE = [
  "rounded-[20px] border border-white/60 bg-white/55 backdrop-blur-sm",
].join(" ");

export const USER_LIST_STACK_CLASS = "space-y-3";

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

/** Date · Class · Time · Spots · ⟨flex⟩ · Actions */
export const USER_SCHEDULE_LIST_GRID_COLS =
  "md:grid-cols-[3.25rem_minmax(0,11rem)_minmax(10rem,auto)_5.75rem_1fr_auto]";

/** Date · Class · Time · Status · ⟨flex⟩ · Actions */
export const USER_BOOKINGS_LIST_GRID_COLS =
  "md:grid-cols-[3.25rem_minmax(0,11rem)_minmax(10rem,auto)_5.5rem_1fr_auto]";

export const USER_LIST_TABLE_GRID_GAP = "md:gap-x-4";
