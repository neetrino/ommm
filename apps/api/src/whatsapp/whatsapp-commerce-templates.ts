import type { AppUiLocale } from '../common/app-ui-locales';

type PaymentSuccessParams = {
  amountLabel: string;
  paymentTypeLabel: string;
};

type GiftCardParams = {
  code: string;
};

type CashPendingParams = {
  amountLabel: string;
};

type PackagePurchasedParams = {
  planName: string;
  endsAtLabel: string;
  creditsLabel: string;
};

type BroadcastParams = {
  subject: string;
  body: string;
};

export function renderPaymentSuccessWhatsapp(
  locale: AppUiLocale,
  params: PaymentSuccessParams,
): string {
  if (locale === 'ru') {
    return `Ommm: оплата прошла — ${params.amountLabel} (${params.paymentTypeLabel}).`;
  }
  if (locale === 'hy') {
    return `Ommm. վճարումը հաջող է — ${params.amountLabel} (${params.paymentTypeLabel})։`;
  }
  return `Ommm: payment received — ${params.amountLabel} (${params.paymentTypeLabel}).`;
}

export function renderGiftCardWhatsapp(
  locale: AppUiLocale,
  params: GiftCardParams,
): string {
  if (locale === 'ru') {
    return `Ommm: ваша подарочная карта. Код: ${params.code}`;
  }
  if (locale === 'hy') {
    return `Ommm. ձեր նվեր-քարտը։ Կոդ: ${params.code}`;
  }
  return `Ommm: your gift card code is ${params.code}`;
}

export function renderCashPendingWhatsapp(
  locale: AppUiLocale,
  params: CashPendingParams,
): string {
  if (locale === 'ru') {
    return `Ommm: оплатите ${params.amountLabel} наличными в студии.`;
  }
  if (locale === 'hy') {
    return `Ommm. խնդրում ենք վճարել ${params.amountLabel} կանխիկ ստուդիայում։`;
  }
  return `Ommm: please pay ${params.amountLabel} in cash at the studio.`;
}

export function renderPackagePurchasedWhatsapp(
  locale: AppUiLocale,
  params: PackagePurchasedParams,
): string {
  if (locale === 'ru') {
    return `Ommm: пакет «${params.planName}» активен до ${params.endsAtLabel}. ${params.creditsLabel}`;
  }
  if (locale === 'hy') {
    return `Ommm. «${params.planName}» փաթեթը ակտիվ է մինչև ${params.endsAtLabel}։ ${params.creditsLabel}`;
  }
  return `Ommm: ${params.planName} is active until ${params.endsAtLabel}. ${params.creditsLabel}`;
}

export function renderPackageCreditsLabel(
  locale: AppUiLocale,
  params: { unlimited: boolean; sessionsRemaining: number | null },
): string {
  if (params.unlimited) {
    if (locale === 'ru') {
      return 'Безлимит.';
    }
    if (locale === 'hy') {
      return 'Անսահմանափակ։';
    }
    return 'Unlimited sessions.';
  }
  const remaining = params.sessionsRemaining ?? 0;
  if (locale === 'ru') {
    return `Осталось занятий: ${remaining}.`;
  }
  if (locale === 'hy') {
    return `Մնացած դասեր: ${remaining}։`;
  }
  return `Sessions left: ${remaining}.`;
}

export function renderBroadcastWhatsapp(
  locale: AppUiLocale,
  params: BroadcastParams,
): string {
  const body = params.body.trim();
  const prefix = locale === 'hy' ? 'Ommm.' : 'Ommm:';
  if (body.length === 0) {
    return `${prefix} ${params.subject}`;
  }
  return `${prefix} ${params.subject}\n${body}`;
}
