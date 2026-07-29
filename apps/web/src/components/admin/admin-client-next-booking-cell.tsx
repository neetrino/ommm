"use client";

import { useLocale, useTranslations } from "next-intl";
import type { ClientRow } from "@/components/admin/admin-clients-types";
import { formatDateCompactForUi } from "@/lib/date-display";
import { formatTimeForUiFromIso } from "@/lib/format-time-display";

type AdminClientNextBookingCellProps = {
  row: Pick<ClientRow, "nextBooking">;
};

export function AdminClientNextBookingCell({ row }: AdminClientNextBookingCellProps) {
  const t = useTranslations("adminPages.clients");
  const locale = useLocale();
  const booking = row.nextBooking;

  if (booking === null) {
    return <p className="text-sm text-sage-400">{t("nextBookingEmpty")}</p>;
  }

  const when = `${formatDateCompactForUi(booking.startsAt)} ${formatTimeForUiFromIso(booking.startsAt, locale)}`;

  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-medium text-sage-900" title={booking.classTypeName}>
        {booking.classTypeName}
      </p>
      <p className="mt-0.5 truncate text-xs tabular-nums text-sage-500" title={when}>
        {when}
      </p>
    </div>
  );
}
