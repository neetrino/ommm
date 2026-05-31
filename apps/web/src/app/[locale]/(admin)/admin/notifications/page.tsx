import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { AdminNotificationsManagement } from "@/components/admin/admin-notifications-management";
import type { AdminNotificationsPayload } from "@/components/admin/admin-notifications-types";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

export default async function AdminNotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminPages.notifications" });
  const cookie = (await headers()).get("cookie") ?? "";
  const [statsRes, scheduledRes, deliveriesRes, analyticsRes] = await Promise.all([
    serverApiJson<AdminNotificationsPayload["stats"]>("/notifications/admin/stats", cookie),
    serverApiJson<AdminNotificationsPayload["scheduled"]>("/notifications/admin/scheduled", cookie),
    serverApiJson<AdminNotificationsPayload["deliveries"]>("/notifications/admin/deliveries", cookie),
    serverApiJson<{
      summary: AdminNotificationsPayload["analytics"]["summary"];
      funnel: AdminNotificationsPayload["analytics"]["funnel"];
      channelBreakdown: AdminNotificationsPayload["analytics"]["channelBreakdown"];
    }>("/notifications/admin/analytics?days=30", cookie),
  ]);

  const initial: AdminNotificationsPayload = {
    stats: statsRes.ok
      ? statsRes.data
      : {
          immediateBroadcasts: 0,
          scheduledBroadcasts: 0,
          scheduledPending: 0,
          scheduledSent: 0,
          scheduledFailed: 0,
          reminderDeliveries: 0,
          scheduledCancelled: 0,
          byAudience: { users: 0, coaches: 0, staff: 0, all: 0 },
        },
    scheduled: scheduledRes.ok ? scheduledRes.data : [],
    deliveries: deliveriesRes.ok ? deliveriesRes.data : [],
    analytics: analyticsRes.ok
      ? {
          summary: analyticsRes.data.summary,
          funnel: {
            deliveryRatePct: analyticsRes.data.funnel.deliveryRatePct,
            scheduledCampaigns: analyticsRes.data.funnel.scheduledCampaigns,
            immediateCampaigns: analyticsRes.data.funnel.immediateCampaigns,
          },
          channelBreakdown: analyticsRes.data.channelBreakdown,
        }
      : {
          summary: {
            campaignsTotal: 0,
            deliveriesTotal: 0,
            averageRecipientsPerCampaign: 0,
          },
          funnel: {
            deliveryRatePct: 0,
            scheduledCampaigns: 0,
            immediateCampaigns: 0,
          },
          channelBreakdown: [],
        },
    loadErrors: {
      stats: !statsRes.ok,
      scheduled: !scheduledRes.ok,
      deliveries: !deliveriesRes.ok,
      analytics: !analyticsRes.ok,
    },
  };

  return (
    <AccountPageFrame title={t("title")} description={t("description")}>
      <AdminNotificationsManagement locale={locale} initial={initial} />
    </AccountPageFrame>
  );
}
