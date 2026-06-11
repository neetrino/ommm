import { MarketingScheduleAnimatedSections } from "@/components/marketing/schedule/marketing-schedule-animated-sections";
import { MarketingScheduleView } from "@/components/marketing/schedule/marketing-schedule-view";

/** Schedule card paints immediately; sessions hydrate on the client like Contact form. */
export function MarketingSchedulePageLayout() {
  return (
    <MarketingScheduleAnimatedSections
      scheduleView={<MarketingScheduleView initialItems={[]} />}
    />
  );
}
