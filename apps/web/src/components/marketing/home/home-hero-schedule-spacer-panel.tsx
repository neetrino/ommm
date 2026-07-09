import { getTranslations } from "next-intl/server";
import { HomePageReveal } from "@/components/marketing/home/home-page-reveal";
import {
  HOME_HERO_SCHEDULE_SPACER_LAYOUT,
  HOME_PRESALE_PACKAGES_PANEL_MIN_HEIGHT,
} from "@/components/marketing/home/home-hero-schedule-spacer-tokens";
import spacerStyles from "@/components/marketing/home/home-hero-schedule-spacer-panel.module.css";
import scheduleStyles from "@/components/marketing/home/home-weekly-schedule-banner.module.css";
import {
  HOME_WEEKLY_SCHEDULE_FIGMA,
  HOME_WEEKLY_SCHEDULE_LAYOUT,
  HOME_WEEKLY_SCHEDULE_MOBILE_FIGMA,
  HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT,
} from "@/components/marketing/home/home-weekly-schedule-tokens";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

type HomeHeroScheduleSpacerPanelProps = {
  locale: string;
};

/**
 * Presale packages panel between hero video and Weekly Schedule — same shell and title type as schedule.
 */
export async function HomeHeroScheduleSpacerPanel({ locale }: HomeHeroScheduleSpacerPanelProps) {
  const t = await getTranslations({ locale, namespace: "marketingPublic.home" });

  return (
    <section
      aria-labelledby="home-presale-packages-heading"
      className={`${marketingMontserrat.variable} ${spacerStyles.section}`}
      style={{
        ["--home-spacer-hero-overlap" as string]: HOME_HERO_SCHEDULE_SPACER_LAYOUT.sectionHeroOverlap,
        ["--home-spacer-hero-overlap-lg" as string]:
          HOME_HERO_SCHEDULE_SPACER_LAYOUT.sectionHeroOverlapLg,
        ["--home-spacer-panel-top-inset" as string]:
          HOME_HERO_SCHEDULE_SPACER_LAYOUT.sectionPanelTopInset,
        ["--home-spacer-panel-top-inset-lg" as string]:
          HOME_HERO_SCHEDULE_SPACER_LAYOUT.sectionPanelTopInsetLg,
        ["--home-spacer-section-bottom-gap" as string]:
          HOME_HERO_SCHEDULE_SPACER_LAYOUT.sectionBottomGap,
        ["--home-spacer-section-bottom-gap-lg" as string]:
          HOME_HERO_SCHEDULE_SPACER_LAYOUT.sectionBottomGap,
        ["--home-presale-panel-min-height" as string]: HOME_PRESALE_PACKAGES_PANEL_MIN_HEIGHT,
        ["--home-schedule-section-px" as string]: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sectionPaddingX,
        ["--home-schedule-panel-inner-px" as string]:
          HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.panelInnerPaddingX,
        ["--home-schedule-panel-max-width" as string]: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.panelMaxWidth,
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
        ["--home-schedule-header-max-width" as string]: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.headerMaxWidth,
        ["--home-schedule-heading-color" as string]: HOME_WEEKLY_SCHEDULE_FIGMA.headingColor,
        ["--home-schedule-title-size" as string]: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.titleFontSize,
        ["--home-schedule-title-size-lg" as string]: HOME_WEEKLY_SCHEDULE_LAYOUT.titleFontSize,
        ["--home-schedule-title-line-height" as string]: String(
          HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.titleLineHeight,
        ),
        ["--home-schedule-title-line-height-lg" as string]: String(
          HOME_WEEKLY_SCHEDULE_LAYOUT.titleLineHeight,
        ),
        ["--home-schedule-heading-max-width-lg" as string]: HOME_WEEKLY_SCHEDULE_LAYOUT.headingMaxWidth,
      }}
    >
      <div className={scheduleStyles.shell}>
        <HomePageReveal index={0} className={scheduleStyles.panel}>
          <div className={`${scheduleStyles.inner} ${spacerStyles.presaleInner}`}>
            <header className={scheduleStyles.header}>
              <h2
                id="home-presale-packages-heading"
                className={`${scheduleStyles.title} font-serif font-semibold tracking-tight text-balance`}
              >
                {t("presalePackagesTitle")}
              </h2>
            </header>
          </div>
        </HomePageReveal>
      </div>
    </section>
  );
}
