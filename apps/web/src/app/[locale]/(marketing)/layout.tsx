import { notFound } from "next/navigation";
import { MarketingPublicHomeFooter } from "@/components/marketing/home/marketing-public-home-footer";
import { MarketingFooterGate } from "@/components/marketing/marketing-footer-gate";
import { MarketingLayoutShell } from "@/components/marketing/marketing-layout-shell";
import { MarketingLayoutMain } from "@/components/marketing/marketing-layout-main";
import { MARKETING_NAV_LINKS } from "@/components/marketing/marketing-nav-links";
import { MarketingSiteHeader } from "@/components/marketing/marketing-site-header";
import { routing } from "@/i18n/routing";

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

  return (
    <MarketingLayoutShell>
      <MarketingSiteHeader navLinks={MARKETING_NAV_LINKS} />
      <MarketingLayoutMain>{children}</MarketingLayoutMain>
      <MarketingFooterGate>
        <MarketingPublicHomeFooter locale={locale} />
      </MarketingFooterGate>
    </MarketingLayoutShell>
  );
}
