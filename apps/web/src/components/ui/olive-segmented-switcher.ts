/** Shared olive segmented pill switcher (bookings, finance, analytics, settings, gift cards). */

export type OliveSegmentedColumnCount = 2 | 3 | 4 | 5 | 7;

const OLIVE_SEGMENTED_TRACK_BASE =
  "relative inline-grid w-max shrink-0 rounded-full bg-[#f0efed] p-1";

const OLIVE_SEGMENTED_THUMB_BASE = [
  "pointer-events-none absolute inset-y-1 left-1 rounded-full",
  "bg-[var(--ommm-admin-olive)] shadow-sm",
  "transition-transform duration-300 ease-out motion-reduce:transition-none",
].join(" ");

const OLIVE_SEGMENTED_SEGMENT_BASE = [
  "relative z-10 inline-flex cursor-pointer items-center justify-center",
  "rounded-full text-sm font-semibold no-underline",
  "transition-colors duration-300 ease-out motion-reduce:transition-none",
  "active:scale-[0.985]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ommm-admin-olive)]/40",
  "focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
].join(" ");

const SEGMENT_SIZE_COMFORTABLE = "min-w-[6.75rem] whitespace-nowrap px-5 py-2.5";
const SEGMENT_SIZE_COMPACT = "min-w-0 whitespace-nowrap px-3 py-2.5";

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
): string {
  return `${TRACK_BY_COLUMNS[columnCount]} ${className}`.trim();
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
