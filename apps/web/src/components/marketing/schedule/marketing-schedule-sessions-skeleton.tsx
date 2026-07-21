import styles from "@/components/marketing/home/home-weekly-schedule-session-row.module.css";
import {
  HOME_WEEKLY_SCHEDULE_FIGMA,
  HOME_WEEKLY_SCHEDULE_LAYOUT,
  HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT,
} from "@/components/marketing/home/home-weekly-schedule-tokens";

const SKELETON_ROW_COUNT = 4;

/** Session list placeholder — matches weekly schedule card chrome without a date chip. */
export function MarketingScheduleSessionsSkeleton() {
  return (
    <>
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
        <li key={index} className="list-none" aria-hidden>
          <article
            className={`${styles.row} w-full min-w-0 animate-pulse`}
            style={{
              background: "rgb(255 255 255 / 0.42)",
              ["--home-schedule-row-gradient" as string]: "rgb(255 255 255 / 0.42)",
              ["--home-schedule-row-min-h" as string]: `${HOME_WEEKLY_SCHEDULE_FIGMA.sessionRowMinHeightPx}px`,
              ["--home-schedule-row-radius" as string]: HOME_WEEKLY_SCHEDULE_LAYOUT.sessionRowRadius,
              ["--home-schedule-row-radius-mobile" as string]:
                HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sessionRowRadius,
              ["--home-schedule-row-padding" as string]:
                HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sessionRowPadding,
            }}
          >
            <div className={styles.timeCluster}>
              <div className="h-5 w-5 shrink-0 rounded-full bg-white/50" />
              <div className="h-5 w-16 rounded-md bg-white/55" />
            </div>
            <div className={`${styles.classBlock} gap-2`}>
              <div className="h-5 w-3/4 max-w-xs rounded-md bg-white/55" />
              <div className="h-4 w-1/2 max-w-[12rem] rounded-md bg-white/40" />
            </div>
            <div className={`${styles.duration} h-5 w-14 rounded-md bg-white/40`} />
            <div className={`${styles.spots} h-5 w-24 rounded-md bg-white/40`} />
            <div className={styles.bookAction}>
              <div className="h-9 w-20 rounded-full bg-white/50 sm:h-12 sm:w-[9.0625rem]" />
            </div>
          </article>
        </li>
      ))}
    </>
  );
}
