export const CLASS_STATUS_VALUES = ["ACTIVE", "CANCELLED", "FULL", "DRAFT"] as const;
export type ClassStatusValue = (typeof CLASS_STATUS_VALUES)[number];

export const CLASS_RECURRENCE_VALUES = [
  "NONE",
  "DAILY",
  "WEEKLY",
  "CUSTOM_WEEKDAYS",
] as const;
export type ClassRecurrenceValue = (typeof CLASS_RECURRENCE_VALUES)[number];

export const WEEKDAY_VALUES = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;
export type WeekdayValue = (typeof WEEKDAY_VALUES)[number];

export type AdminClassCoachOption = {
  id: string;
  name: string;
  specialization: string | null;
};

export type AdminClassTypeOption = {
  id: string;
  name: string;
};

export type AdminClassSessionRow = {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  capacity: number;
  status: ClassStatusValue;
  level: string | null;
  classFormat: string | null;
  priceCents: number;
  sessionRequirement: number | null;
  recurrencePattern: ClassRecurrenceValue;
  recurrenceWeekdays: WeekdayValue[];
  recurrenceEndsAt: string | null;
  recurrenceCount: number | null;
  classType: { id: string; name: string };
  coach: { id: string; specialization: string | null; user: { name: string | null } };
  _count: { bookings: number };
};
