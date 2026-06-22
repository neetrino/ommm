import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MarketingRefundPageContent } from "@/components/marketing/refund/marketing-refund-page-content";
import { MarketingRefundPageSection } from "@/components/marketing/refund/marketing-refund-page-section";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketingPages.refund" });

  return {
    title: t("title"),
    description: t("metaDescription"),
  };
}

export default async function RefundPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketingPages.refund" });

  return (
    <MarketingRefundPageSection title={t("title")}>
      <MarketingRefundPageContent locale={locale} />
    </MarketingRefundPageSection>
  );
}
