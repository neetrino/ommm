import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MarketingPrivacyPageContent } from "@/components/marketing/privacy/marketing-privacy-page-content";
import { MarketingRefundPageSection } from "@/components/marketing/refund/marketing-refund-page-section";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketingPages.privacy" });

  return {
    title: t("title"),
    description: t("metaDescription"),
  };
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketingPages.privacy" });

  return (
    <MarketingRefundPageSection title={t("title")}>
      <MarketingPrivacyPageContent locale={locale} />
    </MarketingRefundPageSection>
  );
}
