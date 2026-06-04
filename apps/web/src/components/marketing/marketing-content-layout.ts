/**
 * Horizontal content box shared by marketing header and inner pages (not home).
 * Matches `.ommm-container` in `globals.css`.
 */
export const MARKETING_CONTENT_MAX_WIDTH_PX = 1280;

/** Total horizontal margin on the content box (`calc(100% - 2rem)`). */
export const MARKETING_CONTENT_INLINE_MARGIN = "2rem";

/** Single-edge viewport inset — matches `ommm-container` margin. */
export const MARKETING_CONTENT_INLINE_INSET = "1rem";

/** Menu stroke inset inside 35×35 artboard (visible hamburger, not 35px hit box). */
export const MARKETING_HEADER_MENU_OPTICAL_INSET_START_PX = 7.5;

export const MARKETING_PAGE_CONTAINER_CLASS = "ommm-container";

/** Inner routes — `ommm-container` + optical padding (`marketing-inner-page-align.module.css`). */
export const MARKETING_INNER_PAGE_CONTAINER_CLASS =
  "ommm-container marketing-inner-page-container";

/** Full-width block inside the inner page container. */
export const MARKETING_PAGE_CONTENT_WIDTH_CLASS = "marketing-inner-page-content";
