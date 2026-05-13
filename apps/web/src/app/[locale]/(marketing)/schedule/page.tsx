import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MarketingScheduleLiveView } from "@/components/marketing/schedule/marketing-schedule-live-view";
import { SCHEDULE_PAGE_BG } from "@/components/marketing/schedule/schedule-public-design";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketingPages.schedule" });
  return {
    title: t("pageTitle"),
    description: t("metaDescription"),
  };
}

export default async function ScheduleMarketingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketingPages.schedule" });

  return (
    <section
      className={`${SCHEDULE_PAGE_BG} ommm-section w-full min-h-[calc(100vh-10rem)]`}
      aria-label={t("pageTitle")}
    >
      <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden>
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-cream-50/50 blur-3xl" />
        <div className="absolute right-[-6rem] top-1/2 h-80 w-80 rounded-full bg-blue-100/65 blur-3xl" />
        <div className="absolute bottom-[-5rem] left-1/3 h-72 w-72 rounded-full bg-peach-100/45 blur-3xl" />
      </div>
      <div className="ommm-container relative">
        <MarketingScheduleLiveView locale={locale} />
      </div>
    </section>
  );
}
