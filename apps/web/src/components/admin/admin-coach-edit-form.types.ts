import {
  createScheduleRow,
  type CoachScheduleInput,
} from "@/components/admin/admin-coach-form-helpers";
import { formatIsoDateToUi } from "@/lib/date-display";

export type CoachEditFormState = {
  email: string;
  name: string;
  lastName: string;
  phone: string;
  age: string;
  birthday: string;
  photoUrl: string;
  bio: string;
  experienceYears: string;
  assignedClassTypeIds: string[];
  schedule: CoachScheduleInput[];
  specialization: string;
  classType: string;
};

export type CoachEditFormErrors = {
  email?: string;
  name?: string;
  lastName?: string;
  phone?: string;
  age?: string;
  birthday?: string;
  photo?: string;
  bio?: string;
  experienceYears?: string;
  assignedClassTypeIds?: string;
  schedule?: string;
  specialization?: string;
  classType?: string;
};

export type CoachEditInitialValues = {
  email: string;
  name: string;
  lastName: string;
  phone: string;
  age: number | null;
  birthday: string | null;
  photoUrl: string | null;
  bio: string;
  experienceYears: number | null;
  assignedClassTypeIds: readonly string[];
  schedule: readonly { id: string; date: string; time: string; spots: number }[];
  specialization: string;
  classType: string;
};

export type CoachUpdatePayload = {
  email: string;
  name: string;
  lastName: string;
  phone: string;
  age?: number;
  birthday?: string | null;
  bio: string | null;
  specialization: string | null;
  classType: string | null;
  experienceYears: number | null;
  assignedClassTypeIds: string[];
  schedule: { date: string; time: string; spots: number }[];
  photoUrl?: string;
};

export function coachFormFromInitial(initial: CoachEditInitialValues): CoachEditFormState {
  return {
    email: initial.email,
    name: initial.name,
    lastName: initial.lastName,
    phone: initial.phone,
    age: initial.age === null ? "" : String(initial.age),
    birthday: formatIsoDateToUi(initial.birthday),
    photoUrl: initial.photoUrl ?? "",
    bio: initial.bio,
    experienceYears: initial.experienceYears === null ? "" : String(initial.experienceYears),
    assignedClassTypeIds: [...initial.assignedClassTypeIds],
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
    classType: initial.classType,
  };
}

export function nonEmptyCoachScheduleRows(
  rows: readonly CoachScheduleInput[],
): CoachScheduleInput[] {
  return rows.filter(
    (row) => row.date.trim() !== "" || row.time.trim() !== "" || row.spots.trim() !== "",
  );
}

export function getCoachFormSectionLabels(locale: string) {
  if (locale === "hy") {
    return {
      personalInfoHeading: "Անձնական տվյալներ",
      personalInfoDescription: "Հաշվի և ինքնության հիմնական տվյալներ",
      coachDetailsHeading: "Մարզչի տվյալներ",
      coachDetailsDescription: "Փորձ, մասնագիտացում և պրոֆիլի մեդիա",
      assignedClassesHeading: "Կցված դասեր",
      assignedClassesDescription: "Ընտրեք այս մարզչի վարած դասերի տեսակները",
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
      assignedClassesHeading: "Назначенные занятия",
      assignedClassesDescription: "Выберите типы занятий, которые ведёт тренер",
      scheduleHeading: "Расписание / доступность",
      birthdayPlaceholder: "ДД/ММ/ГГГГ",
    };
  }
  return {
    personalInfoHeading: "Personal Information",
    personalInfoDescription: "Core account and identity details",
    coachDetailsHeading: "Coach Details",
    coachDetailsDescription: "Experience, specialization, and profile media",
    assignedClassesHeading: "Assigned Classes",
    assignedClassesDescription: "Select class types coached by this person",
    scheduleHeading: "Schedule / Availability",
    birthdayPlaceholder: "DD/MM/YYYY",
  };
}

export function isCoachFormDirty(form: CoachEditFormState, snapshot: CoachEditFormState): boolean {
  return JSON.stringify(form) !== JSON.stringify(snapshot);
}
