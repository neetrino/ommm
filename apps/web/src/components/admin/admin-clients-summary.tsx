"use client";

import { useTranslations } from "next-intl";
import type { AdminClientsPayload } from "@/components/admin/admin-clients-types";
import { adminChrome } from "@/components/admin/admin-chrome";

type AdminClientsSummaryProps = {
  payload: AdminClientsPayload;
};

export function AdminClientsSummary({ payload }: AdminClientsSummaryProps) {
  const t = useTranslations("adminPages.clients");
  const cards = [
    [t("summaryTotal"), payload.summary.total],
    [t("summaryWithPackage"), payload.summary.withPackage],
    [t("summaryActive"), payload.summary.active],
    [t("summaryVip"), payload.summary.vip],
    [t("summaryVisits"), payload.summary.totalVisits],
  ] as const;

  return (
    <section className={adminChrome.summaryGridFive}>
      {cards.map(([label, value]) => (
        <article key={label} className={adminChrome.metricCard}>
          <p className={adminChrome.metricLabel}>{label}</p>
          <p className={adminChrome.metricValue}>{value}</p>
        </article>
      ))}
    </section>
  );
}
