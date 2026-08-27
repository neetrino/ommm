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
    <section className="grid grid-cols-3 gap-2 sm:grid-cols-2 sm:gap-4 xl:grid-cols-5">
      {cards.map(([label, value]) => (
        <article key={label} className={`${adminChrome.metricCard} max-sm:rounded-2xl max-sm:p-3`}>
          <p className={adminChrome.metricLabel}>{label}</p>
          <p className={`${adminChrome.metricValue} max-sm:mt-1 max-sm:text-xl`}>{value}</p>
        </article>
      ))}
    </section>
  );
}
