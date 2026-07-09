import styles from "@/components/marketing/home/home-weekly-schedule-banner.module.css";
import {
  HOME_WEEKLY_SCHEDULE_FIGMA,
  HOME_WEEKLY_SCHEDULE_LAYOUT,
  HOME_WEEKLY_SCHEDULE_MOBILE_FIGMA,
  HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT,
} from "@/components/marketing/home/home-weekly-schedule-tokens";

type HomeWeeklyScheduleBannerLoadingProps = {
  /** When true, presale panel above owns hero overlap — schedule stacks below it. */
  stackBelowPresalePanel?: boolean;
};

/** Reserves weekly schedule space while `/schedule/public` streams in. */
export function HomeWeeklyScheduleBannerLoading({
  stackBelowPresalePanel = false,
}: HomeWeeklyScheduleBannerLoadingProps) {
  return (
    <section
      aria-hidden
      className={`${styles.section} ${stackBelowPresalePanel ? styles.sectionStacked : ""}`}
      style={{
        ...(stackBelowPresalePanel
          ? {
              ["--home-schedule-stack-gap" as string]:
                HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sectionStackGap,
              ["--home-schedule-stack-gap-lg" as string]:
                HOME_WEEKLY_SCHEDULE_LAYOUT.sectionStackGap,
            }
          : {
              ["--home-schedule-hero-overlap" as string]:
                HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sectionHeroOverlap,
              ["--home-schedule-hero-overlap-lg" as string]:
                HOME_WEEKLY_SCHEDULE_LAYOUT.sectionHeroOverlap,
              ["--home-schedule-panel-top-inset" as string]:
                HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sectionPanelTopInset,
              ["--home-schedule-panel-top-inset-lg" as string]:
                HOME_WEEKLY_SCHEDULE_LAYOUT.sectionPanelTopInset,
            }),
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
  );
}
