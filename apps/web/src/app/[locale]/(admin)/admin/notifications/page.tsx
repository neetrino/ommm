import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { AdminNotificationsManagement } from "@/components/admin/admin-notifications-management";
import type { AdminNotificationsPayload } from "@/components/admin/admin-notifications-types";
import {
  buildAdminNotificationsDeliveriesEndpoint,
  buildAdminNotificationsScheduledEndpoint,
  parseAdminNotificationsDeliveriesPageParams,
  parseAdminNotificationsScheduledPageParams,
  type AdminNotificationsListPayload,
} from "@/components/admin/admin-notifications-query";
import {
  parseDeliveriesListFiltersFromSearch,
  parseScheduledListFiltersFromSearch,
} from "@/components/admin/admin-notifications-url";
import type { DeliveryRow, ScheduledBroadcast } from "@/components/admin/admin-notifications-types";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { AdminSectionShell } from "@/components/admin/admin-section-shell";
import { serverApiJson } from "@/lib/server-api";

export default async function AdminNotificationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const t = await getTranslations({ locale, namespace: "adminPages.notifications" });
  const cookie = (await headers()).get("cookie") ?? "";
  const scheduledPage = parseAdminNotificationsScheduledPageParams(search);
  const deliveriesPage = parseAdminNotificationsDeliveriesPageParams(search);
  const scheduledFilters = parseScheduledListFiltersFromSearch(search);
  const deliveriesFilters = parseDeliveriesListFiltersFromSearch(search);
  const [statsRes, scheduledRes, deliveriesRes, analyticsRes] = await Promise.all([
    serverApiJson<AdminNotificationsPayload["stats"]>("/notifications/admin/stats", cookie),
    serverApiJson<AdminNotificationsListPayload<ScheduledBroadcast>>(
      buildAdminNotificationsScheduledEndpoint(
        scheduledPage.take,
        scheduledPage.offset,
        scheduledFilters,
      ),
      cookie,
    ),
    serverApiJson<AdminNotificationsListPayload<DeliveryRow>>(
      buildAdminNotificationsDeliveriesEndpoint(
        deliveriesPage.take,
        deliveriesPage.offset,
        deliveriesFilters,
      ),
      cookie,
    ),
    serverApiJson<{
      summary: AdminNotificationsPayload["analytics"]["summary"];
      funnel: AdminNotificationsPayload["analytics"]["funnel"];
      channelBreakdown: AdminNotificationsPayload["analytics"]["channelBreakdown"];
    }>("/notifications/admin/analytics?days=30", cookie),
  ]);

  const emptyScheduled = {
    items: [],
    total: 0,
    take: scheduledPage.take,
    offset: scheduledPage.offset,
  };
  const emptyDeliveries = {
    items: [],
    total: 0,
    take: deliveriesPage.take,
    offset: deliveriesPage.offset,
  };

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
    scheduled: scheduledRes.ok ? scheduledRes.data : emptyScheduled,
    deliveries: deliveriesRes.ok ? deliveriesRes.data : emptyDeliveries,
    scheduledFilters,
    deliveriesFilters,
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
    <AdminContentFrame description={t("description")}>
      <AdminSectionShell>
        <Suspense fallback={null}>
          <AdminNotificationsManagement locale={locale} initial={initial} />
        </Suspense>
      </AdminSectionShell>
    </AdminContentFrame>
  );
}
