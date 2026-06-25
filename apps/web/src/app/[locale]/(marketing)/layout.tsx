import { Suspense } from "react";
import { notFound } from "next/navigation";
import { MarketingSiteHeaderWithClientAccount } from "@/components/marketing/marketing-site-header-with-client-account";
import { MarketingSectionsVisibilityProvider } from "@/components/marketing/marketing-sections-visibility-context";
import { MarketingLayoutPathBoundary } from "@/components/marketing/marketing-layout-path-boundary";
import { routing } from "@/i18n/routing";
import {
  getFilteredMarketingNavLinks,
  getHomeSectionsVisibility,
} from "@/server/home-sections-visibility";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function MarketingLayout({
  children,
  params,
}: LayoutProps) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const [visibility, navLinks] = await Promise.all([
    getHomeSectionsVisibility(),
    getFilteredMarketingNavLinks(),
  ]);

  return (
    <MarketingSectionsVisibilityProvider visibility={visibility}>
      <Suspense
        fallback={
          <MarketingSiteHeaderWithClientAccount navLinks={navLinks} serverAccount={null} />
        }
      >
        <MarketingLayoutPathBoundary locale={locale} navLinks={navLinks} visibility={visibility}>
          {children}
        </MarketingLayoutPathBoundary>
      </Suspense>
    </MarketingSectionsVisibilityProvider>
  );
}
