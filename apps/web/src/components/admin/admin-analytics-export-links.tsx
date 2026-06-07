"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { AdminCsvExportMenu } from "@/components/admin/admin-csv-export-menu";

type AdminAnalyticsExportLinksProps = {
  fromIso: string;
  toIso: string;
};

export function AdminAnalyticsExportLinks({ fromIso, toIso }: AdminAnalyticsExportLinksProps) {
  const t = useTranslations("adminPages.analytics.export");
  const from = encodeURIComponent(fromIso);
  const to = encodeURIComponent(toIso);

  const items = useMemo(
    () => [
      {
        href: `/api/v1/reports/payments.csv?from=${from}&to=${to}`,
        label: t("paymentsCsv"),
      },
      {
        href: `/api/v1/reports/bookings.csv?from=${from}&to=${to}`,
        label: t("bookingsCsv"),
      },
      {
        href: `/api/v1/reports/gift-credits.csv?from=${from}&to=${to}`,
        label: t("giftCreditsCsv"),
      },
    ],
    [from, t, to],
  );

  return <AdminCsvExportMenu triggerAriaLabel={t("menuAria")} items={items} />;
}
