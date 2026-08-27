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

/** Board scroll — native bars hidden; drag or chevron edge zones navigate horizontally. */
export const SCHEDULE_WEEK_HORIZONTAL_SCROLL_CLASS =
  "cursor-grab touch-pan-x overflow-x-auto overflow-y-auto overscroll-contain select-none active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

export const SCHEDULE_WEEK_SCROLL_SPEED_PX = 6;

export const SCHEDULE_WEEK_EDGE_ZONE_WIDTH_PX = 48;

/** Minimum column width for month board (fixed; always scrolls horizontally). */
export const SCHEDULE_MONTH_COLUMN_MIN_WIDTH_PX = 188;

/**
 * Week/month board fills remaining viewport so the date strip can stay pinned
 * while only session cards scroll vertically.
 */
export const SCHEDULE_BOARD_VIEWPORT_HEIGHT_CLASS = "h-[calc(100dvh-20rem)]";

/** @deprecated Prefer {@link SCHEDULE_BOARD_VIEWPORT_HEIGHT_CLASS}. */
export const SCHEDULE_MONTH_BOARD_MIN_HEIGHT_CLASS = SCHEDULE_BOARD_VIEWPORT_HEIGHT_CLASS;

/** Past-day week/month cards — muted so history reads apart from upcoming. */
export const SCHEDULE_PAST_WEEK_CARD_CLASS = [
  "border border-sage-300/45 bg-sage-200/55",
  "shadow-[0_12px_32px_-28px_rgba(45,40,35,0.2)]",
  "hover:border-sage-300/60 hover:bg-sage-200/65",
].join(" ");

/** Past-day list rows — overrides the shared white surface. */
export const SCHEDULE_PAST_LIST_ROW_CLASS =
  "!border-sage-300/40 !bg-sage-200/50 hover:!bg-sage-200/65 hover:!border-sage-300/55";

