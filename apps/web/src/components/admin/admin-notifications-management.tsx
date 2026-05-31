"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminNotificationBroadcastForm } from "@/components/admin/admin-notification-broadcast-form";
import { AdminNotificationsDeliveriesSection } from "@/components/admin/admin-notifications-deliveries-section";
import { AdminNotificationsScheduledSection } from "@/components/admin/admin-notifications-scheduled-section";
import { adminChrome } from "@/components/admin/admin-chrome";
import type { AdminNotificationsPayload } from "@/components/admin/admin-notifications-types";
import { apiFetch } from "@/lib/api";

type Props = {
  locale: string;
  initial: AdminNotificationsPayload;
};

export function AdminNotificationsManagement({ locale, initial }: Props) {
  const t = useTranslations("adminPages.notifications");
  const [stats, setStats] = useState(initial.stats);
  const [scheduled, setScheduled] = useState(initial.scheduled);
  const [deliveries, setDeliveries] = useState(initial.deliveries);
  const [analytics, setAnalytics] = useState(initial.analytics);
  const [loadErrors, setLoadErrors] = useState(initial.loadErrors);
  const [refreshing, setRefreshing] = useState(false);

  const refreshData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [statsRes, scheduledRes, deliveriesRes, analyticsRes] = await Promise.all([
        apiFetch<AdminNotificationsPayload["stats"]>("/notifications/admin/stats").catch(() => null),
        apiFetch<AdminNotificationsPayload["scheduled"]>("/notifications/admin/scheduled").catch(
          () => null,
        ),
        apiFetch<AdminNotificationsPayload["deliveries"]>("/notifications/admin/deliveries").catch(
          () => null,
        ),
        apiFetch<{
          summary: AdminNotificationsPayload["analytics"]["summary"];
          funnel: {
            deliveryRatePct: number;
            scheduledCampaigns: number;
            immediateCampaigns: number;
          };
          channelBreakdown: AdminNotificationsPayload["analytics"]["channelBreakdown"];
        }>("/notifications/admin/analytics?days=30").catch(() => null),
      ]);
      if (statsRes) {
        setStats(statsRes);
        setLoadErrors((prev) => ({ ...prev, stats: false }));
      }
      if (scheduledRes) {
        setScheduled(scheduledRes);
        setLoadErrors((prev) => ({ ...prev, scheduled: false }));
      }
      if (deliveriesRes) {
        setDeliveries(deliveriesRes);
        setLoadErrors((prev) => ({ ...prev, deliveries: false }));
      }
      if (analyticsRes) {
        setAnalytics({
          summary: analyticsRes.summary,
          funnel: {
            deliveryRatePct: analyticsRes.funnel.deliveryRatePct,
            scheduledCampaigns: analyticsRes.funnel.scheduledCampaigns,
            immediateCampaigns: analyticsRes.funnel.immediateCampaigns,
          },
          channelBreakdown: analyticsRes.channelBreakdown,
        });
        setLoadErrors((prev) => ({ ...prev, analytics: false }));
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleBroadcastSuccess = useCallback(() => {
    void refreshData();
  }, [refreshData]);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article className={adminChrome.metricCard}>
          <p className={adminChrome.metricLabel}>{t("stats.immediateBroadcasts")}</p>
          <p className={adminChrome.metricValue}>{stats.immediateBroadcasts}</p>
        </article>
        <article className={adminChrome.metricCard}>
          <p className={adminChrome.metricLabel}>{t("stats.scheduledPending")}</p>
          <p className={adminChrome.metricValue}>{stats.scheduledPending}</p>
        </article>
        <article className={adminChrome.metricCard}>
          <p className={adminChrome.metricLabel}>{t("stats.scheduledSent")}</p>
          <p className={adminChrome.metricValue}>{stats.scheduledSent}</p>
        </article>
        <article className={adminChrome.metricCard}>
          <p className={adminChrome.metricLabel}>{t("stats.scheduledCancelled")}</p>
          <p className={adminChrome.metricValue}>{stats.scheduledCancelled}</p>
        </article>
        <article className={adminChrome.metricCard}>
          <p className={adminChrome.metricLabel}>{t("stats.broadcastsToUsers")}</p>
          <p className={adminChrome.metricValue}>{stats.byAudience.users}</p>
        </article>
        <article className={adminChrome.metricCard}>
          <p className={adminChrome.metricLabel}>{t("stats.broadcastsToStaff")}</p>
          <p className={adminChrome.metricValue}>{stats.byAudience.staff}</p>
        </article>
      </section>

      <section className={adminChrome.panel}>
        <h2 className={adminChrome.panelHeading}>{t("composeHeading")}</h2>
        <p className={`${adminChrome.metaText} mt-1`}>{t("composeHint")}</p>
        <div className="mt-4 max-w-xl">
          <AdminNotificationBroadcastForm onSuccess={handleBroadcastSuccess} />
        </div>
        {refreshing ? (
          <p className={`${adminChrome.metaText} mt-2`}>{t("refreshing")}</p>
        ) : null}
      </section>

      <AdminNotificationsScheduledSection
        locale={locale}
        items={scheduled}
        loadFailed={loadErrors.scheduled}
        onRefresh={() => {
          void refreshData();
        }}
      />

      <section className={adminChrome.panel}>
        <h2 className={adminChrome.panelHeading}>{t("analyticsHeading")}</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <article>
            <p className={adminChrome.metricLabel}>{t("analytics.campaigns")}</p>
            <p className={adminChrome.metricValue}>{analytics.summary.campaignsTotal}</p>
          </article>
          <article>
            <p className={adminChrome.metricLabel}>{t("analytics.deliveries")}</p>
            <p className={adminChrome.metricValue}>{analytics.summary.deliveriesTotal}</p>
          </article>
          <article>
            <p className={adminChrome.metricLabel}>{t("analytics.deliveryRate")}</p>
            <p className={adminChrome.metricValue}>{analytics.funnel.deliveryRatePct}%</p>
          </article>
        </div>
        {loadErrors.analytics ? (
          <p className="app-alert-warn mt-3 text-sm">{t("loadFailedAnalytics")}</p>
        ) : null}
        {analytics.channelBreakdown.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {analytics.channelBreakdown.map((item) => (
              <li key={item.channel} className="ommm-inset-row flex flex-wrap gap-3 text-xs">
                <span className="font-medium text-sage-800">{item.channel}</span>
                <span className="text-sage-500">
                  {t("analytics.deliveries")}: {item.deliveries}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={`${adminChrome.metaText} mt-3`}>{t("analytics.emptyChannels")}</p>
        )}
      </section>

      <AdminNotificationsDeliveriesSection
        locale={locale}
        items={deliveries}
        loadFailed={loadErrors.deliveries}
      />

      <p className={adminChrome.metaText}>{t("unsupportedNote")}</p>
    </div>
  );
}
