/**
 * Home page scroll-reveal — row stagger columns aligned with card grids.
 */

export const HOME_PAGE_SCROLL_REVEAL = {
  /** Class/practice cards — desktop row max (Figma 3-up). */
  classCardsGridColumns: 3,
  /** Package plan cards — desktop row of three. */
  planCardsGridColumns: 3,
  /** Section blocks (header, CTA, carousel shell) — no row stagger. */
  sectionGridColumns: 1,
} as const;
