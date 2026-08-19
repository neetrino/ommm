import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { OmmaWanderSphereDeferred } from "@/components/brand/omma-wander-sphere-deferred";
import { EnabledLocalesProvider } from "@/components/i18n/enabled-locales-context";
import { HtmlLangSync } from "@/components/i18n/html-lang-sync";
import { LocaleScrollRestore } from "@/components/i18n/locale-scroll-restore";
import { routing } from "@/i18n/routing";
import {
  isAppUiLocale,
  resolveFallbackLocale,
  type AppUiLocale,
} from "@/lib/enabled-locales";
import { OMMM_PATHNAME_HEADER } from "@/lib/ui-locale-constants";
import { getEnabledLocales } from "@/server/enabled-locales";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

function buildFallbackPath(pathname: string, locale: AppUiLocale, fallback: AppUiLocale): string {
  const localePrefix = `/${locale}`;
  if (pathname === localePrefix) {
    return `/${fallback}`;
  }
  if (pathname.startsWith(`${localePrefix}/`)) {
    return `/${fallback}${pathname.slice(localePrefix.length)}`;
  }
  return `/${fallback}`;
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const enabledLocales = await getEnabledLocales();
  if (isAppUiLocale(locale) && !enabledLocales[locale]) {
    const fallback = resolveFallbackLocale(enabledLocales);
    const pathname = (await headers()).get(OMMM_PATHNAME_HEADER) ?? `/${locale}`;
    redirect(buildFallbackPath(pathname, locale, fallback));
  }

  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <EnabledLocalesProvider locales={enabledLocales}>
        <HtmlLangSync />
        <LocaleScrollRestore />
        {children}
        <OmmaWanderSphereDeferred />
        <MetaPixel />
      </EnabledLocalesProvider>
    </NextIntlClientProvider>
  );
}
