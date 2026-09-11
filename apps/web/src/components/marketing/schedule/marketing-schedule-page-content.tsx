import { MarketingScheduleAnimatedSections } from "@/components/marketing/schedule/marketing-schedule-animated-sections";
import { MarketingScheduleView } from "@/components/marketing/schedule/marketing-schedule-view";
import { fetchPublicScheduleItems } from "@/components/marketing/schedule/marketing-schedule-data";
import { resolveContactMapEmbedHtml } from "@/components/marketing/contact/contact-page-map";
import { fetchPublicStudioCached } from "@/lib/fetch-public-studio";

type MarketingSchedulePageLayoutProps = {
  title: string;
};

/** Public schedule only on the server — member badges/actions hydrate on the client. */
export async function MarketingSchedulePageLayout({
  title,
}: MarketingSchedulePageLayoutProps) {
  const [{ items }, studioRes] = await Promise.all([
    fetchPublicScheduleItems(),
    fetchPublicStudioCached(),
  ]);
  const studioAddress =
    studioRes.ok && studioRes.data.address !== null
      ? studioRes.data.address.trim() || null
      : null;
  const cancellationHoursNotice = studioRes.ok
    ? studioRes.data.cancellationHoursNotice
    : 24;
  const mapEmbedHtml = resolveContactMapEmbedHtml(
    studioRes.ok ? studioRes.data.mapEmbedUrl : null,
  );

  return (
    <MarketingScheduleAnimatedSections
      scheduleView={
        <MarketingScheduleView
          initialItems={items}
          pageTitle={title}
          studioAddress={studioAddress}
          mapEmbedHtml={mapEmbedHtml}
          cancellationHoursNotice={cancellationHoursNotice}
        />
      }
    />
  );
}
