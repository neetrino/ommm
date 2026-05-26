"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import {
  CLASS_RECURRENCE_VALUES,
  CLASS_STATUS_VALUES,
  WEEKDAY_VALUES,
  type AdminClassCoachOption,
  type AdminClassSessionRow,
  type AdminClassTypeOption,
  type ClassRecurrenceValue,
  type ClassStatusValue,
  type WeekdayValue,
} from "@/components/admin/admin-classes-types";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { OmmButton } from "@/components/ui/omm-button";

type AdminClassFormProps = {
  mode: "create" | "edit" | "duplicate";
  classTypes: readonly AdminClassTypeOption[];
  coaches: readonly AdminClassCoachOption[];
  item?: AdminClassSessionRow;
  onSaved: () => void;
  onCancel: () => void;
};

type FormState = {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  classTypeId: string;
  coachId: string;
  capacity: string;
  level: string;
  classFormat: string;
  price: string;
  sessionRequirement: string;
  status: ClassStatusValue;
  recurrencePattern: ClassRecurrenceValue;
  recurrenceEndsAt: string;
  recurrenceCount: string;
  recurrenceWeekdays: WeekdayValue[];
};

function toDateInput(iso: string): string {
  const d = new Date(iso);
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toTimeInput(iso: string): string {
  const d = new Date(iso);
  const hour = `${d.getHours()}`.padStart(2, "0");
  const minute = `${d.getMinutes()}`.padStart(2, "0");
  return `${hour}:${minute}`;
}

function buildInitialState(
  classTypes: readonly AdminClassTypeOption[],
  coaches: readonly AdminClassCoachOption[],
  item?: AdminClassSessionRow,
): FormState {
  const fallbackTypeId = classTypes[0]?.id ?? "";
  const fallbackCoachId = coaches[0]?.id ?? "";
  return {
    title: item?.title ?? "",
    description: item?.description ?? "",
    date: item ? toDateInput(item.startsAt) : "",
    startTime: item ? toTimeInput(item.startsAt) : "",
    endTime: item ? toTimeInput(item.endsAt) : "",
    classTypeId: item?.classType.id ?? fallbackTypeId,
    coachId: item?.coach.id ?? fallbackCoachId,
    capacity: item ? String(item.capacity) : "10",
    level: item?.level ?? "",
    classFormat: item?.classFormat ?? "",
    price: item ? String(item.priceCents / 100) : "",
    sessionRequirement: item?.sessionRequirement ? String(item.sessionRequirement) : "",
    status: item?.status ?? "DRAFT",
    recurrencePattern: item?.recurrencePattern ?? "NONE",
    recurrenceEndsAt: item?.recurrenceEndsAt ? toDateInput(item.recurrenceEndsAt) : "",
    recurrenceCount: item?.recurrenceCount ? String(item.recurrenceCount) : "",
    recurrenceWeekdays: item?.recurrenceWeekdays ?? [],
  };
}

function toIsoDateTime(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}

export function AdminClassForm({
  mode,
  classTypes,
  coaches,
  item,
  onSaved,
  onCancel,
}: AdminClassFormProps) {
  const t = useTranslations("adminPages.classes");
  const [form, setForm] = useState<FormState>(() => buildInitialState(classTypes, coaches, item));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitLockRef = useRef(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || submitLockRef.current) return;
    setError(null);

    const title = form.title.trim();
    if (title.length === 0) return setError(t("validation.titleRequired"));
    if (form.classTypeId.length === 0) return setError(t("validation.classTypeRequired"));
    if (form.coachId.length === 0) return setError(t("validation.coachRequired"));
    if (form.date.length === 0) return setError(t("validation.dateRequired"));
    if (form.startTime.length === 0 || form.endTime.length === 0) {
      return setError(t("validation.timeRequired"));
    }
    const capacity = Number.parseInt(form.capacity, 10);
    if (!Number.isInteger(capacity) || capacity < 1) return setError(t("validation.capacityInvalid"));
    const priceNumber = form.price.trim().length > 0 ? Number(form.price) : 0;
    if (!Number.isFinite(priceNumber) || priceNumber < 0) return setError(t("validation.priceInvalid"));
    const sessionRequirement =
      form.sessionRequirement.trim().length > 0
        ? Number.parseInt(form.sessionRequirement, 10)
        : null;
    if (sessionRequirement !== null && (!Number.isInteger(sessionRequirement) || sessionRequirement < 1)) {
      return setError(t("validation.sessionRequirementInvalid"));
    }
    if (form.recurrencePattern === "CUSTOM_WEEKDAYS" && form.recurrenceWeekdays.length === 0) {
      return setError(t("validation.recurrenceWeekdaysRequired"));
    }

    submitLockRef.current = true;
    setPending(true);
    try {
      const payload = {
        title,
        description: form.description.trim() || undefined,
        classTypeId: form.classTypeId,
        coachId: form.coachId,
        startsAt: toIsoDateTime(form.date, form.startTime),
        endsAt: toIsoDateTime(form.date, form.endTime),
        capacity,
        level: form.level.trim() || undefined,
        classFormat: form.classFormat.trim() || undefined,
        priceCents: Math.round(priceNumber * 100),
        sessionRequirement: sessionRequirement ?? undefined,
        status: form.status,
        recurrencePattern: form.recurrencePattern,
        recurrenceWeekdays:
          form.recurrencePattern === "CUSTOM_WEEKDAYS" ? form.recurrenceWeekdays : [],
        recurrenceEndsAt: form.recurrenceEndsAt
          ? new Date(`${form.recurrenceEndsAt}T00:00:00`).toISOString()
          : undefined,
        recurrenceCount: form.recurrenceCount ? Number.parseInt(form.recurrenceCount, 10) : undefined,
      };
      if (mode === "create" || mode === "duplicate") {
        await apiFetch("/classes/sessions", { method: "POST", body: JSON.stringify(payload) });
      } else {
        await apiFetch(`/classes/sessions/${item?.id ?? ""}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      }
      onSaved();
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : t("messages.genericError"));
    } finally {
      submitLockRef.current = false;
      setPending(false);
    }
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="mt-5 flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="space-y-1 sm:col-span-2">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("form.className")}</span>
          <input
            className="ommm-input"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            disabled={pending}
          />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("form.description")}</span>
          <textarea
            className="ommm-input min-h-24"
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            disabled={pending}
          />
        </label>
        <label className="space-y-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("form.date")}</span>
          <DatePickerInput
            name="class-date"
            ariaLabel={t("form.date")}
            value={form.date}
            onChange={(nextValue) => setForm((prev) => ({ ...prev, date: nextValue }))}
            disabled={pending}
          />
        </label>
        <label className="space-y-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("form.startTime")}</span>
          <input type="time" className="ommm-input" value={form.startTime} onChange={(event) => setForm((prev) => ({ ...prev, startTime: event.target.value }))} disabled={pending} />
        </label>
        <label className="space-y-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("form.endTime")}</span>
          <input type="time" className="ommm-input" value={form.endTime} onChange={(event) => setForm((prev) => ({ ...prev, endTime: event.target.value }))} disabled={pending} />
        </label>
        <label className="space-y-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("form.capacity")}</span>
          <input type="number" min={1} className="ommm-input" value={form.capacity} onChange={(event) => setForm((prev) => ({ ...prev, capacity: event.target.value }))} disabled={pending} />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="space-y-1"><span className="ommm-label text-xs uppercase tracking-wide">{t("form.classType")}</span><select className="ommm-input" value={form.classTypeId} onChange={(event) => setForm((prev) => ({ ...prev, classTypeId: event.target.value }))} disabled={pending}>{classTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}</select></label>
        <label className="space-y-1"><span className="ommm-label text-xs uppercase tracking-wide">{t("form.coach")}</span><select className="ommm-input" value={form.coachId} onChange={(event) => setForm((prev) => ({ ...prev, coachId: event.target.value }))} disabled={pending}>{coaches.map((coach) => <option key={coach.id} value={coach.id}>{coach.specialization ? `${coach.name} (${coach.specialization})` : coach.name}</option>)}</select></label>
        <label className="space-y-1"><span className="ommm-label text-xs uppercase tracking-wide">{t("form.level")}</span><input className="ommm-input" value={form.level} onChange={(event) => setForm((prev) => ({ ...prev, level: event.target.value }))} disabled={pending} /></label>
        <label className="space-y-1"><span className="ommm-label text-xs uppercase tracking-wide">{t("form.classFormat")}</span><input className="ommm-input" value={form.classFormat} onChange={(event) => setForm((prev) => ({ ...prev, classFormat: event.target.value }))} disabled={pending} /></label>
        <label className="space-y-1"><span className="ommm-label text-xs uppercase tracking-wide">{t("form.pricePerSession")}</span><input type="number" min={0} step="0.01" className="ommm-input" value={form.price} onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))} disabled={pending} /></label>
        <label className="space-y-1"><span className="ommm-label text-xs uppercase tracking-wide">{t("form.sessionRequirement")}</span><input type="number" min={1} className="ommm-input" value={form.sessionRequirement} onChange={(event) => setForm((prev) => ({ ...prev, sessionRequirement: event.target.value }))} disabled={pending} /></label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="space-y-1"><span className="ommm-label text-xs uppercase tracking-wide">{t("form.status")}</span><select className="ommm-input" value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as ClassStatusValue }))} disabled={pending}>{CLASS_STATUS_VALUES.map((status) => <option key={status} value={status}>{t(`status.${status}`)}</option>)}</select></label>
        <label className="space-y-1"><span className="ommm-label text-xs uppercase tracking-wide">{t("form.recurrence")}</span><select className="ommm-input" value={form.recurrencePattern} onChange={(event) => setForm((prev) => ({ ...prev, recurrencePattern: event.target.value as ClassRecurrenceValue }))} disabled={pending}>{CLASS_RECURRENCE_VALUES.map((value) => <option key={value} value={value}>{t(`recurrence.${value}`)}</option>)}</select></label>
      </div>

      {form.recurrencePattern === "CUSTOM_WEEKDAYS" ? (
        <div className="rounded-xl border border-white/60 bg-white/50 px-3 py-3">
          <p className="ommm-label text-xs uppercase tracking-wide">{t("form.customWeekdays")}</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {WEEKDAY_VALUES.map((day) => {
              const selected = form.recurrenceWeekdays.includes(day);
              return (
                <label key={day} className="inline-flex items-center gap-2 text-sm text-sage-700">
                  <input type="checkbox" checked={selected} onChange={() => setForm((prev) => ({ ...prev, recurrenceWeekdays: selected ? prev.recurrenceWeekdays.filter((value) => value !== day) : [...prev.recurrenceWeekdays, day] }))} />
                  <span>{t(`weekday.${day}`)}</span>
                </label>
              );
            })}
          </div>
        </div>
      ) : null}

      {form.recurrencePattern !== "NONE" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-1"><span className="ommm-label text-xs uppercase tracking-wide">{t("form.recurrenceEndDate")}</span><DatePickerInput name="class-recurrence-end-date" ariaLabel={t("form.recurrenceEndDate")} value={form.recurrenceEndsAt} onChange={(nextValue) => setForm((prev) => ({ ...prev, recurrenceEndsAt: nextValue }))} disabled={pending} /></label>
          <label className="space-y-1"><span className="ommm-label text-xs uppercase tracking-wide">{t("form.recurrenceCount")}</span><input type="number" min={1} className="ommm-input" value={form.recurrenceCount} onChange={(event) => setForm((prev) => ({ ...prev, recurrenceCount: event.target.value }))} disabled={pending} /></label>
        </div>
      ) : null}

      {error !== null ? <p className="app-alert-warn text-sm">{error}</p> : null}

      <div className="flex flex-wrap justify-end gap-3 pt-2">
        <OmmButton type="button" variant="secondary" size="sm" onClick={onCancel} disabled={pending}>
          {t("cancelButton")}
        </OmmButton>
        <OmmButton type="submit" variant="primary" size="sm" disabled={pending}>
          {pending ? t("savingButton") : mode === "edit" ? t("saveButton") : t("createButton")}
        </OmmButton>
      </div>
    </form>
  );
}
