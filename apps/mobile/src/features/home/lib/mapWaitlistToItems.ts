import type { WaitlistMineRow } from "../../../lib/api/memberClient";
import type { WaitlistItem } from "../../../lib/mocks/homeMock";
import { formatSessionScheduleShort } from "../../../lib/member/formatSessionLabels";

const DEFAULT_LOCALE = "en-US";

export function waitlistRowsToItems(
  rows: WaitlistMineRow[],
  locale = DEFAULT_LOCALE,
): WaitlistItem[] {
  return rows.map((row, index) => {
    const statusLabel =
      row.status === "OFFERED" ? "Spot offered" : `#${row.position} in line`;
    return {
      id: row.id,
      spotLabel: statusLabel.toUpperCase(),
      title: row.session.classType.name,
      scheduleLabel: formatSessionScheduleShort(row.session.startsAt, locale),
      variant: index % 2 === 0 ? "light" : "dark",
    } satisfies WaitlistItem;
  });
}
