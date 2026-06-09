import { getTranslations } from "next-intl/server";
import { MarketingPageFrame } from "@/components/layout/marketing-page-frame";

export const revalidate = 3600;

export default async function StoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const m = await getTranslations({ locale, namespace: "marketing" });

  return (
    <MarketingPageFrame title={m("storyTitle")} lede={m("storyLead")} scrollReveal>
      <div className="w-full min-w-0 space-y-6">
        <p className="ommm-body">{m("storyP1")}</p>
        <p className="ommm-body">{m("storyP2")}</p>
      </div>
    </MarketingPageFrame>
  );
}
