import { getTranslations } from "next-intl/server";
import { HomeHeroCtaButton } from "@/components/marketing/home/home-hero-cta-button";
import { HomeWeeklyScheduleGridDeferred } from "@/components/marketing/home/home-deferred-sections";
import styles from "@/components/marketing/home/home-weekly-schedule-banner.module.css";
import {
  HOME_WEEKLY_SCHEDULE_FIGMA,
  HOME_WEEKLY_SCHEDULE_LAYOUT,
  HOME_WEEKLY_SCHEDULE_MOBILE_FIGMA,
  HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT,
} from "@/components/marketing/home/home-weekly-schedule-tokens";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

type HomeWeeklyScheduleBannerProps = {
  locale: string;
};

/**
 * Figma weekly schedule — mobile panel `97:5733`, desktop panel `196:1293`.
 */
export async function HomeWeeklyScheduleBanner({ locale }: HomeWeeklyScheduleBannerProps) {
  const t = await getTranslations({ locale, namespace: "marketingPublic.home" });
  const heroT = await getTranslations({ locale, namespace: "marketingPublic.hero" });
  const scheduleCta = (
    <HomeHeroCtaButton href="/schedule" label={heroT("primaryCta")} variant="booking" />
  );

  return (
    <section
      aria-labelledby="home-weekly-schedule-heading"
      aria-describedby="home-weekly-schedule-subtitle"
      className={`${marketingMontserrat.variable} ${styles.section}`}
      style={{
        ["--home-schedule-hero-overlap" as string]:
          HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sectionHeroOverlap,
        ["--home-schedule-hero-overlap-lg" as string]: HOME_WEEKLY_SCHEDULE_LAYOUT.sectionHeroOverlap,
        ["--home-schedule-panel-top-inset" as string]:
          HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sectionPanelTopInset,
        ["--home-schedule-panel-top-inset-lg" as string]:
          HOME_WEEKLY_SCHEDULE_LAYOUT.sectionPanelTopInset,
        ["--home-schedule-section-padding-bottom" as string]:
          HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sectionOuterPaddingBottom,
        ["--home-schedule-section-padding-bottom-lg" as string]:
          HOME_WEEKLY_SCHEDULE_LAYOUT.sectionOuterPaddingBottom,
        ["--home-schedule-section-px" as string]: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sectionPaddingX,
        ["--home-schedule-panel-inner-px" as string]:
          HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.panelInnerPaddingX,
        ["--home-schedule-cta-below-gap" as string]: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.ctaBelowPanelGap,
        ["--home-schedule-panel-max-width" as string]: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.panelMaxWidth,
        ["--home-schedule-panel-content-width" as string]:
          HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.panelContentWidth,
        ["--home-schedule-header-max-width" as string]: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.headerMaxWidth,
        ["--home-schedule-panel-radius" as string]: `${HOME_WEEKLY_SCHEDULE_MOBILE_FIGMA.panelRadiusPx}px`,
        ["--home-schedule-panel-radius-lg" as string]: `${HOME_WEEKLY_SCHEDULE_FIGMA.panelRadiusPx}px`,
        ["--home-schedule-panel-fill" as string]: HOME_WEEKLY_SCHEDULE_FIGMA.panelFill,
        ["--home-schedule-panel-gap" as string]: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.panelGap,
        ["--home-schedule-panel-gap-lg" as string]: `${HOME_WEEKLY_SCHEDULE_LAYOUT.headerGapPx}px`,
        ["--home-schedule-inner-px-lg" as string]: HOME_WEEKLY_SCHEDULE_LAYOUT.sectionPaddingX,
        ["--home-schedule-panel-padding-y" as string]: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.panelPaddingY,
        ["--home-schedule-panel-padding-top-lg" as string]: HOME_WEEKLY_SCHEDULE_LAYOUT.sectionPaddingTop,
        ["--home-schedule-panel-padding-bottom-lg" as string]:
          HOME_WEEKLY_SCHEDULE_LAYOUT.sectionPaddingBottom,
        ["--home-schedule-header-subtitle-gap" as string]:
          HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.headerTitleToSubtitleGap,
        ["--home-schedule-heading-color" as string]: HOME_WEEKLY_SCHEDULE_FIGMA.headingColor,
        ["--home-schedule-title-size" as string]: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.titleFontSize,
        ["--home-schedule-title-size-lg" as string]: HOME_WEEKLY_SCHEDULE_LAYOUT.titleFontSize,
        ["--home-schedule-title-line-height" as string]: String(
          HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.titleLineHeight,
        ),
        ["--home-schedule-title-line-height-lg" as string]: String(
          HOME_WEEKLY_SCHEDULE_LAYOUT.titleLineHeight,
        ),
        ["--home-schedule-subtitle-max-width" as string]:
          HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.subtitleMaxWidth,
        ["--home-schedule-subtitle-max-width-lg" as string]:
          HOME_WEEKLY_SCHEDULE_LAYOUT.subtitleMaxWidth,
        ["--home-schedule-subtitle-size" as string]: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.subtitleFontSize,
        ["--home-schedule-subtitle-size-lg" as string]: "1rem",
        ["--home-schedule-subtitle-line-height" as string]: String(
          HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.subtitleLineHeight,
        ),
        ["--home-schedule-subtitle-line-height-lg" as string]: "1.6",
        ["--home-schedule-heading-max-width-lg" as string]: HOME_WEEKLY_SCHEDULE_LAYOUT.headingMaxWidth,
      }}
    >
      <div className={styles.shell}>
        <div className={styles.panel}>
          <div className={styles.inner}>
            <header className={styles.header}>
              <h2 id="home-weekly-schedule-heading" className={`${styles.title} font-serif font-semibold tracking-tight text-balance`}>
                {t("weeklyScheduleTitle")}
              </h2>
              <p
                id="home-weekly-schedule-subtitle"
                className={`${styles.subtitle} ${marketingMontserrat.className} text-pretty font-normal tracking-[0.01em]`}
              >
                {t("weeklyScheduleSubtitle")}
              </p>
            </header>

            <div className={styles.gridWrap}>
              <HomeWeeklyScheduleGridDeferred locale={locale} />
            </div>

            <div className={styles.ctaDesktop}>{scheduleCta}</div>
          </div>
        </div>

        <div className={styles.ctaMobile}>{scheduleCta}</div>
      </div>
    </section>
  );
}
