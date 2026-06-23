import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MarketingRefundPageSection } from "@/components/marketing/refund/marketing-refund-page-section";
import { MarketingTermsPageContent } from "@/components/marketing/terms/marketing-terms-page-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketingPages.terms" });

  return {
    title: t("title"),
    description: t("metaDescription"),
  };
}

export default async function TermsAndConditionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketingPages.terms" });

  return (
    <MarketingRefundPageSection title={t("title")}>
      <MarketingTermsPageContent locale={locale} />
    </MarketingRefundPageSection>
  );
}
