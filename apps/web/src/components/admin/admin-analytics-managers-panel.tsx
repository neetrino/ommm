"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AdminAnalyticsChartPanel } from "@/components/admin/admin-analytics-chart-panel";
import { AdminAnalyticsManagerInvitesSheet } from "@/components/admin/admin-analytics-manager-invites-sheet";
import { AdminAnalyticsKpiStrip } from "@/components/admin/admin-analytics-kpi-strip";
import { AdminAnalyticsPanelSection } from "@/components/admin/admin-analytics-panel-motion";
import type {
  ManagerInviteAnalyticsRow,
  ManagerInvitesAnalyticsPayload,
} from "@/components/admin/admin-analytics-managers-types";

type AdminAnalyticsManagersPanelProps = {
  data: ManagerInvitesAnalyticsPayload;
};

const COUNT_PILL_CLASS =
  "inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--ommm-admin-olive)]/10 px-4 py-2 text-sm font-semibold tabular-nums text-sage-800";

export function AdminAnalyticsManagersPanel({ data }: AdminAnalyticsManagersPanelProps) {
  const t = useTranslations("adminPages.analytics");
  const [selectedManager, setSelectedManager] = useState<ManagerInviteAnalyticsRow | null>(
    null,
  );

  const topManager = data.managers[0];
  const kpis = [
    {
      key: "managers",
      label: t("sections.managerInvites.managersCount"),
      value: String(data.totals.managers),
    },
    {
      key: "referred",
      label: t("sections.managerInvites.referredInRange"),
      value: String(data.totals.referredInRange),
    },
    {
      key: "top",
      label: t("sections.managerInvites.topManager"),
      value:
        topManager && topManager.referredCount > 0
          ? `${topManager.name} · ${topManager.referredCount}`
          : t("notAvailable"),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminAnalyticsPanelSection index={0}>
        <AdminAnalyticsKpiStrip items={kpis} trendNotAvailableLabel={t("trendNotAvailable")} />
      </AdminAnalyticsPanelSection>
      <AdminAnalyticsPanelSection index={1}>
        <AdminAnalyticsChartPanel
          title={t("sections.managerInvites.title")}
          hint={t("sections.managerInvites.hint")}
        >
          {data.managers.length === 0 ? (
            <p className="text-sm text-sage-500">{t("empty")}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {data.managers.map((manager) => {
                const canOpen = manager.referredCount > 0;
                const countLabel = t("sections.managerInvites.countLabel", {
                  count: manager.referredCount,
                });
                return (
                  <li
                    key={manager.id}
                    className="rounded-2xl border border-white/60 bg-white/40 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-sage-900">
                          {manager.name}
                        </p>
                        <p className="truncate text-xs text-sage-500">{manager.email}</p>
                      </div>
                      {canOpen ? (
                        <button
                          type="button"
                          className={`${COUNT_PILL_CLASS} transition-colors hover:bg-[var(--ommm-admin-olive)]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ommm-admin-olive)]/40`}
                          aria-label={t("sections.managerInvites.openSheetAria", {
                            name: manager.name,
                            count: manager.referredCount,
                          })}
                          onClick={() => setSelectedManager(manager)}
                        >
                          {countLabel}
                        </button>
                      ) : (
                        <span className={COUNT_PILL_CLASS}>{countLabel}</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </AdminAnalyticsChartPanel>
      </AdminAnalyticsPanelSection>
      {selectedManager ? (
        <AdminAnalyticsManagerInvitesSheet
          manager={selectedManager}
          onClose={() => setSelectedManager(null)}
        />
      ) : null}
    </div>
  );
}
