import type { AppUiLocale } from '../common/app-ui-locales';

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

export function renderPaymentSuccessWhatsapp(locale: AppUiLocale): string {
  if (locale === 'hy') {
    return `💛 Վճարումը հաջողությամբ կատարվել է։

Շնորհակալություն Ommm.-ն ընտրելու համար։
Ձեր Ommm. պահն արդեն մեկ քայլ ավելի մոտ է ✨`;
  }
  return `💛 Your payment was successful.

Thank you for choosing Ommm.
Your next Ommm. moment is one step closer ✨`;
}

export function renderGiftCardWhatsapp(
  locale: AppUiLocale,
  params: GiftCardParams,
): string {
  if (locale === 'hy') {
    return `Ձեր Ommm. Gift Card-ը պատրաստ է։

Նվեր քարտի կոդը՝ ${params.code}

Փոքրիկ հիշեցում՝ երբեմն լավագույն նվերը պարզապես ժամանակն է քեզ համար 💛`;
  }
  return `Your Ommm. Gift Card is ready.

Gift Card code: ${params.code}

A little reminder: sometimes the best gift is simply time for yourself 💛`;
}

export function renderCashPendingWhatsapp(
  locale: AppUiLocale,
  params: CashPendingParams,
): string {
  if (locale === 'hy') {
    return `Ommm. խնդրում ենք վճարել ${params.amountLabel} կանխիկ ստուդիայում։`;
  }
  return `Ommm: please pay ${params.amountLabel} in cash at the studio.`;
}

export function renderPackagePurchasedWhatsapp(
  locale: AppUiLocale,
  params: PackagePurchasedParams,
): string {
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
    if (locale === 'hy') {
      return 'Անսահմանափակ։';
    }
    return 'Unlimited sessions.';
  }
  const remaining = params.sessionsRemaining ?? 0;
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
