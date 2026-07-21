import { getTranslations } from "next-intl/server";
import { HomeHeroCtaButton } from "@/components/marketing/home/home-hero-cta-button";
import { HomePageReveal } from "@/components/marketing/home/home-page-reveal";
import { HomeWeeklyScheduleLiveGrid } from "@/components/marketing/home/home-weekly-schedule-live-grid";
import { fetchPublicScheduleItems } from "@/components/marketing/schedule/marketing-schedule-data";
import { ScheduleEnglishLocaleProvider } from "@/components/marketing/schedule/schedule-english-locale-provider";
import styles from "@/components/marketing/home/home-weekly-schedule-banner.module.css";
import {
  HOME_WEEKLY_SCHEDULE_FIGMA,
  HOME_WEEKLY_SCHEDULE_LAYOUT,
  HOME_WEEKLY_SCHEDULE_MOBILE_FIGMA,
  HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT,
} from "@/components/marketing/home/home-weekly-schedule-tokens";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import { SCHEDULE_UI_LOCALE } from "@/lib/schedule-ui-locale";

type HomeWeeklyScheduleBannerProps = {
  /** When true, Presale continues the same yellow card — square bottom, no outer bottom gap. */
  flushBottomWithPresale?: boolean;
};

/**
 * Figma weekly schedule — mobile panel `97:5733`, desktop panel `196:1293`.
 * Copy and day labels stay English even when the site locale is hy/ru.
 */
export async function HomeWeeklyScheduleBanner({
  flushBottomWithPresale = false,
}: HomeWeeklyScheduleBannerProps) {
  const [t, heroT, { items }] = await Promise.all([
    getTranslations({ locale: SCHEDULE_UI_LOCALE, namespace: "marketingPublic.home" }),
    getTranslations({ locale: SCHEDULE_UI_LOCALE, namespace: "marketingPublic.hero" }),
    fetchPublicScheduleItems(),
  ]);
  const scheduleCta = (
    <HomeHeroCtaButton href="/schedule" label={heroT("primaryCta")} variant="booking" />
  );

  return (
    <section
      aria-labelledby="home-weekly-schedule-heading"
      aria-describedby="home-weekly-schedule-subtitle"
      className={`${marketingMontserrat.variable} ${styles.section} ${
        flushBottomWithPresale ? styles.sectionFlushBottom : ""
      }`}
      style={{
        ["--home-schedule-hero-overlap" as string]:
          HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sectionHeroOverlap,
        ["--home-schedule-hero-overlap-lg" as string]:
          HOME_WEEKLY_SCHEDULE_LAYOUT.sectionHeroOverlap,
        ["--home-schedule-panel-top-inset" as string]:
          HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sectionPanelTopInset,
        ["--home-schedule-panel-top-inset-lg" as string]:
          HOME_WEEKLY_SCHEDULE_LAYOUT.sectionPanelTopInset,
        ["--home-schedule-section-padding-bottom" as string]: flushBottomWithPresale
          ? "0px"
          : HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sectionOuterPaddingBottom,
        ["--home-schedule-section-padding-bottom-lg" as string]: flushBottomWithPresale
          ? "0px"
          : HOME_WEEKLY_SCHEDULE_LAYOUT.sectionOuterPaddingBottom,
        ["--home-schedule-section-px" as string]: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sectionPaddingX,
        ["--home-schedule-panel-inner-px" as string]:
          HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.panelInnerPaddingX,
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
        <HomePageReveal
          index={0}
          className={`${styles.panel} ${flushBottomWithPresale ? styles.panelFlushBottom : ""}`}
        >
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

            <ScheduleEnglishLocaleProvider>
              <div className={styles.gridWrap}>
                <HomeWeeklyScheduleLiveGrid
                  locale={SCHEDULE_UI_LOCALE}
                  initialItems={items}
                />
              </div>

              <div className={styles.cta}>{scheduleCta}</div>
            </ScheduleEnglishLocaleProvider>
          </div>
        </HomePageReveal>
      </div>
    </section>
  );
}
