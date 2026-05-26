import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { HomeMarketingPillLink } from "@/components/marketing/home/home-marketing-pill-link";
import { HomeWeeklyScheduleGrid } from "@/components/marketing/home/home-weekly-schedule-grid";
import {
  HOME_WEEKLY_SCHEDULE_FIGMA,
  HOME_WEEKLY_SCHEDULE_INNER_CLASS,
  HOME_WEEKLY_SCHEDULE_LAYOUT,
  HOME_WEEKLY_SCHEDULE_SECTION_CLASS,
} from "@/components/marketing/home/home-weekly-schedule-tokens";
import { fetchPublicScheduleItems } from "@/components/marketing/schedule/marketing-schedule-data";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

type HomeWeeklyScheduleBannerProps = {
  locale: string;
};

/**
 * Figma frosted weekly schedule — panel `161:301`, heading `270:128`, grid `271:184`, CTA `172:1067`.
 */
export async function HomeWeeklyScheduleBanner({ locale }: HomeWeeklyScheduleBannerProps) {
  const t = await getTranslations({ locale, namespace: "marketingPublic.home" });
  const cookie = (await headers()).get("cookie") ?? "";
  const { items, loadErrorStatus } = await fetchPublicScheduleItems(cookie);

  return (
    <section
      aria-labelledby="home-weekly-schedule-heading"
      aria-describedby="home-weekly-schedule-subtitle"
      className={`${marketingMontserrat.variable} ${HOME_WEEKLY_SCHEDULE_SECTION_CLASS}`}
      style={{ marginTop: `calc(-1 * ${HOME_WEEKLY_SCHEDULE_LAYOUT.heroOverlap})` }}
    >
      <div
        className="w-full min-w-0 overflow-hidden py-8 sm:py-12 md:py-14"
        style={{
          backgroundColor: HOME_WEEKLY_SCHEDULE_FIGMA.panelFill,
          borderRadius: HOME_WEEKLY_SCHEDULE_LAYOUT.panelRadius,
        }}
      >
        <div className={HOME_WEEKLY_SCHEDULE_INNER_CLASS}>
          <header
            className="mx-auto flex flex-col items-center gap-4 text-center sm:gap-6"
            style={{ maxWidth: HOME_WEEKLY_SCHEDULE_LAYOUT.headingMaxWidth }}
          >
            <h2
              id="home-weekly-schedule-heading"
              className="font-serif font-semibold tracking-tight text-balance"
              style={{
                color: HOME_WEEKLY_SCHEDULE_FIGMA.headingColor,
                fontSize: HOME_WEEKLY_SCHEDULE_LAYOUT.titleFontSize,
                lineHeight: HOME_WEEKLY_SCHEDULE_LAYOUT.titleLineHeight,
              }}
            >
              {t("weeklyScheduleTitle")}
            </h2>
            <p
              id="home-weekly-schedule-subtitle"
              className={`${marketingMontserrat.className} text-pretty text-sm font-normal leading-[1.6] tracking-[0.01em] sm:text-base`}
              style={{
                color: HOME_WEEKLY_SCHEDULE_FIGMA.headingColor,
                maxWidth: HOME_WEEKLY_SCHEDULE_LAYOUT.subtitleMaxWidth,
              }}
            >
              {t("weeklyScheduleSubtitle")}
            </p>
          </header>

          {loadErrorStatus !== null ? (
            <p
              className={`${marketingMontserrat.className} mx-auto mt-8 max-w-lg text-center text-sm font-semibold leading-6`}
              style={{ color: HOME_WEEKLY_SCHEDULE_FIGMA.scheduleInk }}
            >
              {t("weeklyScheduleLoadFailed", { status: loadErrorStatus })}
            </p>
          ) : (
            <HomeWeeklyScheduleGrid locale={locale} items={items} />
          )}

          <div className="mt-8 flex justify-center md:mt-10">
            <HomeMarketingPillLink
              href="/schedule"
              label={t("viewSchedule")}
              variant="silverSchedule"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
