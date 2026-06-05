import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { MarketingContactPageContent } from "@/components/marketing/contact/marketing-contact-page-content";
import { MarketingContactPageSection } from "@/components/marketing/contact/marketing-contact-page-section";
import { MarketingPageContentSkeleton } from "@/components/marketing/marketing-page-content-skeleton";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketingPages.contact" });

  return (
    <MarketingContactPageSection title={t("title")} lead={t("lede")}>
      <Suspense fallback={<MarketingPageContentSkeleton cards={2} />}>
        <MarketingContactPageContent locale={locale} />
      </Suspense>
    </MarketingContactPageSection>
  );
}
