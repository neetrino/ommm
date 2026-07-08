import type { WaitlistMineRow } from "../../../lib/api/memberClient";
import type { WaitlistItem } from "../../../lib/mocks/homeMock";
import { formatSessionScheduleShort } from "../../../lib/member/formatSessionLabels";

export type WaitlistBadgeFormatter = (args: {
  index: number;
  status: string;
}) => string;

export function waitlistRowsToItems(
  rows: WaitlistMineRow[],
  locale: string,
  formatBadge: WaitlistBadgeFormatter,
): WaitlistItem[] {
  return rows.map((row, index) => ({
    id: row.id,
    spotLabel: formatBadge({ index: index + 1, status: row.status }).toUpperCase(),
    title: row.session.classType.name,
    scheduleLabel: formatSessionScheduleShort(row.session.startsAt, locale),
    variant: index % 2 === 0 ? "light" : "dark",
  }));
}
