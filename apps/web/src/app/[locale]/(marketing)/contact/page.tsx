import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { MarketingPageFrame } from "@/components/layout/marketing-page-frame";
import { MarketingContactPageContent } from "@/components/marketing/contact/marketing-contact-page-content";
import { MarketingPageContentSkeleton } from "@/components/marketing/marketing-page-content-skeleton";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketingPages.contact" });

  return (
    <MarketingPageFrame title={t("title")} lede={t("lede")}>
      <Suspense fallback={<MarketingPageContentSkeleton cards={2} />}>
        <MarketingContactPageContent locale={locale} />
      </Suspense>
    </MarketingPageFrame>
  );
}
