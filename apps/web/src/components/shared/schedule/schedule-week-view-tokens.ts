/** Full week board: today through the next six days. */
export const SCHEDULE_WEEK_DAY_COUNT = 7;

/** Past days included on the week board so staff can scroll left like month. */
export const SCHEDULE_WEEK_PAST_DAYS = 28;

/** Minimum column width before the week board scrolls horizontally. */
export const SCHEDULE_WEEK_COLUMN_MIN_WIDTH_PX = 168;

/** @deprecated Prefer {@link SCHEDULE_WEEK_COLUMN_MIN_WIDTH_PX}; kept for track width calc. */
export const SCHEDULE_WEEK_COLUMN_WIDTH_PX = SCHEDULE_WEEK_COLUMN_MIN_WIDTH_PX;

export const SCHEDULE_WEEK_COLUMN_GAP_PX = 12;

export const SCHEDULE_WEEK_COLUMN_GAP_CLASS = "gap-3";

/** Horizontal board scroll — native bar hidden; chevron edge zones navigate. */
export const SCHEDULE_WEEK_HORIZONTAL_SCROLL_CLASS =
  "overflow-x-auto overflow-y-visible scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

export const SCHEDULE_WEEK_SCROLL_SPEED_PX = 6;

export const SCHEDULE_WEEK_EDGE_ZONE_WIDTH_PX = 48;

/** Minimum column width for month board (fixed; always scrolls horizontally). */
export const SCHEDULE_MONTH_COLUMN_MIN_WIDTH_PX = 188;

/**
 * Month board stretches to remaining viewport height (below shell/hero/summary/nav)
 * so empty day columns feel full-height before the page scrolls vertically.
 */
export const SCHEDULE_MONTH_BOARD_MIN_HEIGHT_CLASS = "min-h-[calc(100dvh-20rem)]";

