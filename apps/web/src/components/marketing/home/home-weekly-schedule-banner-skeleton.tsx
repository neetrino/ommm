import {
  HOME_WEEKLY_SCHEDULE_FIGMA,
  HOME_WEEKLY_SCHEDULE_INNER_CLASS,
  HOME_WEEKLY_SCHEDULE_LAYOUT,
  HOME_WEEKLY_SCHEDULE_SECTION_CLASS,
} from "@/components/marketing/home/home-weekly-schedule-tokens";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

/** Placeholder while the weekly schedule panel loads (Suspense fallback). */
export function HomeWeeklyScheduleBannerSkeleton() {
  return (
    <section
      aria-hidden
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
        <div className={`${HOME_WEEKLY_SCHEDULE_INNER_CLASS} animate-pulse`}>
          <div className="mx-auto flex max-w-md flex-col items-center gap-4">
            <div className="h-10 w-3/4 rounded-full bg-white/20" />
            <div className="h-4 w-full rounded-full bg-white/15" />
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {Array.from({ length: 7 }, (_, index) => (
              <div
                key={index}
                className="h-28 rounded-3xl bg-white/15 sm:h-32"
              />
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <div className="h-11 w-40 rounded-full bg-white/20" />
          </div>
        </div>
      </div>
    </section>
  );
}
