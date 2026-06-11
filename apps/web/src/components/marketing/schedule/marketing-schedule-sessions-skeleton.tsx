import { SCHEDULE_ROW_DIVIDER } from "@/components/marketing/schedule/schedule-public-design";

const SKELETON_ROW_COUNT = 4;

/** Session list placeholder — card chrome paints first, rows stream in. */
export function MarketingScheduleSessionsSkeleton() {
  return (
    <ul className="list-none overflow-hidden p-0" aria-hidden>
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
        <li
          key={index}
          className={`flex animate-pulse flex-col gap-4 py-5 sm:grid sm:grid-cols-[minmax(0,5.5rem)_minmax(0,1fr)_auto] sm:items-center sm:gap-6 ${SCHEDULE_ROW_DIVIDER}`}
        >
          <div className="space-y-2">
            <div className="h-4 w-12 rounded-md bg-white/55" />
            <div className="h-3 w-14 rounded-md bg-white/40" />
          </div>
          <div className="min-w-0 space-y-2">
            <div className="h-4 w-3/4 max-w-xs rounded-md bg-white/55" />
            <div className="h-3 w-1/2 max-w-[12rem] rounded-md bg-white/40" />
            <div className="h-3 w-24 rounded-md bg-white/35" />
          </div>
          <div className="flex justify-end">
            <div className="h-9 w-20 rounded-full bg-white/50 sm:w-24" />
          </div>
        </li>
      ))}
    </ul>
  );
}
