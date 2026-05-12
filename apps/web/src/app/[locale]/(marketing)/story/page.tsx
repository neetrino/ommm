import { getTranslations } from "next-intl/server";
import { MarketingPageFrame } from "@/components/layout/marketing-page-frame";

export default async function StoryPage() {
  const m = await getTranslations("marketing");

  return (
    <MarketingPageFrame title={m("storyTitle")} lede={m("storyLead")}>
      <div className="mt-12 max-w-2xl space-y-6">
        <p className="ommm-body">{m("storyP1")}</p>
        <p className="ommm-body">{m("storyP2")}</p>
      </div>
    </MarketingPageFrame>
  );
}
