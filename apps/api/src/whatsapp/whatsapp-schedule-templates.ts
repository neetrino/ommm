import type { AppUiLocale } from '../common/app-ui-locales';

type ClassReminderParams = {
  className: string;
  hoursBefore: number;
  startsAtLabel: string;
};

type NamedClassParams = {
  className: string;
};

type WaitlistManualParams = NamedClassParams & {
  subject: string;
  message: string;
};

type MembershipExpiryParams = {
  planName: string;
  endsAtLabel: string;
};

export function renderClassReminderWhatsapp(
  locale: AppUiLocale,
  params: ClassReminderParams,
): string {
  if (locale === 'hy') {
    return `💛 Հիշեցում Ommm.-ից

Քո պարապմունքը կսկսվի ${params.hoursBefore} ժամից։
Սպասում ենք Քեզ Ommm.-ում՝ Քո օրվա Ommm. պահի համար։

Մինչ հանդիպում ✨`;
  }
  return `💛 A little Ommm. reminder

Your Ommm. moment starts in ${params.hoursBefore} hours.

See you soon ✨`;
}

export function renderWaitlistOfferWhatsapp(locale: AppUiLocale): string {
  if (locale === 'hy') {
    return `✨ Լավ նորություն Ommm.-ից

Ձեր սպասման ցուցակի պարապմունքում տեղ է ազատվել։
Այժմ կարող եք ամրագրել Ձեր տեղը։

Տեղերը սահմանափակ են և հասանելի՝ ըստ ամրագրման հերթականության 💛`;
  }
  return `✨ Good news from Ommm.

A spot is now available for your waitlisted class.
You can now book your place.

Spots are limited and available on a first-booked basis 💛`;
}

export function renderClassCancelledWhatsapp(locale: AppUiLocale): string {
  if (locale === 'hy') {
    return `Ցավոք, Ձեր ամրագրած պարապմունքը չեղարկվել է։

Ներողություն ենք խնդրում անհարմարության համար։ Կարող եք ընտրել Ձեզ հարմար այլ ժամ մեր դասացուցակից։`;
  }
  return `A little update from Ommm. 💛

Unfortunately, your booked class has been cancelled.

We're sorry for the inconvenience. You can choose another convenient time from our schedule.`;
}

type BookingConfirmedParams = {
  className: string;
  startsAtLabel: string;
};

export function renderBookingConfirmedWhatsapp(
  locale: AppUiLocale,
  params: BookingConfirmedParams,
): string {
  if (locale === 'hy') {
    return `✨ Ձեր Ommm. պահն ամրագրված է։

«${params.className}»
${params.startsAtLabel}

Սպասում ենք Ձեզ 💛`;
  }
  return `✨ Your Ommm. moment is booked.

${params.className}
${params.startsAtLabel}

We'll be waiting for you 💛`;
}

export function renderWaitlistManualWhatsapp(
  locale: AppUiLocale,
  params: WaitlistManualParams,
): string {
  const body = params.message.trim();
  if (locale === 'hy') {
    return body.length > 0
      ? `Ommm. ${params.subject}\n${body}`
      : `Ommm. սպասման ցուցակի հաղորդագրություն «${params.className}»-ի համար։`;
  }
  return body.length > 0
    ? `Ommm: ${params.subject}\n${body}`
    : `Ommm: a waitlist update about ${params.className}.`;
}

export function renderMembershipExpiryWhatsapp(
  locale: AppUiLocale,
  params: MembershipExpiryParams,
): string {
  if (locale === 'hy') {
    return `Ommm. «${params.planName}» փաթեթը կավարտվի ${params.endsAtLabel}։`;
  }
  return `Ommm: your ${params.planName} package expires on ${params.endsAtLabel}.`;
}
