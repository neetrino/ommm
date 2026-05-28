import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { AdminNotificationBroadcastForm } from "@/components/admin/admin-notification-broadcast-form";
import { AdminScheduledBroadcasts } from "@/components/admin/admin-scheduled-broadcasts";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

type NotificationStats = {
  immediateBroadcasts: number;
  scheduledBroadcasts: number;
  scheduledPending: number;
  scheduledSent: number;
  scheduledFailed: number;
  reminderDeliveries: number;
  scheduledCancelled: number;
  byAudience: {
    users: number;
    coaches: number;
    staff: number;
    all: number;
  };
};

type ScheduledBroadcast = {
  id: string;
  subject: string;
  audience: "users" | "coaches" | "staff" | "all";
  scheduleAt: string;
  status: "PENDING" | "SENT" | "FAILED" | "CANCELLED";
};

export default async function AdminNotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminPages.notifications" });
  const cookie = (await headers()).get("cookie") ?? "";
  const [statsRes, scheduledRes] = await Promise.all([
    serverApiJson<NotificationStats>("/notifications/admin/stats", cookie),
    serverApiJson<ScheduledBroadcast[]>("/notifications/admin/scheduled", cookie),
  ]);
  const stats = statsRes.ok
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
      };
  const scheduled = scheduledRes.ok ? scheduledRes.data : [];

  return (
    <AccountPageFrame title={t("title")} description={t("description")}>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article className="ommm-stack-card">
          <p className="text-xs uppercase tracking-wide text-sage-500">
            {t("stats.immediateBroadcasts")}
          </p>
          <p className="mt-2 text-2xl font-semibold text-sage-900">
            {stats.immediateBroadcasts}
          </p>
        </article>
        <article className="ommm-stack-card">
          <p className="text-xs uppercase tracking-wide text-sage-500">
            {t("stats.scheduledPending")}
          </p>
          <p className="mt-2 text-2xl font-semibold text-sage-900">
            {stats.scheduledPending}
          </p>
        </article>
        <article className="ommm-stack-card">
          <p className="text-xs uppercase tracking-wide text-sage-500">
            {t("stats.scheduledSent")}
          </p>
          <p className="mt-2 text-2xl font-semibold text-sage-900">
            {stats.scheduledSent}
          </p>
        </article>
        <article className="ommm-stack-card">
          <p className="text-xs uppercase tracking-wide text-sage-500">
            {t("stats.scheduledCancelled")}
          </p>
          <p className="mt-2 text-2xl font-semibold text-sage-900">
            {stats.scheduledCancelled}
          </p>
        </article>
        <article className="ommm-stack-card">
          <p className="text-xs uppercase tracking-wide text-sage-500">
            {t("stats.broadcastsToUsers")}
          </p>
          <p className="mt-2 text-2xl font-semibold text-sage-900">
            {stats.byAudience.users}
          </p>
        </article>
        <article className="ommm-stack-card">
          <p className="text-xs uppercase tracking-wide text-sage-500">
            {t("stats.broadcastsToStaff")}
          </p>
          <p className="mt-2 text-2xl font-semibold text-sage-900">
            {stats.byAudience.staff}
          </p>
        </article>
      </section>
      <div className="mt-2 max-w-xl ommm-account-section">
        <AdminNotificationBroadcastForm />
      </div>
      <AdminScheduledBroadcasts items={scheduled} />
      <p className="ommm-body-muted mt-4 text-sm">{t("deliveryNote")}</p>
    </AccountPageFrame>
  );
}
