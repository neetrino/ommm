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

type DeliveryRow = {
  id: string;
  createdAt: string;
  recipientEmail: string;
  channel: string;
  audience: "users" | "coaches" | "staff" | "all";
  subject: string;
  scheduled: boolean;
};

type NotificationAnalytics = {
  summary: {
    campaignsTotal: number;
    deliveriesTotal: number;
    averageRecipientsPerCampaign: number;
  };
  funnel: {
    campaignsTotal: number;
    scheduledCampaigns: number;
    immediateCampaigns: number;
    estimatedRecipientsTotal: number;
    deliveredRecipientsTotal: number;
    deliveryRatePct: number;
  };
  channelBreakdown: Array<{
    channel: string;
    deliveries: number;
  }>;
  topSubjects: Array<{
    subject: string;
    campaigns: number;
    deliveries: number;
    estimatedRecipients: number;
    conversionRatePct: number;
  }>;
  daily: Array<{
    date: string;
    campaigns: number;
    deliveries: number;
  }>;
};

function getNotificationAnalyticsLabels(locale: string) {
  if (locale === "hy") {
    return {
      heading: "Քարոզարշավների անալիտիկա (30 օր)",
      campaigns: "Քարոզարշավներ",
      deliveries: "Առաքումներ",
      avgRecipients: "Միջ. ստացողներ / քարոզարշավ",
      emptyCampaigns: "Քարոզարշավների անալիտիկա դեռ չկա։",
      campaignsShort: "քարոզարշավ",
      deliveriesShort: "առաքում",
      estimatedShort: "գնահատված",
      conversionShort: "կոնվերսիա",
      deliveryRate: "Առաքման տոկոս",
      scheduledCampaigns: "Ժամանակացույցված քարոզարշավներ",
      immediateCampaigns: "Անմիջական քարոզարշավներ",
      emptyChannels: "Ալիքների վիճակագրություն դեռ չկա։",
      dailyTrend: "Օրական տրենդ (վերջին 14 օր)",
      emptyTrend: "Տրենդի տվյալ դեռ չկա։",
    };
  }
  if (locale === "ru") {
    return {
      heading: "Аналитика кампаний (30 дней)",
      campaigns: "Кампании",
      deliveries: "Доставки",
      avgRecipients: "Сред. получателей / кампания",
      emptyCampaigns: "Аналитики кампаний пока нет.",
      campaignsShort: "кампании",
      deliveriesShort: "доставки",
      estimatedShort: "оценено",
      conversionShort: "конверсия",
      deliveryRate: "Процент доставки",
      scheduledCampaigns: "Кампании по расписанию",
      immediateCampaigns: "Мгновенные кампании",
      emptyChannels: "Статистики каналов пока нет.",
      dailyTrend: "Дневной тренд (последние 14 дней)",
      emptyTrend: "Данных тренда пока нет.",
    };
  }
  return {
    heading: "Campaign analytics (30d)",
    campaigns: "Campaigns",
    deliveries: "Deliveries",
    avgRecipients: "Avg recipients / campaign",
    emptyCampaigns: "No campaign analytics yet.",
    campaignsShort: "campaigns",
    deliveriesShort: "deliveries",
    estimatedShort: "estimated",
    conversionShort: "conversion",
    deliveryRate: "Delivery rate",
    scheduledCampaigns: "Scheduled campaigns",
    immediateCampaigns: "Immediate campaigns",
    emptyChannels: "No channel stats yet.",
    dailyTrend: "Daily trend (last 14 days)",
    emptyTrend: "No trend data yet.",
  };
}

