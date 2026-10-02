import type { CoachSalarySessionReason } from './coaches-salary-sessions.helpers';
import type { CoachSalaryExportLocale } from './dto/coach-salary-sessions-export-query.dto';

export type CoachSalaryExportCopy = {
  coach: string;
  from: string;
  to: string;
  className: string;
  lessonDate: string;
  time: string;
  attendance: string;
  rate: string;
  salary: string;
  status: string;
  totals: string;
};

const EXPORT_COPY: Record<CoachSalaryExportLocale, CoachSalaryExportCopy> = {
  en: {
    coach: 'Coach',
    from: 'From',
    to: 'To',
    className: 'Class',
    lessonDate: 'Lesson date',
    time: 'Time',
    attendance: 'Attendance',
    rate: 'Rate (AMD)',
    salary: 'Salary (AMD)',
    status: 'Status',
    totals: 'Totals',
  },
  hy: {
    coach: 'Մարզիչ',
    from: 'Սկիզբ',
    to: 'Ավարտ',
    className: 'Դաս',
    lessonDate: 'Ամսաթիվ',
    time: 'Ժամ',
    attendance: 'Հաճախում',
    rate: 'Դրույք (AMD)',
    salary: 'Աշխատավարձ (AMD)',
    status: 'Կարգավիճակ',
    totals: 'Ընդամենը',
  },
  ru: {
    coach: 'Тренер',
    from: 'С',
    to: 'По',
    className: 'Класс',
    lessonDate: 'Дата занятия',
    time: 'Время',
    attendance: 'Посещаемость',
    rate: 'Ставка (AMD)',
    salary: 'Зарплата (AMD)',
    status: 'Статус',
    totals: 'Итого',
  },
};

export function resolveCoachSalaryExportLocale(
  locale: string | undefined,
): CoachSalaryExportLocale {
  if (locale === 'hy' || locale === 'ru') {
    return locale;
  }
  return 'en';
}

export function coachSalaryExportCopy(
  locale: string | undefined,
): CoachSalaryExportCopy {
  return EXPORT_COPY[resolveCoachSalaryExportLocale(locale)];
}

/** Same status words as the finance salary table. */
export function coachSalarySessionStatusLabel(
  reason: CoachSalarySessionReason,
): string {
  if (reason === 'PAID') {
    return 'COMPLETED';
  }
  if (reason === 'NO_BOOKINGS') {
    return 'NOBODY BOOKED';
  }
  if (reason === 'SESSION_CANCELLED') {
    return 'CANCELED';
  }
  if (reason === 'NOT_FINISHED_YET') {
    return 'NOT FINISHED YET';
  }
  return reason;
}
