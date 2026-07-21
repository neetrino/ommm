import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { HomePageReveal } from "@/components/marketing/home/home-page-reveal";
import {
  HOME_HERO_SCHEDULE_SPACER_LAYOUT,
} from "@/components/marketing/home/home-hero-schedule-spacer-tokens";
import spacerStyles from "@/components/marketing/home/home-hero-schedule-spacer-panel.module.css";
import { MARKETING_INNER_PAGE_CONTAINER_CLASS } from "@/components/marketing/marketing-content-layout";
import alignStyles from "@/components/marketing/marketing-inner-page-align.module.css";
import { MarketingMembershipPackagesSkeleton } from "@/components/marketing/packages/marketing-membership-packages-skeleton";
import { MarketingPackagesPageContent } from "@/components/marketing/packages/marketing-packages-page-content";
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
  /** When true, sits under Weekly Schedule as the lower half of one yellow card. */
  attachBelowSchedule?: boolean;
};

/**
 * Presale packages panel — under hero alone, or attached below Weekly Schedule (shared yellow card).
 */
export async function HomeHeroScheduleSpacerPanel({
  locale,
  attachBelowSchedule = false,
}: HomeHeroScheduleSpacerPanelProps) {
  const t = await getTranslations({ locale, namespace: "marketingPublic.home" });

  const sectionBottomGap = attachBelowSchedule
    ? HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sectionOuterPaddingBottom
    : HOME_HERO_SCHEDULE_SPACER_LAYOUT.sectionBottomGap;
  const sectionBottomGapLg = attachBelowSchedule
    ? HOME_WEEKLY_SCHEDULE_LAYOUT.sectionOuterPaddingBottom
    : HOME_HERO_SCHEDULE_SPACER_LAYOUT.sectionBottomGap;

  return (
    <section
      aria-labelledby="home-presale-packages-heading"
      className={`${marketingMontserrat.variable} ${spacerStyles.section} ${
        attachBelowSchedule ? spacerStyles.sectionAttached : ""
      }`}
      style={{
        ...(attachBelowSchedule
          ? {
              ["--home-spacer-hero-overlap" as string]: "0px",
              ["--home-spacer-hero-overlap-lg" as string]: "0px",
              ["--home-spacer-panel-top-inset" as string]: "0px",
              ["--home-spacer-panel-top-inset-lg" as string]: "0px",
            }
          : {
              ["--home-spacer-hero-overlap" as string]:
                HOME_HERO_SCHEDULE_SPACER_LAYOUT.sectionHeroOverlap,
              ["--home-spacer-hero-overlap-lg" as string]:
                HOME_HERO_SCHEDULE_SPACER_LAYOUT.sectionHeroOverlapLg,
              ["--home-spacer-panel-top-inset" as string]:
                HOME_HERO_SCHEDULE_SPACER_LAYOUT.sectionPanelTopInset,
              ["--home-spacer-panel-top-inset-lg" as string]:
                HOME_HERO_SCHEDULE_SPACER_LAYOUT.sectionPanelTopInsetLg,
            }),
        ["--home-spacer-section-bottom-gap" as string]: sectionBottomGap,
        ["--home-spacer-section-bottom-gap-lg" as string]: sectionBottomGapLg,
        ["--home-schedule-section-px" as string]: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sectionPaddingX,
        ["--home-schedule-panel-inner-px" as string]:
          HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.panelInnerPaddingX,
        ["--home-schedule-panel-max-width" as string]: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.panelMaxWidth,
        ["--home-schedule-panel-radius" as string]: `${HOME_WEEKLY_SCHEDULE_MOBILE_FIGMA.panelRadiusPx}px`,
        ["--home-schedule-panel-radius-lg" as string]: `${HOME_WEEKLY_SCHEDULE_FIGMA.panelRadiusPx}px`,
        ["--home-schedule-panel-fill" as string]: HOME_WEEKLY_SCHEDULE_FIGMA.panelFill,
        ["--home-spacer-panel-padding-top" as string]: HOME_HERO_SCHEDULE_SPACER_LAYOUT.panelPaddingTop,
        ["--home-spacer-panel-padding-top-lg" as string]:
          HOME_HERO_SCHEDULE_SPACER_LAYOUT.panelPaddingTopLg,
        ["--home-spacer-panel-padding-bottom" as string]:
          HOME_HERO_SCHEDULE_SPACER_LAYOUT.panelPaddingBottom,
        ["--home-spacer-panel-padding-bottom-lg" as string]:
          HOME_HERO_SCHEDULE_SPACER_LAYOUT.panelPaddingBottomLg,
        ["--home-spacer-title-to-content-gap" as string]:
          HOME_HERO_SCHEDULE_SPACER_LAYOUT.titleToContentGap,
        ["--home-spacer-title-to-content-gap-lg" as string]:
          HOME_HERO_SCHEDULE_SPACER_LAYOUT.titleToContentGapLg,
        ["--home-spacer-title-size" as string]: HOME_HERO_SCHEDULE_SPACER_LAYOUT.titleFontSize,
        ["--home-spacer-title-size-lg" as string]: HOME_HERO_SCHEDULE_SPACER_LAYOUT.titleFontSizeLg,
        ["--home-spacer-title-line-height" as string]: String(
          HOME_HERO_SCHEDULE_SPACER_LAYOUT.titleLineHeight,
        ),
        ["--home-spacer-title-line-height-lg" as string]: String(
          HOME_HERO_SCHEDULE_SPACER_LAYOUT.titleLineHeightLg,
        ),
        ["--home-schedule-inner-px-lg" as string]: HOME_WEEKLY_SCHEDULE_LAYOUT.sectionPaddingX,
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
        ["--home-schedule-panel-content-width" as string]:
          HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.panelContentWidth,
      }}
    >
      <div className={scheduleStyles.shell}>
        <HomePageReveal
          index={0}
          className={`${scheduleStyles.panel} ${spacerStyles.presalePanel} ${
            attachBelowSchedule ? spacerStyles.presalePanelAttached : ""
          }`}
        >
          <div className={spacerStyles.presaleInner}>
            <header className={`${scheduleStyles.header} ${spacerStyles.presaleHeader}`}>
              <h2
                id="home-presale-packages-heading"
                className={`${spacerStyles.presaleTitle} font-serif font-semibold tracking-tight text-balance`}
              >
                {t("presalePackagesTitle")}
              </h2>
            </header>

            <div
              className={`${MARKETING_INNER_PAGE_CONTAINER_CLASS} ${spacerStyles.presalePackagesShell}`}
            >
              <div className={`${alignStyles.innerPageContent} ${spacerStyles.presalePackagesWrap}`}>
                <Suspense fallback={<MarketingMembershipPackagesSkeleton />}>
                  <MarketingPackagesPageContent locale={locale} />
                </Suspense>
              </div>
            </div>
          </div>
        </HomePageReveal>
      </div>
    </section>
  );
}
