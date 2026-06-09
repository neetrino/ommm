import type { AdminScheduleCoach } from "@/components/admin/admin-schedule-management";
import type { SessionClassTypeOption } from "@/components/admin/admin-schedule-session-class-type-resolve";

export type CoachDropdownState = {
  options: Array<{ value: string; label: string }>;
  disabled: boolean;
  placeholder: "selectClassFirst" | "noCoachesForClass" | "coach";
  coachId: string;
};

/** Resolves a concrete class type id from a session form dropdown value (sync, no API). */
export function resolveSelectedClassTypeId(
  selectedValue: string,
  options: readonly SessionClassTypeOption[],
): string | null {
  if (selectedValue.trim().length === 0) {
    return null;
  }

  const option = options.find((item) => item.value === selectedValue);
  if (option?.classTypeId !== null && option?.classTypeId !== undefined) {
    return option.classTypeId;
  }

  const name = option?.packageLabel?.trim() ?? option?.label.trim() ?? "";
  if (name.length === 0) {
    return null;
  }

  const existing = options.find(
    (item) =>
      item.classTypeId !== null &&
      item.label.toLocaleLowerCase() === name.toLocaleLowerCase(),
  );
  return existing?.classTypeId ?? null;
}

/** Active coaches assigned to the given class type. */
export function filterCoachesByClassType(
  coaches: readonly AdminScheduleCoach[],
  classTypeId: string | null,
): AdminScheduleCoach[] {
  if (classTypeId === null) {
    return [];
  }

  return coaches.filter(
    (coach) => coach.isActive && coach.assignedClassTypeIds.includes(classTypeId),
  );
}

export function buildCoachDropdownState(
  coaches: readonly AdminScheduleCoach[],
  classTypeSelection: string,
  classTypeOptions: readonly SessionClassTypeOption[],
  currentCoachId: string,
  coachLabel: (coach: AdminScheduleCoach) => string,
): CoachDropdownState {
  const classTypeId = resolveSelectedClassTypeId(classTypeSelection, classTypeOptions);
  const eligibleCoaches = filterCoachesByClassType(coaches, classTypeId);

  if (classTypeId === null) {
    return {
      options: [],
      disabled: true,
      placeholder: "selectClassFirst",
      coachId: "",
    };
  }

  if (eligibleCoaches.length === 0) {
    return {
      options: [],
      disabled: true,
      placeholder: "noCoachesForClass",
      coachId: "",
    };
  }

  const coachStillValid = eligibleCoaches.some((coach) => coach.id === currentCoachId);
  const coachId = coachStillValid ? currentCoachId : eligibleCoaches[0]?.id ?? "";

  return {
    options: eligibleCoaches.map((coach) => ({
      value: coach.id,
      label: coachLabel(coach),
    })),
    disabled: false,
    placeholder: "coach",
    coachId,
  };
}

export function coachDropdownPlaceholderKey(
  placeholder: CoachDropdownState["placeholder"],
): "form.coach" | "form.selectClassFirst" | "form.noCoachesForClass" {
  if (placeholder === "selectClassFirst") {
    return "form.selectClassFirst";
  }
  if (placeholder === "noCoachesForClass") {
    return "form.noCoachesForClass";
  }
  return "form.coach";
}
