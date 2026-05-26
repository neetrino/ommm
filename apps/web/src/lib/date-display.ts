function asDate(value: Date | string): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDateForUi(value: Date | string): string {
  const date = asDate(value);
  if (date === null) {
    return "";
  }
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).padStart(4, "0");
  return `${day}/${month}/${year}`;
}

export function formatDateTimeForUi(value: Date | string, locale?: string): string {
  const date = asDate(value);
  if (date === null) {
    return "";
  }
  const time = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  return `${formatDateForUi(date)} ${time}`;
}
