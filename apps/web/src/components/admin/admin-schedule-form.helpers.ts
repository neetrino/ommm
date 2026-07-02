import type { useTranslations } from "next-intl";
import {
  isValidTime24h,
  minutesFromTime,
} from "@/components/admin/admin-schedule-helpers";
import type { AdminScheduleItem } from "@/components/admin/admin-schedule-types";
import type {
  ScheduleFilterOption,
} from "@/components/marketing/schedule/schedule-filter-dropdown";
import type { ScheduleDayOfWeek } from "@/components/admin/admin-schedule-types";
import {
  ADMIN_SCHEDULE_FORM_MAX_CLASS_NAME_LENGTH,
  ADMIN_SCHEDULE_FORM_MAX_CLASS_TYPE_LENGTH,
  ADMIN_SCHEDULE_FORM_MAX_DESCRIPTION_LENGTH,
  ADMIN_SCHEDULE_FORM_MAX_INSTRUCTOR_LENGTH,
  ADMIN_SCHEDULE_FORM_MIN_DURATION,
  ADMIN_SCHEDULE_FORM_MIN_SPOTS,
  type AdminScheduleFormState,
  type AdminScheduleMutationPayload,
} from "@/components/admin/admin-schedule-form.types";

export function toScheduleFilterOptions(
  values: readonly string[],
): readonly ScheduleFilterOption<string>[] {
  return values.map((value) => ({ value, label: value }));
}

export function toScheduleDayOptions(
  dayOptions: readonly ScheduleDayOfWeek[],
  t: ReturnType<typeof useTranslations<"adminPages.schedule">>,
): readonly ScheduleFilterOption<ScheduleDayOfWeek>[] {
  return dayOptions.map((day) => ({
    value: day,
    label: t(`days.${day}`),
  }));
}

export function adminScheduleFormInitialState(item?: AdminScheduleItem): AdminScheduleFormState {
  return {
    className: item?.className ?? "",
    instructorName: item?.instructorName ?? "",
    classType: item?.classType ?? "",
    dayOfWeek: item?.dayOfWeek ?? "MONDAY",
    startTime: item?.startTime ?? "",
    endTime: item?.endTime ?? "",
    durationMinutes:
      item?.durationMinutes === null || item?.durationMinutes === undefined
        ? ""
        : String(item.durationMinutes),
    availableSpots:
      item?.availableSpots === undefined ? "" : String(item.availableSpots),
    description: item?.description ?? "",
    isActive: item?.isActive ?? true,
  };
}

export function adminSchedulePayloadFromState(
  form: AdminScheduleFormState,
  t: ReturnType<typeof useTranslations<"adminPages.schedule">>,
): AdminScheduleMutationPayload {
  const className = form.className.trim();
  const instructorName = form.instructorName.trim();
  const classType = form.classType.trim();
  const description = form.description.trim();
  const startTime = form.startTime.trim();
  const endTime = form.endTime.trim();
  const durationText = form.durationMinutes.trim();
  const spotsText = form.availableSpots.trim();

  if (className.length === 0) {
    throw new Error(t("form.errors.classNameRequired"));
  }
  if (className.length > ADMIN_SCHEDULE_FORM_MAX_CLASS_NAME_LENGTH) {
    throw new Error(t("form.errors.classNameTooLong"));
  }
  if (instructorName.length === 0) {
    throw new Error(t("form.errors.instructorRequired"));
  }
  if (instructorName.length > ADMIN_SCHEDULE_FORM_MAX_INSTRUCTOR_LENGTH) {
    throw new Error(t("form.errors.instructorTooLong"));
  }
  if (classType.length === 0) {
    throw new Error(t("form.errors.classTypeRequired"));
  }
  if (classType.length > ADMIN_SCHEDULE_FORM_MAX_CLASS_TYPE_LENGTH) {
    throw new Error(t("form.errors.classTypeTooLong"));
  }
  if (!isValidTime24h(startTime)) {
    throw new Error(t("form.errors.startTimeInvalid"));
  }
  if (endTime.length > 0 && !isValidTime24h(endTime)) {
    throw new Error(t("form.errors.endTimeInvalid"));
  }
  if (endTime.length > 0 && minutesFromTime(endTime) <= minutesFromTime(startTime)) {
    throw new Error(t("form.errors.endTimeBeforeStart"));
  }

  let durationMinutes: number | undefined;
  if (endTime.length === 0) {
    if (durationText.length === 0) {
      throw new Error(t("form.errors.durationRequired"));
    }
    durationMinutes = Number(durationText);
    if (!Number.isInteger(durationMinutes) || durationMinutes < ADMIN_SCHEDULE_FORM_MIN_DURATION) {
      throw new Error(t("form.errors.durationInvalid"));
    }
  }

  const availableSpots = Number(spotsText);
  if (!Number.isInteger(availableSpots) || availableSpots < ADMIN_SCHEDULE_FORM_MIN_SPOTS) {
    throw new Error(t("form.errors.spotsInvalid"));
  }
  if (description.length > ADMIN_SCHEDULE_FORM_MAX_DESCRIPTION_LENGTH) {
    throw new Error(t("form.errors.descriptionTooLong"));
  }

  return {
    className,
    instructorName,
    classType,
    dayOfWeek: form.dayOfWeek,
    startTime,
    ...(endTime.length > 0 ? { endTime } : {}),
    ...(durationMinutes === undefined ? {} : { durationMinutes }),
    availableSpots,
    ...(description.length > 0 ? { description } : {}),
    isActive: form.isActive,
  };
}

export function buildSlugFromScheduleTypeName(name: string, maxSlugLength: number): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxSlugLength);
}
