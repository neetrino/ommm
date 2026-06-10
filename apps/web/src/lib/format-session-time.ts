import { formatDateForUi } from "@/lib/date-display";
import { formatTimeForUi } from "@/lib/format-time-display";

export function formatSessionRange(
  locale: string,
  startsAtIso: string,
  endsAtIso: string,
): string {
  const start = new Date(startsAtIso);
  const end = new Date(endsAtIso);
  return `${formatDateForUi(start)} ${formatTimeForUi(start, locale)} - ${formatTimeForUi(end, locale)}`;
}
