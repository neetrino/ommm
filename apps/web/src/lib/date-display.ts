import { formatTimeForUi } from "@/lib/format-time-display";
import { utcToStudioCalendarDate } from "@/lib/studio-timezone";

function asDate(value: Date | string): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function studioCalendarParts(date: Date): {
  day: string;
  month: string;
  year: string;
} {
  const [year, month, day] = utcToStudioCalendarDate(date).split("-");
  return { day: day ?? "", month: month ?? "", year: year ?? "" };
}

export function formatDateForUi(value: Date | string): string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return formatIsoDateToUi(trimmed);
    }
  }

  const date = asDate(value);
  if (date === null) {
    return "";
  }
  const { day, month, year } = studioCalendarParts(date);
  return `${day}/${month}/${year}`;
}

/** Compact list date: `06/06/26` (studio calendar for ISO instants). */
export function formatDateCompactForUi(value: Date | string): string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
      if (match !== null) {
        return `${match[3]}/${match[2]}/${match[1].slice(-2)}`;
      }
    }
  }

  const date = asDate(value);
  if (date === null) {
    return "";
  }

  const { day, month, year } = studioCalendarParts(date);
  return `${day}/${month}/${year.slice(-2)}`;
}

export function formatDateTimeForUi(value: Date | string, locale?: string): string {
  const date = asDate(value);
  if (date === null) {
    return "";
  }
  return `${formatDateForUi(date)} ${formatTimeForUi(date, locale)}`;
}

/** Converts an ISO date (`YYYY-MM-DD` or ISO datetime) to `DD/MM/YYYY`. */
export function formatIsoDateToUi(isoValue: string | null | undefined): string {
  if (isoValue === null || isoValue === undefined) {
    return "";
  }
  const trimmed = isoValue.trim();
  if (trimmed === "") {
    return "";
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (match === null) {
    return "";
  }
  return `${match[3]}/${match[2]}/${match[1]}`;
}

/** Formats typed digits into a `DD/MM/YYYY` display value. */
export function formatBirthdayInput(rawValue: string): string {
  const digits = rawValue.replace(/\D/g, "").slice(0, 8);
  if (digits.length === 0) {
    return "";
  }

  const dayRaw = digits.slice(0, 2);
  const monthRaw = digits.slice(2, 4);
  const yearRaw = digits.slice(4, 8);

  const day =
    dayRaw.length < 2
      ? dayRaw
      : String(Math.max(1, Math.min(31, Number(dayRaw)))).padStart(2, "0");

  if (digits.length <= 2) {
    return day;
  }

  const month =
    monthRaw.length < 2
      ? monthRaw
      : String(Math.max(1, Math.min(12, Number(monthRaw)))).padStart(2, "0");

  if (digits.length <= 4) {
    return `${day}/${month}`;
  }

  return `${day}/${month}/${yearRaw}`;
}

/** Splits an `HH:MM` (or partial) value into hour and minute digit groups. */
export function splitTimeInputValue(value: string): { hours: string; minutes: string } {
  const trimmed = value.trim();
  if (trimmed === "") {
    return { hours: "", minutes: "" };
  }

  const colonIndex = trimmed.indexOf(":");
  if (colonIndex === -1) {
    return { hours: trimmed.replace(/\D/g, "").slice(0, 2), minutes: "" };
  }

  return {
    hours: trimmed.slice(0, colonIndex).replace(/\D/g, "").slice(0, 2),
    minutes: trimmed.slice(colonIndex + 1).replace(/\D/g, "").slice(0, 2),
  };
}

/** Combines hour and minute digit groups into an `HH:MM` (or partial) value. */
export function combineTimeInputValue(hours: string, minutes: string): string {
  const hourDigits = hours.replace(/\D/g, "").slice(0, 2);
  const minuteDigits = minutes.replace(/\D/g, "").slice(0, 2);

  if (hourDigits === "" && minuteDigits === "") {
    return "";
  }
  if (minuteDigits === "") {
    return hourDigits.length === 2
      ? String(Math.min(23, Number(hourDigits))).padStart(2, "0")
      : hourDigits;
  }

  const hour =
    hourDigits.length === 2
      ? String(Math.min(23, Number(hourDigits))).padStart(2, "0")
      : hourDigits;
  const minute =
    minuteDigits.length === 2
      ? String(Math.min(59, Number(minuteDigits))).padStart(2, "0")
      : minuteDigits;

  return `${hour}:${minute}`;
}

/**
 * Pads a time value to strict `HH:mm` when both hour and complete minutes are present.
 * Leaves incomplete values unchanged so mid-edit typing stays usable.
 */
export function normalizeTimeInputValue(value: string): string {
  const { hours, minutes } = splitTimeInputValue(value);
  if (hours === "" || minutes.length < 2) {
    return value.trim();
  }

  const hour = String(Math.min(23, Number(hours))).padStart(2, "0");
  const minute = String(Math.min(59, Number(minutes))).padStart(2, "0");
  return `${hour}:${minute}`;
}

/** Parses a `DD/MM/YYYY` display value into an ISO date (`YYYY-MM-DD`). */
export function parseBirthdayDisplayToIso(displayValue: string): string | null {
  const trimmed = displayValue.trim();
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (match === null) {
    return null;
  }
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    return null;
  }
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Splits an ISO datetime into form-friendly `YYYY-MM-DD` and `HH:mm` parts. */
export function splitIsoDateTime(isoValue: string): { date: string; time: string } {
  const date = asDate(isoValue);
  if (date === null) {
    return { date: "", time: "" };
  }
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  };
}

/** Combines `YYYY-MM-DD` and `HH:mm` into an ISO datetime string. */
export function combineIsoDateAndTime(dateIso: string, timeHm: string): string | null {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateIso.trim());
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(timeHm.trim());
  if (dateMatch === null || timeMatch === null) {
    return null;
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const combined = new Date(year, month - 1, day, hours, minutes, 0, 0);
  if (
    combined.getFullYear() !== year ||
    combined.getMonth() !== month - 1 ||
    combined.getDate() !== day ||
    combined.getHours() !== hours ||
    combined.getMinutes() !== minutes
  ) {
    return null;
  }
  return combined.toISOString();
}
