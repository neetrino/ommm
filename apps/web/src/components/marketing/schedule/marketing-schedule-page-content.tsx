import { MarketingScheduleAnimatedSections } from "@/components/marketing/schedule/marketing-schedule-animated-sections";
import { MarketingScheduleView } from "@/components/marketing/schedule/marketing-schedule-view";
import { fetchPublicScheduleItems } from "@/components/marketing/schedule/marketing-schedule-data";

type MarketingSchedulePageLayoutProps = {
  title: string;
};

/** Schedule card paints from SSR data; client refresh keeps spot counts live. */
export async function MarketingSchedulePageLayout({
  title,
}: MarketingSchedulePageLayoutProps) {
  const { items } = await fetchPublicScheduleItems();

  return (
    <MarketingScheduleAnimatedSections
      scheduleView={
        <MarketingScheduleView initialItems={items} pageTitle={title} />
      }
    />
  );
}
