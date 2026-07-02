import { useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  buildCoachDropdownState,
  filterCoachesByClassType,
} from "@/components/admin/admin-schedule-coach-filter";
import {
  batchFormPayload,
  createScheduleSlotId,
  formPayload,
  initialCalendarSchedule,
  initialForm,
  weekdayFromDate,
} from "@/components/admin/admin-schedule-session-form.helpers";
import { coachName, splitSessionLevels } from "@/components/admin/admin-schedule-session.helpers";
import {
  buildSessionLevelOptions,
  resolveSessionClassTypeId,
  sessionTitleFromClassTypeSelection,
  type SessionClassTypeOption,
} from "@/components/admin/admin-schedule-session-class-type-resolve";
import type {
  AdminScheduleCoach,
  AdminScheduleFormState,
  AdminScheduleSession,
  CalendarScheduleSlot,
} from "@/components/admin/admin-schedule-session.types";
import { ApiError, apiFetch } from "@/lib/api";

type UseAdminScheduleSessionFormSheetParams = {
  mode: "create" | "edit" | "duplicate";
  row?: AdminScheduleSession;
  anchorDay?: string | null;
  classTypeOptions: readonly SessionClassTypeOption[];
  coaches: readonly AdminScheduleCoach[];
  onSaved: (row: AdminScheduleSession | AdminScheduleSession[]) => void;
};

export function useAdminScheduleSessionFormSheet({
  mode,
  row,
  anchorDay,
  classTypeOptions,
  coaches,
  onSaved,
}: UseAdminScheduleSessionFormSheetParams) {
  const t = useTranslations("adminPages.classes");
  const titleId = useId();
  const formId = useId();
  const [form, setForm] = useState<AdminScheduleFormState>(() =>
    initialForm(classTypeOptions, coaches, row),
  );
  const initialCalendar = initialCalendarSchedule(form, anchorDay);
  const [calendarStartDate, setCalendarStartDate] = useState(initialCalendar.calendarStartDate);
  const [calendarEndDate, setCalendarEndDate] = useState(initialCalendar.calendarEndDate);
  const [calendarSlots, setCalendarSlots] = useState<CalendarScheduleSlot[]>(
    initialCalendar.calendarSlots,
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isBatchCreate = mode !== "edit";
  const levelOptions = useMemo(
    () => buildSessionLevelOptions((key) => t(key), [...splitSessionLevels(row?.level), ...form.levels]),
    [form.levels, row?.level, t],
  );
  const coachDropdown = useMemo(
    () =>
      buildCoachDropdownState(
        coaches,
        form.classTypeId,
        classTypeOptions,
        form.coachId,
        coachName,
      ),
    [classTypeOptions, coaches, form.classTypeId, form.coachId],
  );

  function onClassTypeChange(value: string): void {
    setForm((current) => {
      const nextCoachDropdown = buildCoachDropdownState(
        coaches,
        value,
        classTypeOptions,
        current.coachId,
        coachName,
      );
      return {
        ...current,
        classTypeId: value,
        coachId: nextCoachDropdown.coachId,
      };
    });
  }

  function addCalendarSlot(): void {
    setCalendarSlots((current) => [
      ...current,
      {
        id: createScheduleSlotId(),
        weekday:
          current.at(-1)?.weekday ?? weekdayFromDate(`${calendarStartDate}T00:00:00`),
        startTime: form.startTime,
        endTime: form.endTime,
      },
    ]);
  }

  function updateCalendarSlot<K extends keyof Omit<CalendarScheduleSlot, "id">>(
    id: string,
    key: K,
    value: CalendarScheduleSlot[K],
  ): void {
    setCalendarSlots((current) =>
      current.map((slot) => (slot.id === id ? { ...slot, [key]: value } : slot)),
    );
  }

  function removeCalendarSlot(id: string): void {
    setCalendarSlots((current) => current.filter((slot) => slot.id !== id));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const resolvedClassType = resolveSessionClassTypeId(form.classTypeId, classTypeOptions);
      const title = sessionTitleFromClassTypeSelection(form.classTypeId, classTypeOptions);
      if (title.length === 0) {
        throw new Error(t("validation.classTypeRequired"));
      }
      const capacity = Number(form.capacity);
      if (!Number.isInteger(capacity) || capacity < 1) {
        throw new Error(t("validation.capacityInvalid"));
      }
      const eligibleCoaches = filterCoachesByClassType(
        coaches,
        resolvedClassType.classTypeId,
      );
      if (
        eligibleCoaches.length === 0 ||
        !eligibleCoaches.some((coach) => coach.id === form.coachId)
      ) {
        throw new Error(t("validation.coachNotAssigned"));
      }
      if (isBatchCreate) {
        const payload = batchFormPayload(
          form,
          resolvedClassType.classTypeId,
          title,
          calendarStartDate,
          calendarEndDate,
          calendarSlots,
        );
        const saved = await apiFetch<AdminScheduleSession[]>("/classes/sessions/batch", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        onSaved(saved);
        return;
      }
      const saved = await apiFetch<AdminScheduleSession>(
        row?.id ? `/classes/sessions/${row.id}` : "/classes/sessions",
        { method: "PATCH", body: JSON.stringify(formPayload(form, resolvedClassType.classTypeId, title)) },
      );
      onSaved(saved);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : t("messages.genericError"),
      );
    } finally {
      setPending(false);
    }
  }

  return {
    t,
    titleId,
    formId,
    form,
    setForm,
    calendarStartDate,
    setCalendarStartDate,
    calendarEndDate,
    setCalendarEndDate,
    calendarSlots,
    pending,
    error,
    isBatchCreate,
    levelOptions,
    coachDropdown,
    onClassTypeChange,
    addCalendarSlot,
    updateCalendarSlot,
    removeCalendarSlot,
    submit,
  };
}
