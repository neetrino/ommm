import { notFound } from "next/navigation";
import { MARKETING_NAV_LINKS } from "@/components/marketing/marketing-nav-links";
import { MarketingSiteFooter } from "@/components/marketing/marketing-site-footer";
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
    <div className="ommm-bg-wellness flex min-h-screen w-full flex-col">
      <MarketingSiteHeader navLinks={MARKETING_NAV_LINKS} />
      <main className="flex flex-1 flex-col">{children}</main>
      <MarketingSiteFooter locale={locale} />
    </div>
  );
}
