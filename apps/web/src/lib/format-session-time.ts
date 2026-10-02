import { formatDateForUi } from "@/lib/date-display";
import { utcToStudioWallClockTime } from "@/lib/studio-timezone";

/** `DD/MM/YYYY HH:mm - HH:mm` in studio time — same clock as the public schedule. */
export function formatSessionRange(startsAtIso: string, endsAtIso: string): string {
  const start = new Date(startsAtIso);
  const end = new Date(endsAtIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "";
  }
  const startClock = utcToStudioWallClockTime(start);
  const endClock = utcToStudioWallClockTime(end);
  return `${formatDateForUi(start)} ${startClock} - ${endClock}`;
}
