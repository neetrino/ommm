"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { adminChrome } from "@/components/admin/admin-chrome";
import { DashboardNavIcon } from "@/components/shell/dashboard-nav-icon";
import type { StudioPublicSettings } from "@/lib/studio-social-links";
import { formatPhoneDisplay } from "@/lib/phone";

type AdminStudioSettingsOverviewProps = {
  initial: StudioPublicSettings;
};

type SummaryMetricProps = {
  icon: "settings" | "send";
  label: string;
  value: string;
  helper: string;
};

function SummaryMetric({ icon, label, value, helper }: SummaryMetricProps) {
  return (
    <article className={adminChrome.metricCard}>
      <div className="flex items-start justify-between gap-3">
        <p className={adminChrome.metricLabel}>{label}</p>
        <DashboardNavIcon name={icon} className="h-4 w-4 shrink-0 text-sage-500" />
      </div>
      <p className="mt-2 truncate text-lg font-semibold text-sage-900">{value}</p>
      <p className={`${adminChrome.metaText} mt-1`}>{helper}</p>
    </article>
  );
}

export function AdminStudioSettingsOverview({ initial }: AdminStudioSettingsOverviewProps) {
  const t = useTranslations("adminActions.studio");

  const summaryMetrics = useMemo(
    () => [
      {
        key: "identity",
        icon: "settings" as const,
        label: t("tiles.identity.title"),
        value: initial.studioName.trim() || t("tiles.identity.empty"),
        helper: t("tiles.identity.helper"),
      },
      {
        key: "contact",
        icon: "send" as const,
        label: t("tiles.contact.title"),
        value:
          initial.contactEmail?.trim() ||
          formatPhoneDisplay(initial.contactPhone ?? "").trim() ||
          t("tiles.contact.empty"),
        helper: t("tiles.contact.helper"),
      },
    ],
    [initial.contactEmail, initial.contactPhone, initial.studioName, t],
  );

  return (
    <section className="rounded-[24px] border border-white/50 bg-white/35 p-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.18)] backdrop-blur-md sm:p-5">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-wide text-sage-500">
        {t("title")}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {summaryMetrics.map(({ key, ...metric }) => (
          <SummaryMetric key={key} {...metric} />
        ))}
      </div>
    </section>
  );
}
