"use client";

import { useTranslations } from "next-intl";
import type { ClientDetail } from "@/components/admin/admin-clients-types";
import {
  DETAILS_DIVIDER_CLASS,
  DetailsCard,
  DetailsStat,
  DetailsStatStrip,
} from "@/components/shared/details/details-card";
import {
  CalendarGlyph,
  CheckCircleGlyph,
  ClockGlyph,
  TicketGlyph,
  WalletGlyph,
  XCircleGlyph,
} from "@/components/shared/details/details-glyphs";
import { formatDateForUi } from "@/lib/date-display";
import { formatAmdFromCents } from "@/lib/price-amd";

const EMPTY_VALUE = "—";

/** Visits / bookings / cancellations, then no-shows / last visit / lifetime value. */
export function ClientActivityStats({
  activity,
  locale,
}: {
  activity: ClientDetail["activity"];
  locale: string;
}) {
  const t = useTranslations("adminPages.clients");
  return (
    <DetailsCard>
      <DetailsStatStrip bordered={false}>
        <DetailsStat label={t("drawer.totalVisits")} icon={<CheckCircleGlyph />} tone="mint">
          {activity.totalVisits}
        </DetailsStat>
        <DetailsStat label={t("drawer.totalBookings")} icon={<TicketGlyph />} tone="blue">
          {activity.totalBookings}
        </DetailsStat>
        <DetailsStat label={t("drawer.cancellations")} icon={<XCircleGlyph />} tone="peach">
          {activity.totalCancellations}
        </DetailsStat>
      </DetailsStatStrip>
      <div className={`${DETAILS_DIVIDER_CLASS} pt-5`}>
        <DetailsStatStrip bordered={false}>
          <DetailsStat label={t("drawer.noShows")} icon={<ClockGlyph />} tone="sand">
            {activity.totalNoShows}
          </DetailsStat>
          <DetailsStat label={t("drawer.lastVisit")} icon={<CalendarGlyph />} tone="blue">
            {activity.lastVisitDate ? formatDateForUi(activity.lastVisitDate) : EMPTY_VALUE}
          </DetailsStat>
          <DetailsStat label={t("drawer.lifetimeValue")} icon={<WalletGlyph />} tone="mint">
            {formatAmdFromCents(activity.lifetimeValueCents, locale)}
          </DetailsStat>
        </DetailsStatStrip>
      </div>
    </DetailsCard>
  );
}
