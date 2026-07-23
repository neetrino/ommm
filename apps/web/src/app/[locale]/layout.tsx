import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { HtmlLangSync } from "@/components/i18n/html-lang-sync";
import { LocaleScrollRestore } from "@/components/i18n/locale-scroll-restore";
import { routing } from "@/i18n/routing";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <HtmlLangSync />
      <LocaleScrollRestore />
      {children}
      <MetaPixel />
    </NextIntlClientProvider>
  );
}
