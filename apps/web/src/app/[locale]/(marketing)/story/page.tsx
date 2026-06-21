import { MarketingStoryPageContent } from "@/components/marketing/story/marketing-story-page-content";
import { MarketingStoryPageSection } from "@/components/marketing/story/marketing-story-page-section";
import { ensureMarketingSectionEnabled } from "@/server/ensure-marketing-section-enabled";

export const revalidate = 3600;

export default async function StoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await ensureMarketingSectionEnabled("story");
  const { locale } = await params;

  return (
    <MarketingStoryPageSection>
      <MarketingStoryPageContent locale={locale} />
    </MarketingStoryPageSection>
  );
}
