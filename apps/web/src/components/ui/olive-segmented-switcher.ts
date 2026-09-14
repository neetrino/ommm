/** Shared olive segmented pill switcher (bookings, finance, analytics, settings, gift cards). */

export type OliveSegmentedColumnCount = 2 | 3 | 4 | 5 | 7;

/** Track surface behind the inactive segments. */
export type OliveSegmentedSurface = "muted" | "white";

const OLIVE_SEGMENTED_TRACK_BASE =
  "relative inline-grid w-max shrink-0 rounded-full p-1";

const TRACK_SURFACE: Record<OliveSegmentedSurface, string> = {
  muted: "bg-[#f0efed]",
  white: "bg-white",
};

const OLIVE_SEGMENTED_HUG_TRACK = `relative shrink-0 rounded-full ${TRACK_SURFACE.muted} p-1`;

const OLIVE_SEGMENTED_THUMB_BASE = [
  "pointer-events-none absolute inset-y-1 left-1 rounded-full",
  "bg-[var(--ommm-admin-olive)] shadow-sm",
  "transition-transform duration-300 ease-out motion-reduce:transition-none",
].join(" ");

const OLIVE_SEGMENTED_SEGMENT_BASE = [
  "relative z-10 inline-flex cursor-pointer items-center justify-center",
  "rounded-full font-semibold no-underline",
  "transition-colors duration-300 ease-out motion-reduce:transition-none",
  "active:scale-[0.985]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ommm-admin-olive)]/40",
  "focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
].join(" ");

const SEGMENT_SIZE_COMFORTABLE = "min-w-[6.75rem] whitespace-nowrap px-5 py-2.5 text-sm";
const SEGMENT_SIZE_COMPACT = "min-w-0 whitespace-nowrap px-3 py-2.5 text-sm";

const TRACK_BY_COLUMNS: Record<OliveSegmentedColumnCount, string> = {
  2: `${OLIVE_SEGMENTED_TRACK_BASE} grid-cols-2`,
  3: `${OLIVE_SEGMENTED_TRACK_BASE} grid-cols-3`,
  4: `${OLIVE_SEGMENTED_TRACK_BASE} grid-cols-4`,
  5: `${OLIVE_SEGMENTED_TRACK_BASE} grid-cols-5`,
  7: `${OLIVE_SEGMENTED_TRACK_BASE} grid-cols-7`,
};

const THUMB_WIDTH_BY_COLUMNS: Record<OliveSegmentedColumnCount, string> = {
  2: "w-[calc(50%-0.25rem)]",
  3: "w-[calc((100%-0.5rem)/3)]",
  4: "w-[calc((100%-0.5rem)/4)]",
  5: "w-[calc((100%-0.5rem)/5)]",
  7: "w-[calc((100%-0.5rem)/7)]",
};

/** Tailwind translate steps — index × thumb width. */
const THUMB_TRANSLATE_BY_INDEX = [
  "translate-x-0",
  "translate-x-full",
  "translate-x-[200%]",
  "translate-x-[300%]",
  "translate-x-[400%]",
  "translate-x-[500%]",
  "translate-x-[600%]",
] as const;

const COMPACT_COLUMN_THRESHOLD = 4;

export function oliveSegmentedTrackClass(
  columnCount: OliveSegmentedColumnCount,
  className = "",
  surface: OliveSegmentedSurface = "muted",
): string {
  return `${TRACK_BY_COLUMNS[columnCount]} ${TRACK_SURFACE[surface]} ${className}`.trim();
}

export function oliveSegmentedThumbClass(
  columnCount: OliveSegmentedColumnCount,
  activeIndex: number,
): string {
  const translate =
    THUMB_TRANSLATE_BY_INDEX[activeIndex] ?? THUMB_TRANSLATE_BY_INDEX[0];
  return `${OLIVE_SEGMENTED_THUMB_BASE} ${THUMB_WIDTH_BY_COLUMNS[columnCount]} ${translate}`;
}

export function oliveSegmentedSegmentClassName(
  active: boolean,
  columnCount: OliveSegmentedColumnCount = 2,
): string {
  const size =
    columnCount >= COMPACT_COLUMN_THRESHOLD
      ? SEGMENT_SIZE_COMPACT
      : SEGMENT_SIZE_COMFORTABLE;
  const tone = active
    ? "text-[var(--ommm-admin-cream)]"
    : "text-sage-800";
  return `${OLIVE_SEGMENTED_SEGMENT_BASE} ${size} ${tone}`;
}

const FILL_TRACK_BY_COLUMNS: Record<OliveSegmentedColumnCount, string> = {
  2: "relative grid w-full max-w-full shrink-0 grid-cols-2 rounded-full p-1",
  3: "relative grid w-full max-w-full shrink-0 grid-cols-3 rounded-full p-1",
  4: "relative grid w-full max-w-full shrink-0 grid-cols-4 rounded-full p-1",
  5: "relative grid w-full max-w-full shrink-0 grid-cols-5 rounded-full p-1",
  7: "relative grid w-full max-w-full shrink-0 grid-cols-7 rounded-full p-1",
};

/** Full-width equal columns (mobile language switcher). */
export function oliveSegmentedFillTrackClass(
  columnCount: OliveSegmentedColumnCount,
  className = "",
  surface: OliveSegmentedSurface = "muted",
): string {
  return `${FILL_TRACK_BY_COLUMNS[columnCount]} ${TRACK_SURFACE[surface]} ${className}`.trim();
}

/** Segment that shares remaining width in a fill track. */
export function oliveSegmentedFillSegmentClassName(active: boolean): string {
  const tone = active
    ? "text-[var(--ommm-admin-cream)]"
    : "text-sage-800";
  return `${OLIVE_SEGMENTED_SEGMENT_BASE} min-w-0 w-full whitespace-nowrap px-2 py-2.5 text-sm ${tone}`;
}

export type OliveSegmentedHugDensity = "default" | "compact";

const HUG_TRACK_WIDTH: Record<OliveSegmentedHugDensity, string> = {
  default: "inline-flex w-max",
  /**
   * Client 7-tab set: default hug + scroll on phone; fill the row from tablet up.
   */
  compact:
    "inline-flex w-max max-w-none flex-nowrap items-center gap-0.5 min-[744px]:flex min-[744px]:w-full min-[744px]:max-w-full min-[744px]:justify-between",
};

const HUG_SEGMENT_SIZE: Record<OliveSegmentedHugDensity, string> = {
  default: "min-w-0 shrink-0 whitespace-nowrap px-7 py-2.5 text-sm",
  /** Phone matches default switchers; tablet+ keeps the tighter client sheet sizing. */
  compact:
    "min-w-0 shrink-0 whitespace-nowrap px-7 py-2.5 text-sm min-[744px]:px-2 min-[744px]:py-2.5 min-[744px]:text-sm",
};

/** Flex track — each segment hugs its label (settings and other long tab sets). */
export function oliveSegmentedHugTrackClass(
  className = "",
  density: OliveSegmentedHugDensity = "default",
): string {
  return `${OLIVE_SEGMENTED_HUG_TRACK} ${HUG_TRACK_WIDTH[density]} ${className}`.trim();
}

/** Segment for hug track — padding only, no equal min-width. */
export function oliveSegmentedHugSegmentClassName(
  active: boolean,
  density: OliveSegmentedHugDensity = "default",
): string {
  const tone = active
    ? "text-[var(--ommm-admin-cream)]"
    : "text-sage-800";
  return [
    OLIVE_SEGMENTED_SEGMENT_BASE,
    HUG_SEGMENT_SIZE[density],
    tone,
  ].join(" ");
}
