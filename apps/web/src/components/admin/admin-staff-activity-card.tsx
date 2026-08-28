"use client";

import { useLocale } from "next-intl";
import { StaffActivityTypeLabel } from "@/components/admin/admin-staff-activity-type-copy";
import { formatDateTimeForUi } from "@/lib/date-display";
import { formatTimeForUi } from "@/lib/format-time-display";
import type { StaffActivityRow } from "@/lib/staff-activity-types";
import { STUDIO_TIMEZONE } from "@/lib/studio-timezone";
import { ADMIN_CARD_CONTAIN_CLASS } from "@/components/admin/admin-list-table-layout";

export function AdminStaffActivityCard({
  row,
  onOpen,
}: {
  row: StaffActivityRow;
  onOpen: () => void;
}) {
  const locale = useLocale();
  const sessionWhen = formatSessionWhen(locale, row.sessionStartsAt);

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`${ADMIN_CARD_CONTAIN_CLASS} w-full rounded-2xl border border-sand-200/80 bg-white/90 p-5 text-left shadow-[0_12px_28px_-22px_rgba(45,40,35,0.2)] transition-[border-color,box-shadow] hover:border-sand-300 hover:shadow-[0_16px_32px_-20px_rgba(45,40,35,0.28)]`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-sage-500">
        {sessionWhen}
      </p>
      <h2 className="mt-1 truncate font-serif text-xl text-sage-900">{row.className}</h2>
      <p className="mt-2 truncate text-sm text-sage-700">
        <StaffActivityTypeLabel type={row.type} />
        <span className="text-sage-500"> · </span>
        <span>{row.memberName}</span>
      </p>
      <p className="mt-2 truncate text-xs tabular-nums text-sage-500">
        {formatDateTimeForUi(row.createdAt, locale)}
      </p>
    </button>
  );
}

function formatSessionWhen(locale: string, startsAt: string): string {
  const start = new Date(startsAt);
  const date = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: STUDIO_TIMEZONE,
  }).format(start);
  return `${date} · ${formatTimeForUi(start, locale)}`;
}
