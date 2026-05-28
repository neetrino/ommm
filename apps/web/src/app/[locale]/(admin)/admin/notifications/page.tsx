import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { AdminNotificationBroadcastForm } from "@/components/admin/admin-notification-broadcast-form";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

type NotificationStats = {
  immediateBroadcasts: number;
  scheduledBroadcasts: number;
  scheduledPending: number;
  scheduledSent: number;
  scheduledFailed: number;
  reminderDeliveries: number;
};

export default async function AdminNotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminPages.notifications" });
  const cookie = (await headers()).get("cookie") ?? "";
  const statsRes = await serverApiJson<NotificationStats>(
    "/notifications/admin/stats",
    cookie,
  );
  const stats = statsRes.ok
    ? statsRes.data
    : {
        immediateBroadcasts: 0,
        scheduledBroadcasts: 0,
        scheduledPending: 0,
        scheduledSent: 0,
        scheduledFailed: 0,
        reminderDeliveries: 0,
      };

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
      </section>
      <div className="mt-2 max-w-xl ommm-account-section">
        <AdminNotificationBroadcastForm />
      </div>
      <p className="ommm-body-muted mt-4 text-sm">{t("deliveryNote")}</p>
    </AccountPageFrame>
  );
}
