import { getTranslations } from "next-intl/server";
import { HomeHeroCtaButton } from "@/components/marketing/home/home-hero-cta-button";
import { HomeWeeklyScheduleLiveGrid } from "@/components/marketing/home/home-weekly-schedule-live-grid";
import {
  HOME_WEEKLY_SCHEDULE_FIGMA,
  HOME_WEEKLY_SCHEDULE_INNER_CLASS,
  HOME_WEEKLY_SCHEDULE_LAYOUT,
  HOME_WEEKLY_SCHEDULE_SECTION_CLASS,
} from "@/components/marketing/home/home-weekly-schedule-tokens";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

type HomeWeeklyScheduleBannerProps = {
  locale: string;
};

/**
 * Figma weekly schedule panel `196:1293` — renders instantly with preview rows, live data hydrates client-side.
 */
export async function HomeWeeklyScheduleBanner({ locale }: HomeWeeklyScheduleBannerProps) {
  const t = await getTranslations({ locale, namespace: "marketingPublic.home" });
  const heroT = await getTranslations({ locale, namespace: "marketingPublic.hero" });

  return (
    <section
      aria-labelledby="home-weekly-schedule-heading"
      aria-describedby="home-weekly-schedule-subtitle"
      className={`${marketingMontserrat.variable} ${HOME_WEEKLY_SCHEDULE_SECTION_CLASS}`}
      style={{ marginTop: HOME_WEEKLY_SCHEDULE_LAYOUT.sectionTopGap }}
    >
      <div className="w-full min-w-0 overflow-hidden pt-4 pb-10 sm:pt-6 sm:pb-12 md:pt-8 md:pb-16">
        <div className={HOME_WEEKLY_SCHEDULE_INNER_CLASS}>
          <header
            className="mx-auto flex flex-col items-center gap-4 text-center sm:gap-7"
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

          <HomeWeeklyScheduleLiveGrid locale={locale} />

          <div className="mt-8 flex justify-center md:mt-10">
            <HomeHeroCtaButton
              href="/schedule"
              label={heroT("primaryCta")}
              variant="booking"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
