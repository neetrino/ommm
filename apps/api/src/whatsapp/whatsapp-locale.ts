import { PaymentSource } from '@prisma/client';
import {
  normalizeAppUiLocale,
  type AppUiLocale,
} from '../common/app-ui-locales';
import { PAYMENT_EMAIL_TIMEZONE } from '../payments/payment-email-format.util';

const WHATSAPP_LOCALE_FALLBACK: AppUiLocale = 'hy';

const INTL_LOCALE: Record<AppUiLocale, string> = {
  hy: 'hy-AM',
  en: 'en-GB',
  ru: 'ru-RU',
};

/** Resolves a stored user locale for WhatsApp copy. */
export function resolveWhatsappLocale(
  value: string | null | undefined,
): AppUiLocale {
  return normalizeAppUiLocale(value ?? undefined, WHATSAPP_LOCALE_FALLBACK);
}

/** Studio-local date/time for WhatsApp templates. */
export function formatWhatsappDateTime(
  date: Date,
  locale: AppUiLocale,
): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: PAYMENT_EMAIL_TIMEZONE,
    hour12: false,
  }).format(date);
}

/** Studio-local calendar date (membership expiry). */
export function formatWhatsappDate(date: Date, locale: AppUiLocale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    dateStyle: 'medium',
    timeZone: PAYMENT_EMAIL_TIMEZONE,
  }).format(date);
}

const PAYMENT_SOURCE_LABEL: Record<
  AppUiLocale,
  Record<PaymentSource, string>
> = {
  hy: {
    PACKAGE: 'Դասի փաթեթ',
    DROPIN: 'Մեկ դաս',
    GIFT: 'Նվեր-քարտ',
    OTHER: 'Այլ',
  },
  ru: {
    PACKAGE: 'Пакет занятий',
    DROPIN: 'Разовое занятие',
    GIFT: 'Подарочная карта',
    OTHER: 'Другое',
  },
  en: {
    PACKAGE: 'Class package',
    DROPIN: 'Single class',
    GIFT: 'Gift card',
    OTHER: 'Other',
  },
};

/** Localized payment source for WhatsApp (emails stay English). */
export function formatWhatsappPaymentSource(
  locale: AppUiLocale,
  source: PaymentSource,
): string {
  return PAYMENT_SOURCE_LABEL[locale][source];
}

const WHATSAPP_AMD_SYMBOL = '֏';

/** Localized amount for WhatsApp (email amounts stay en-US). */
export function formatWhatsappAmount(
  locale: AppUiLocale,
  amountCents: number,
  currency: string,
): string {
  const normalized = currency.trim().toLowerCase();
  if (normalized === 'amd') {
    const amount = new Intl.NumberFormat(INTL_LOCALE[locale], {
      useGrouping: true,
      maximumFractionDigits: 0,
    }).format(Math.round(amountCents));
    return `${amount} ${WHATSAPP_AMD_SYMBOL}`;
  }
  try {
    return new Intl.NumberFormat(INTL_LOCALE[locale], {
      style: 'currency',
      currency: normalized.toUpperCase(),
    }).format(amountCents / 100);
  } catch {
    return `${(amountCents / 100).toFixed(2)} ${normalized.toUpperCase()}`;
  }
}
