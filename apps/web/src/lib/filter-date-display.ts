import { formatDateForUi } from "@/lib/date-display";

/** Normalizes API / URL date values to `YYYY-MM-DD` for filters and chips. */
export function normalizeFilterDateValue(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return "";
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 10);
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return trimmed;
  }
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Human-readable active-filter chip label for date fields. */
export function formatFilterDateChipLabel(prefix: string, value: string): string | null {
  const normalized = normalizeFilterDateValue(value);
  if (normalized.length === 0) {
    return null;
  }
  return `${prefix}: ${formatDateForUi(normalized)}`;
}
