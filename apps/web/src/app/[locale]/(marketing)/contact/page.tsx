import { getTranslations } from "next-intl/server";
import { MarketingContactPageLayout } from "@/components/marketing/contact/marketing-contact-page-content";
import { MarketingContactPageSection } from "@/components/marketing/contact/marketing-contact-page-section";
import { fetchPublicStudioCached } from "@/lib/fetch-public-studio";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const studioFetch = fetchPublicStudioCached();
  const t = await getTranslations({ locale, namespace: "marketingPages.contact" });

  return (
    <MarketingContactPageSection title={t("title")} lead={t("lede")}>
      <MarketingContactPageLayout locale={locale} studioFetch={studioFetch} />
    </MarketingContactPageSection>
  );
}