function getScheduledBroadcastLabels(locale: string) {
  if (locale === "hy") {
    return {
      heading: "Ժամանակացույցված ուղարկումներ",
      empty: "Ժամանակացույցված ուղարկումներ չկան։",
      reschedule: "Վերաժամանակացույցել",
      cancel: "Չեղարկել",
      chooseScheduleFirst: "Նախ ընտրեք ժամանակը։",
      scheduleCancelled: "Ժամանակացույցված ուղարկումը չեղարկվեց։",
      scheduleUpdated: "Ժամանակացույցված ուղարկումը թարմացվեց։",
      cancelFailed: "Չհաջողվեց չեղարկել ժամանակացույցը։",
      updateFailed: "Չհաջողվեց թարմացնել ժամանակացույցը։",
    };
  }
  if (locale === "ru") {
    return {
      heading: "Рассылки по расписанию",
      empty: "Запланированных рассылок нет.",
      reschedule: "Перенести",
      cancel: "Отменить",
      chooseScheduleFirst: "Сначала выберите время.",
      scheduleCancelled: "Запланированная рассылка отменена.",
      scheduleUpdated: "Запланированная рассылка обновлена.",
      cancelFailed: "Не удалось отменить расписание.",
      updateFailed: "Не удалось обновить расписание.",
    };
  }
  return {
    heading: "Scheduled broadcasts",
    empty: "No scheduled broadcasts.",
    reschedule: "Reschedule",
    cancel: "Cancel",
    chooseScheduleFirst: "Choose a schedule time first.",
    scheduleCancelled: "Scheduled broadcast cancelled.",
    scheduleUpdated: "Scheduled broadcast updated.",
    cancelFailed: "Could not cancel schedule.",
    updateFailed: "Could not update schedule.",
  };
}

