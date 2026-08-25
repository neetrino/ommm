"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatDateTimeForUi } from "@/lib/date-display";
import { formatTimeForUi } from "@/lib/format-time-display";
import type { StaffActivityRow } from "@/lib/staff-activity-types";
import { STUDIO_TIMEZONE } from "@/lib/studio-timezone";

export function AdminStaffActivityCard({
  row,
  onOpen,
}: {
  row: StaffActivityRow;
  onOpen: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations("staffActivityPages");
  const sessionWhen = formatSessionWhen(locale, row.sessionStartsAt);
  const typeLabel =
    row.type === "BOOKING_CREATED" ? t("typeBooked") : t("typeCancelled");
  const body =
    row.type === "BOOKING_CREATED" ? t("cardBodyBooked") : t("cardBodyCancelled");

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-2xl border border-sand-200/80 bg-white/90 p-5 text-left shadow-[0_12px_28px_-22px_rgba(45,40,35,0.2)] transition-[border-color,box-shadow,transform] hover:border-sand-300 hover:shadow-[0_16px_32px_-20px_rgba(45,40,35,0.28)] active:scale-[0.995]"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-sage-500">
        {sessionWhen}
      </p>
      <h2 className="mt-1 font-serif text-xl text-sage-900">{row.className}</h2>
      <p className="mt-2 text-sm text-sage-700">
        <span className="font-medium text-sage-800">{typeLabel}</span>
        <span className="text-sage-500"> · </span>
        <span>{row.memberName}</span>
      </p>
      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-sage-800">{body}</p>
      <p className="mt-2 text-xs text-sage-500">
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
