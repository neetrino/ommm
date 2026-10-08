import type { ScheduleDayOfWeek } from '@prisma/client';
import { ClassSessionStatus } from '@prisma/client';
import type { ScheduleExportLocale } from './dto/admin-export-sessions-query.dto';

export type ScheduleExportCopy = {
  title: string;
  allClasses: string;
  date: string;
  weekday: string;
  start: string;
  end: string;
  className: string;
  type: string;
  coach: string;
  level: string;
  booked: string;
  capacity: string;
  spots: string;
  status: string;
};

const EXPORT_COPY: Record<ScheduleExportLocale, ScheduleExportCopy> = {
  en: {
    title: 'Schedule',
    allClasses: 'All classes',
    date: 'Date',
    weekday: 'Weekday',
    start: 'Start',
    end: 'End',
    className: 'Class',
    type: 'Type',
    coach: 'Coach',
    level: 'Level',
    booked: 'Booked',
    capacity: 'Capacity',
    spots: 'Spots left',
    status: 'Status',
  },
  hy: {
    title: 'Ժամանակացույց',
    allClasses: 'Բոլոր դասերը',
    date: 'Ամսաթիվ',
    weekday: 'Օր',
    start: 'Սկիզբ',
    end: 'Ավարտ',
    className: 'Դաս',
    type: 'Տեսակ',
    coach: 'Մարզիչ',
    level: 'Մակարդակ',
    booked: 'Գրանցված',
    capacity: 'Տարողություն',
    spots: 'Ազատ տեղ',
    status: 'Կարգավիճակ',
  },
  ru: {
    title: 'Расписание',
    allClasses: 'Все занятия',
    date: 'Дата',
    weekday: 'День',
    start: 'Начало',
    end: 'Конец',
    className: 'Занятие',
    type: 'Тип',
    coach: 'Тренер',
    level: 'Уровень',
    booked: 'Записано',
    capacity: 'Вместимость',
    spots: 'Свободно',
    status: 'Статус',
  },
};

const WEEKDAYS: Record<
  ScheduleExportLocale,
  Record<ScheduleDayOfWeek, string>
> = {
  en: {
    SUNDAY: 'Sunday',
    MONDAY: 'Monday',
    TUESDAY: 'Tuesday',
    WEDNESDAY: 'Wednesday',
    THURSDAY: 'Thursday',
    FRIDAY: 'Friday',
    SATURDAY: 'Saturday',
  },
  hy: {
    SUNDAY: 'Կիրակի',
    MONDAY: 'Երկուշաբթի',
    TUESDAY: 'Երեքշաբթի',
    WEDNESDAY: 'Չորեքշաբթի',
    THURSDAY: 'Հինգշաբթի',
    FRIDAY: 'Ուրբաթ',
    SATURDAY: 'Շաբաթ',
  },
  ru: {
    SUNDAY: 'Воскресенье',
    MONDAY: 'Понедельник',
    TUESDAY: 'Вторник',
    WEDNESDAY: 'Среда',
    THURSDAY: 'Четверг',
    FRIDAY: 'Пятница',
    SATURDAY: 'Суббота',
  },
};

const STATUS_LABELS: Record<
  ScheduleExportLocale,
  Record<ClassSessionStatus, string>
> = {
  en: {
    ACTIVE: 'Active',
    CANCELLED: 'Cancelled',
    FULL: 'Full',
    DRAFT: 'Draft',
    FINISHED: 'Finished',
  },
  hy: {
    ACTIVE: 'Ակտիվ',
    CANCELLED: 'Չեղարկված',
    FULL: 'Լրիվ',
    DRAFT: 'Սևագիր',
    FINISHED: 'Ավարտված',
  },
  ru: {
    ACTIVE: 'Активно',
    CANCELLED: 'Отменено',
    FULL: 'Заполнено',
    DRAFT: 'Черновик',
    FINISHED: 'Завершено',
  },
};

export function resolveScheduleExportLocale(
  locale: string | undefined,
): ScheduleExportLocale {
  if (locale === 'hy' || locale === 'ru') {
    return locale;
  }
  return 'en';
}

export function scheduleExportCopy(
  locale: string | undefined,
): ScheduleExportCopy {
  return EXPORT_COPY[resolveScheduleExportLocale(locale)];
}

export function scheduleExportWeekdayLabel(
  locale: string | undefined,
  day: ScheduleDayOfWeek,
): string {
  return WEEKDAYS[resolveScheduleExportLocale(locale)][day];
}

export function scheduleExportStatusLabel(
  locale: string | undefined,
  status: ClassSessionStatus,
): string {
  return STATUS_LABELS[resolveScheduleExportLocale(locale)][status];
}

/** Count phrase that stays grammatical for any number. */
export function scheduleExportCountLabel(
  locale: string | undefined,
  count: number,
): string {
  const resolved = resolveScheduleExportLocale(locale);
  if (resolved === 'hy') {
    return `${count} դաս`;
  }
  if (resolved === 'ru') {
    return `Занятий: ${count}`;
  }
  return `${count} classes`;
}
