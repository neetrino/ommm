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

export const USER_LIST_CELL_CLASS =
  "min-w-0 w-full max-w-full overflow-hidden justify-self-stretch text-left";

/** Wraps primary title/name content so ellipsis stays inside the grid column. */
export const USER_LIST_TITLE_CELL_CLASS = USER_LIST_CELL_CLASS;

/** Primary serif title in user account lists. */
export const USER_LIST_TITLE_SERIF_CLASS =
  "block w-full min-w-0 truncate font-serif text-xl leading-snug tracking-tight text-sage-950";

export const USER_LIST_DATE_CELL = USER_LIST_CELL_CLASS;

export const USER_LIST_CLASS_CELL = USER_LIST_CELL_CLASS;

export const USER_LIST_TIME_CELL = USER_LIST_CELL_CLASS;

export const USER_LIST_COACH_CELL = USER_LIST_CELL_CLASS;

/** Flexible spacer between trailing data columns and edge actions. */
export const USER_LIST_SPACER_CELL = "hidden min-w-0 md:block";

export const USER_LIST_SPOTS_CELL = USER_LIST_CELL_CLASS;

export const USER_LIST_STATUS_CELL = USER_LIST_CELL_CLASS;

/** Right-aligned trailing column (status, actions, method). */
export const USER_LIST_TRAILING_CELL =
  "min-w-0 justify-self-end text-right md:self-center";

export const USER_LIST_TRAILING_HEADER_CELL = "justify-self-end text-right";

export const USER_LIST_ACTIONS_CELL =
  "flex shrink-0 justify-self-end md:items-center md:justify-end md:self-center";

/** Date · Class · Time · Coach · Spots · ⟨flex⟩ · Actions */
export const USER_SCHEDULE_LIST_GRID_COLS =
  "md:grid-cols-[3.25rem_minmax(0,11rem)_minmax(10rem,auto)_minmax(8rem,auto)_auto_1fr_auto]";

/** Date · Class · Time · Status · ⟨flex⟩ · Actions */
export const USER_BOOKINGS_LIST_GRID_COLS =
  "md:grid-cols-[3.25rem_minmax(0,11rem)_minmax(10rem,auto)_auto_1fr_auto]";

/** Item · Amount · Date · Time · Status · Method */
export const USER_PAYMENTS_LIST_GRID_COLS =
  "minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto_auto";

/** Package · Validity · Price · Sessions · Period · Status · ⟨flex⟩ · Actions */
export const USER_PACKAGES_LIST_GRID_COLS =
  "minmax(0,1fr)_minmax(0,0.85fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto_1fr_auto";

export const USER_LIST_TABLE_GRID_GAP = "md:gap-x-4";

/** Row/header participates in the parent list grid columns. */
export const USER_LIST_TABLE_SUBGRID_ROW = "col-span-full grid grid-cols-subgrid";

export const USER_LIST_DETAILS_CELL =
  "shrink-0 text-xs font-medium uppercase tracking-[0.08em] text-sand-600 md:justify-self-end";

export const USER_LIST_ROW_INTERACTIVE =
  "cursor-pointer transition-[background-color,box-shadow,border-color,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper active:scale-[0.998]";
