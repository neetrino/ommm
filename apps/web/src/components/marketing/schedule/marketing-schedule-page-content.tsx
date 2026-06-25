import { MarketingScheduleAnimatedSections } from "@/components/marketing/schedule/marketing-schedule-animated-sections";
import { MarketingScheduleView } from "@/components/marketing/schedule/marketing-schedule-view";
import { fetchPublicScheduleItems } from "@/components/marketing/schedule/marketing-schedule-data";

/** Schedule card paints from SSR data; client refresh keeps spot counts live. */
export async function MarketingSchedulePageLayout() {
  const { items } = await fetchPublicScheduleItems();

  return (
    <MarketingScheduleAnimatedSections
      scheduleView={<MarketingScheduleView initialItems={items} />}
    />
  );
}
