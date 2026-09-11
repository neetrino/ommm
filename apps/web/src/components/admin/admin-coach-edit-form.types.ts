import {
  createScheduleRow,
  filterKnownAssignedClassTypeIds,
  type CoachClassOption,
  type CoachScheduleInput,
} from "@/components/admin/admin-coach-form-helpers";
import { formatIsoDateToUi } from "@/lib/date-display";
import { formatPhoneDisplay } from "@/lib/phone";

export type CoachClassTypeRateInput = {
  classTypeId: string;
  amountAmd: number;
};

export type CoachEditFormState = {
  email: string;
  name: string;
  lastName: string;
  phone: string;
  age: string;
  birthday: string;
  photoUrl: string;
  cardImageUrl: string;
  bio: string;
  experienceYears: string;
  assignedClassTypeIds: string[];
  classTypeRates: Record<string, string>;
  schedule: CoachScheduleInput[];
  specialization: string;
};

export type CoachEditFormErrors = {
  email?: string;
  name?: string;
  lastName?: string;
  phone?: string;
  age?: string;
  birthday?: string;
  photo?: string;
  cardImage?: string;
  bio?: string;
  experienceYears?: string;
  assignedClassTypeIds?: string;
  classTypeRates?: string;
  schedule?: string;
  specialization?: string;
};

export type CoachEditInitialValues = {
  email: string;
  name: string;
  lastName: string;
  phone: string;
  age: number | null;
  birthday: string | null;
  photoUrl: string | null;
  cardImageUrl: string | null;
  bio: string;
  experienceYears: number | null;
  assignedClassTypeIds: readonly string[];
  classTypeRates: readonly CoachClassTypeRateInput[];
  schedule: readonly { id: string; date: string; time: string; spots: number }[];
  specialization: string;
};

export type CoachUpdatePayload = {
  email: string;
  name: string | null;
  lastName: string | null;
  phone: string | null;
  age?: number;
  birthday?: string | null;
  bio: string | null;
  specialization: string | null;
  experienceYears: number | null;
  assignedClassTypeIds: string[];
  classTypeRates: CoachClassTypeRateInput[];
  schedule: { date: string; time: string; spots: number }[];
  photoUrl?: string;
  cardImageUrl?: string;
};

function ratesRecordFromInitial(
  rates: readonly CoachClassTypeRateInput[],
): Record<string, string> {
  const next: Record<string, string> = {};
  for (const rate of rates) {
    if (rate.amountAmd > 0) {
      next[rate.classTypeId] = String(rate.amountAmd);
    }
  }
  return next;
}

export function coachFormFromInitial(
  initial: CoachEditInitialValues,
  classOptions: readonly CoachClassOption[] = [],
): CoachEditFormState {
  return {
    email: initial.email,
    name: initial.name,
    lastName: initial.lastName,
    phone: formatPhoneDisplay(initial.phone),
    age: initial.age === null ? "" : String(initial.age),
    birthday: formatIsoDateToUi(initial.birthday),
    photoUrl: initial.photoUrl ?? "",
    cardImageUrl: initial.cardImageUrl ?? "",
    bio: initial.bio,
    experienceYears: initial.experienceYears === null ? "" : String(initial.experienceYears),
    assignedClassTypeIds: filterKnownAssignedClassTypeIds(
      initial.assignedClassTypeIds,
      classOptions,
    ),
    classTypeRates: ratesRecordFromInitial(initial.classTypeRates),
    schedule:
      initial.schedule.length > 0
        ? initial.schedule.map((slot) => ({
            id: slot.id,
            date: slot.date.slice(0, 10),
            time: slot.time,
            spots: String(slot.spots),
          }))
        : [createScheduleRow()],
    specialization: initial.specialization,
  };
}

export function nonEmptyCoachScheduleRows(
  rows: readonly CoachScheduleInput[],
): CoachScheduleInput[] {
  return rows.filter(
    (row) => row.date.trim() !== "" || row.time.trim() !== "" || row.spots.trim() !== "",
  );
}

/** Rows with every field filled; partial rows are ignored on save. */
export function completeCoachScheduleRows(
  rows: readonly CoachScheduleInput[],
): CoachScheduleInput[] {
  return nonEmptyCoachScheduleRows(rows).filter(
    (row) =>
      row.date.trim() !== "" && row.time.trim() !== "" && row.spots.trim() !== "",
  );
}

export function getCoachFormSectionLabels(locale: string) {
  if (locale === "hy") {
    return {
      personalInfoHeading: "Անձնական տվյալներ",
      personalInfoDescription: "Հաշվի և ինքնության հիմնական տվյալներ",
      coachDetailsHeading: "Մարզչի տվյալներ",
      coachDetailsDescription: "Փորձ, մասնագիտացում և պրոֆիլի մեդիա",
      assignedClassesHeading: "Կցված դասեր և աշխատավարձ",
      assignedClassesDescription:
        "Ընտրեք դասերի տեսակները և նշեք վճարը յուրաքանչյուր տեսակի համար",
      scheduleHeading: "Ժամանակացույց / հասանելիություն",
      birthdayPlaceholder: "ՕՕ/ԱԱ/ՏՏՏՏ",
    };
  }
  if (locale === "ru") {
    return {
      personalInfoHeading: "Личные данные",
      personalInfoDescription: "Основные данные учётной записи и личности",
      coachDetailsHeading: "Данные тренера",
      coachDetailsDescription: "Опыт, специализация и медиа профиля",
      assignedClassesHeading: "Назначенные занятия и зарплата",
      assignedClassesDescription:
        "Выберите типы занятий и укажите оплату за каждый тип",
      scheduleHeading: "Расписание / доступность",
      birthdayPlaceholder: "ДД/ММ/ГГГГ",
    };
  }
  return {
    personalInfoHeading: "Personal Information",
    personalInfoDescription: "Core account and identity details",
    coachDetailsHeading: "Coach Details",
    coachDetailsDescription: "Experience, specialization, and profile media",
    assignedClassesHeading: "Assigned classes & salary",
    assignedClassesDescription:
      "Select class types and set the pay rate for each type",
    scheduleHeading: "Schedule / Availability",
    birthdayPlaceholder: "DD/MM/YYYY",
  };
}

export function isCoachFormDirty(form: CoachEditFormState, snapshot: CoachEditFormState): boolean {
  return JSON.stringify(form) !== JSON.stringify(snapshot);
}
