export function formatSessionRange(
  locale: string,
  startsAtIso: string,
  endsAtIso: string,
): string {
  const start = new Date(startsAtIso);
  const end = new Date(endsAtIso);
  const opts: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };
  const fmt = new Intl.DateTimeFormat(locale, opts);
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}
