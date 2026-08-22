"use client";

import { useTranslations } from "next-intl";
import { adminChrome } from "@/components/admin/admin-chrome";

type AdminPackagesSummaryProps = {
  totalSold: number;
};

export function AdminPackagesSummary({ totalSold }: AdminPackagesSummaryProps) {
  const t = useTranslations("adminPages.packages");

  return (
    <section className="grid gap-4 sm:max-w-xs">
      <article className={adminChrome.metricCard}>
        <p className={adminChrome.metricLabel}>{t("summaryTotalSold")}</p>
        <p className={adminChrome.metricValue}>{totalSold}</p>
      </article>
    </section>
  );
}
