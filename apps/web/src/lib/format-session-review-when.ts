import { STUDIO_TIMEZONE } from "@/lib/studio-timezone";
import { formatTimeForUi } from "@/lib/format-time-display";

export function formatSessionReviewWhen(
  locale: string,
  startsAt: string,
  endsAt: string,
): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const date = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: STUDIO_TIMEZONE,
  }).format(start);
  return `${date} · ${formatTimeForUi(start, locale)} – ${formatTimeForUi(end, locale)}`;
}
