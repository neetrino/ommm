import { parseBirthdayDisplayToIso } from "@/lib/date-display";

export const DATE_SEGMENT_PARTS = ["day", "month", "year"] as const;

export type DateSegmentPart = (typeof DATE_SEGMENT_PARTS)[number];

export type DateSegments = Record<DateSegmentPart, string>;

export const EMPTY_DATE_SEGMENTS: DateSegments = {
  day: "",
  month: "",
  year: "",
};

const SEGMENT_MAX_LENGTH: Record<DateSegmentPart, number> = {
  day: 2,
  month: 2,
  year: 4,
};

/** How many digits this part of a `DD/MM/YYYY` date accepts. */
export function dateSegmentMaxLength(part: DateSegmentPart): number {
  return SEGMENT_MAX_LENGTH[part];
}

/** Splits a stored `YYYY-MM-DD` value into day, month, and year digits. */
export function dateSegmentsFromIso(isoValue: string): DateSegments {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoValue.trim());
  if (match === null) {
    return EMPTY_DATE_SEGMENTS;
  }
  return { day: match[3] ?? "", month: match[2] ?? "", year: match[1] ?? "" };
}

/** Replaces one part. The other parts stay as they are. */
export function replaceDateSegment(
  segments: DateSegments,
  part: DateSegmentPart,
  rawValue: string,
): DateSegments {
  const digits = rawValue.replace(/\D/g, "").slice(0, SEGMENT_MAX_LENGTH[part]);
  return { ...segments, [part]: digits };
}

/**
 * ISO `YYYY-MM-DD` for a complete calendar date.
 * `""` when every part is blank. `null` when the value is incomplete or not a real date.
 */
export function dateSegmentsToIso(segments: DateSegments): string | null {
  const day = segments.day.trim();
  const month = segments.month.trim();
  const year = segments.year.trim();
  if (day === "" && month === "" && year === "") {
    return "";
  }
  if (day.length === 0 || month.length === 0 || year.length !== 4) {
    return null;
  }
  return parseBirthdayDisplayToIso(
    `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`,
  );
}

/** Parses a pasted `DD/MM/YYYY` or `DDMMYYYY` value into separate parts. */
export function dateSegmentsFromPastedText(rawValue: string): DateSegments | null {
  const trimmed = rawValue.trim();
  const slashed = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(trimmed);
  if (slashed !== null) {
    return {
      day: (slashed[1] ?? "").padStart(2, "0"),
      month: (slashed[2] ?? "").padStart(2, "0"),
      year: slashed[3] ?? "",
    };
  }

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length !== 8) {
    return null;
  }
  return {
    day: digits.slice(0, 2),
    month: digits.slice(2, 4),
    year: digits.slice(4, 8),
  };
}

export function nextDateSegment(part: DateSegmentPart): DateSegmentPart | null {
  if (part === "day") {
    return "month";
  }
  if (part === "month") {
    return "year";
  }
  return null;
}

export function previousDateSegment(part: DateSegmentPart): DateSegmentPart | null {
  if (part === "year") {
    return "month";
  }
  if (part === "month") {
    return "day";
  }
  return null;
}
