import { notFound } from "next/navigation";
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
    <div className="flex min-h-screen flex-col bg-paper">
      <MarketingSiteHeader />
      <main className="flex-1">{children}</main>
      <MarketingSiteFooter locale={locale} />
    </div>
  );
}
