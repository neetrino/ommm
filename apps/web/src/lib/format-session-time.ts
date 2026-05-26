import { formatDateForUi } from "@/lib/date-display";

export function formatSessionRange(
  locale: string,
  startsAtIso: string,
  endsAtIso: string,
): string {
  const start = new Date(startsAtIso);
  const end = new Date(endsAtIso);
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${formatDateForUi(start)} ${timeFormatter.format(start)} - ${timeFormatter.format(end)}`;
}