export default async function AdminNotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminPages.notifications" });
  const cookie = (await headers()).get("cookie") ?? "";
  const [statsRes, scheduledRes, deliveriesRes, analyticsRes] = await Promise.all([
    serverApiJson<NotificationStats>("/notifications/admin/stats", cookie),
    serverApiJson<ScheduledBroadcast[]>("/notifications/admin/scheduled", cookie),
    serverApiJson<DeliveryRow[]>("/notifications/admin/deliveries", cookie),
    serverApiJson<NotificationAnalytics>("/notifications/admin/analytics?days=30", cookie),
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
  const deliveries = deliveriesRes.ok ? deliveriesRes.data : [];
  const analytics = analyticsRes.ok
    ? analyticsRes.data
    : {
        summary: {
          campaignsTotal: 0,
          deliveriesTotal: 0,
          averageRecipientsPerCampaign: 0,
        },
        funnel: {
          campaignsTotal: 0,
          scheduledCampaigns: 0,
          immediateCampaigns: 0,
          estimatedRecipientsTotal: 0,
          deliveredRecipientsTotal: 0,
          deliveryRatePct: 0,
        },
        channelBreakdown: [],
        topSubjects: [],
        daily: [],
      };
  const labels = getNotificationAnalyticsLabels(locale);
  const scheduledLabels = getScheduledBroadcastLabels(locale);
  const trendRows = analytics.daily.slice(-14);

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
      <AdminScheduledBroadcasts items={scheduled} labels={scheduledLabels} />
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-sage-900">{labels.heading}</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <article className="ommm-stack-card">
            <p className="text-xs uppercase tracking-wide text-sage-500">{labels.campaigns}</p>
            <p className="mt-2 text-2xl font-semibold text-sage-900">
              {analytics.summary.campaignsTotal}
            </p>
          </article>
          <article className="ommm-stack-card">
            <p className="text-xs uppercase tracking-wide text-sage-500">{labels.deliveries}</p>
            <p className="mt-2 text-2xl font-semibold text-sage-900">
              {analytics.summary.deliveriesTotal}
            </p>
          </article>
          <article className="ommm-stack-card">
            <p className="text-xs uppercase tracking-wide text-sage-500">{labels.avgRecipients}</p>
            <p className="mt-2 text-2xl font-semibold text-sage-900">
              {analytics.summary.averageRecipientsPerCampaign}
            </p>
          </article>
        </div>
        <ul className="mt-3 space-y-2">
          {analytics.topSubjects.length === 0 ? (
            <li className="ommm-body-muted text-sm">{labels.emptyCampaigns}</li>
          ) : (
            analytics.topSubjects.map((subject) => (
              <li key={subject.subject} className="ommm-inset-row flex flex-wrap items-center gap-3 text-xs">
                <span className="font-medium text-sage-800">{subject.subject}</span>
                <span className="text-sage-500">{labels.campaignsShort}: {subject.campaigns}</span>
                <span className="text-sage-500">{labels.deliveriesShort}: {subject.deliveries}</span>
                <span className="text-sage-500">{labels.estimatedShort}: {subject.estimatedRecipients}</span>
                <span className="text-sage-500">{labels.conversionShort}: {subject.conversionRatePct}%</span>
              </li>
            ))
          )}
        </ul>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <article className="ommm-stack-card">
            <p className="text-xs uppercase tracking-wide text-sage-500">{labels.deliveryRate}</p>
            <p className="mt-2 text-2xl font-semibold text-sage-900">
              {analytics.funnel.deliveryRatePct}%
            </p>
          </article>
          <article className="ommm-stack-card">
            <p className="text-xs uppercase tracking-wide text-sage-500">{labels.scheduledCampaigns}</p>
            <p className="mt-2 text-2xl font-semibold text-sage-900">
              {analytics.funnel.scheduledCampaigns}
            </p>
          </article>
          <article className="ommm-stack-card">
            <p className="text-xs uppercase tracking-wide text-sage-500">{labels.immediateCampaigns}</p>
            <p className="mt-2 text-2xl font-semibold text-sage-900">
              {analytics.funnel.immediateCampaigns}
            </p>
          </article>
        </div>
        <ul className="mt-3 space-y-2">
          {analytics.channelBreakdown.length === 0 ? (
            <li className="ommm-body-muted text-sm">{labels.emptyChannels}</li>
          ) : (
            analytics.channelBreakdown.map((item) => (
              <li key={item.channel} className="ommm-inset-row flex flex-wrap items-center gap-3 text-xs">
                <span className="font-medium text-sage-800">{item.channel}</span>
                <span className="text-sage-500">{labels.deliveriesShort}: {item.deliveries}</span>
              </li>
            ))
          )}
        </ul>
        <h3 className="mt-4 text-sm font-semibold text-sage-900">{labels.dailyTrend}</h3>
        <ul className="mt-2 space-y-2">
          {trendRows.length === 0 ? (
            <li className="ommm-body-muted text-sm">{labels.emptyTrend}</li>
          ) : (
            trendRows.map((day) => (
              <li key={day.date} className="ommm-inset-row flex flex-wrap items-center gap-3 text-xs">
                <span className="font-medium text-sage-800">{day.date}</span>
                <span className="text-sage-500">{labels.campaignsShort}: {day.campaigns}</span>
                <span className="text-sage-500">{labels.deliveriesShort}: {day.deliveries}</span>
              </li>
            ))
          )}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-sage-900">{t("deliveryListHeading")}</h2>
        <ul className="mt-3 space-y-2">
          {deliveries.length === 0 ? (
            <li className="ommm-body-muted text-sm">{t("deliveryListEmpty")}</li>
          ) : (
            deliveries.slice(0, 20).map((row) => (
              <li key={row.id} className="ommm-inset-row flex flex-wrap items-center gap-3 text-xs">
                <span className="font-medium text-sage-800">{row.recipientEmail}</span>
                <span className="text-sage-500">{row.audience}</span>
                <span className="text-sage-500">{row.scheduled ? t("scheduledTag") : t("immediateTag")}</span>
                <span className="text-sage-500">{row.subject}</span>
              </li>
            ))
          )}
        </ul>
      </section>
      <p className="ommm-body-muted mt-4 text-sm">{t("deliveryNote")}</p>
    </AccountPageFrame>
  );
}
