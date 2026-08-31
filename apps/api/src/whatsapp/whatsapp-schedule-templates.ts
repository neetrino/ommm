import type { AppUiLocale } from '../common/app-ui-locales';

type ClassReminderParams = {
  className: string;
  hoursBefore: number;
  startsAtLabel: string;
};

type NamedClassParams = {
  className: string;
};

type WaitlistOfferParams = NamedClassParams & {
  offerMinutes: number;
};

type ClassCancelledParams = NamedClassParams & {
  startsAtLabel: string;
};

type BookingConfirmedParams = NamedClassParams & {
  startsAtLabel: string;
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
  if (locale === 'ru') {
    return `Ommm: «${params.className}» начнётся примерно через ${params.hoursBefore} ч. (${params.startsAtLabel}).`;
  }
  if (locale === 'hy') {
    return `Ommm. «${params.className}»-ը կսկսվի մոտ ${params.hoursBefore} ժամից (${params.startsAtLabel})։`;
  }
  return `Ommm: ${params.className} starts in about ${params.hoursBefore} hours (${params.startsAtLabel}).`;
}

export function renderWaitlistOfferWhatsapp(
  locale: AppUiLocale,
  params: WaitlistOfferParams,
): string {
  if (locale === 'ru') {
    return `Ommm: освободилось место в «${params.className}». Забронируйте в течение ${params.offerMinutes} мин.`;
  }
  if (locale === 'hy') {
    return `Ommm. «${params.className}»-ում տեղ է ազատվել։ Ամրագրեք ${params.offerMinutes} րոպեի ընթացքում։`;
  }
  return `Ommm: a place opened in ${params.className}. Book within ${params.offerMinutes} minutes.`;
}

export function renderClassCancelledWhatsapp(
  locale: AppUiLocale,
  params: ClassCancelledParams,
): string {
  if (locale === 'ru') {
    return `Ommm: занятие «${params.className}» (${params.startsAtLabel}) отменено.`;
  }
  if (locale === 'hy') {
    return `Ommm. «${params.className}» դասը (${params.startsAtLabel}) չեղարկվել է։`;
  }
  return `Ommm: ${params.className} on ${params.startsAtLabel} was cancelled.`;
}

export function renderBookingConfirmedWhatsapp(
  locale: AppUiLocale,
  params: BookingConfirmedParams,
): string {
  if (locale === 'ru') {
    return `Ommm: бронь подтверждена — «${params.className}», ${params.startsAtLabel}.`;
  }
  if (locale === 'hy') {
    return `Ommm. ամրագրումը հաստատված է — «${params.className}», ${params.startsAtLabel}։`;
  }
  return `Ommm: booking confirmed — ${params.className}, ${params.startsAtLabel}.`;
}

export function renderWaitlistManualWhatsapp(
  locale: AppUiLocale,
  params: WaitlistManualParams,
): string {
  const body = params.message.trim();
  if (locale === 'ru') {
    return body.length > 0
      ? `Ommm: ${params.subject}\n${body}`
      : `Ommm: сообщение по листу ожидания «${params.className}».`;
  }
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
  if (locale === 'ru') {
    return `Ommm: пакет «${params.planName}» истекает ${params.endsAtLabel}.`;
  }
  if (locale === 'hy') {
    return `Ommm. «${params.planName}» փաթեթը կավարտվի ${params.endsAtLabel}։`;
  }
  return `Ommm: your ${params.planName} package expires on ${params.endsAtLabel}.`;
}
