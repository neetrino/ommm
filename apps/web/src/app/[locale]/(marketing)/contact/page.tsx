import { getTranslations } from "next-intl/server";
import { MarketingContactPageLayout } from "@/components/marketing/contact/marketing-contact-page-content";
import { MarketingContactPageSection } from "@/components/marketing/contact/marketing-contact-page-section";
import { fetchPublicJsonCached } from "@/lib/cached-public-api";
import type { StudioPublicSettings } from "@/lib/studio-social-links";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const studioFetch = fetchPublicJsonCached<StudioPublicSettings>("/studio");
  const t = await getTranslations({ locale, namespace: "marketingPages.contact" });

  return (
    <MarketingContactPageSection title={t("title")} lead={t("lede")}>
      <MarketingContactPageLayout locale={locale} studioFetch={studioFetch} />
    </MarketingContactPageSection>
  );
}
