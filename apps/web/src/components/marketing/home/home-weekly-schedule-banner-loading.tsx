import {
  HOME_HERO_SCHEDULE_SPACER_LAYOUT,
  HOME_PRESALE_PACKAGES_PANEL_MIN_HEIGHT,
} from "@/components/marketing/home/home-hero-schedule-spacer-tokens";
import spacerStyles from "@/components/marketing/home/home-hero-schedule-spacer-panel.module.css";
import styles from "@/components/marketing/home/home-weekly-schedule-banner.module.css";
import {
  HOME_WEEKLY_SCHEDULE_FIGMA,
  HOME_WEEKLY_SCHEDULE_LAYOUT,
  HOME_WEEKLY_SCHEDULE_MOBILE_FIGMA,
  HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT,
} from "@/components/marketing/home/home-weekly-schedule-tokens";

/** Reserves presale + weekly schedule space while `/schedule/public` streams in. */
export function HomeWeeklyScheduleBannerLoading() {
  return (
    <>
      <section
        aria-hidden
        className={spacerStyles.section}
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
          ["--home-schedule-panel-max-width" as string]: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.panelMaxWidth,
          ["--home-schedule-panel-radius" as string]: `${HOME_WEEKLY_SCHEDULE_MOBILE_FIGMA.panelRadiusPx}px`,
          ["--home-schedule-panel-radius-lg" as string]: `${HOME_WEEKLY_SCHEDULE_FIGMA.panelRadiusPx}px`,
          ["--home-schedule-panel-fill" as string]: HOME_WEEKLY_SCHEDULE_FIGMA.panelFill,
        }}
      >
        <div className={styles.shell}>
          <div
            className={`${styles.panel} ${spacerStyles.presaleInner} min-h-[clamp(22rem,55vw,36rem)] animate-pulse`}
          />
        </div>
      </section>
      <section
        aria-hidden
        className={`${styles.section} ${styles.sectionStacked}`}
        style={{
          ["--home-schedule-stack-gap" as string]: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sectionStackGap,
          ["--home-schedule-stack-gap-lg" as string]: HOME_WEEKLY_SCHEDULE_LAYOUT.sectionStackGap,
          ["--home-schedule-section-padding-bottom" as string]:
            HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sectionOuterPaddingBottom,
          ["--home-schedule-section-px" as string]: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sectionPaddingX,
          ["--home-schedule-panel-max-width" as string]: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.panelMaxWidth,
          ["--home-schedule-panel-radius" as string]: `${HOME_WEEKLY_SCHEDULE_MOBILE_FIGMA.panelRadiusPx}px`,
          ["--home-schedule-panel-fill" as string]: HOME_WEEKLY_SCHEDULE_FIGMA.panelFill,
        }}
      >
        <div className={styles.shell}>
          <div className={`${styles.panel} min-h-[clamp(22rem,55vw,36rem)] animate-pulse`} />
        </div>
      </section>
    </>
  );
}
