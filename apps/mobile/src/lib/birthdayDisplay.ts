/** Formats ISO `YYYY-MM-DD…` into `DD/MM/YYYY` for profile forms. */
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
