"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import type {
  AdminScheduleItem,
  ScheduleDayOfWeek,
} from "@/components/admin/admin-schedule-types";
import {
  SCHEDULE_DAY_OPTIONS,
  isValidTime24h,
  minutesFromTime,
} from "@/components/admin/admin-schedule-helpers";
import { ApiError, apiFetch } from "@/lib/api";
import { OmmButton } from "@/components/ui/omm-button";

const MAX_CLASS_NAME_LENGTH = 120;
const MAX_INSTRUCTOR_LENGTH = 120;
const MAX_CLASS_TYPE_LENGTH = 80;
const MAX_TYPE_SLUG_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 1000;
const MIN_SPOTS = 1;
const MIN_DURATION = 1;

type ScheduleMutationPayload = {
  className: string;
  instructorName: string;
  classType: string;
  dayOfWeek: ScheduleDayOfWeek;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  availableSpots: number;
  description?: string;
  isActive: boolean;
};

type FormState = {
  className: string;
  instructorName: string;
  classType: string;
  dayOfWeek: ScheduleDayOfWeek;
  startTime: string;
  endTime: string;
  durationMinutes: string;
  availableSpots: string;
  description: string;
  isActive: boolean;
};

type AdminScheduleFormProps = {
  mode: "create" | "edit";
  classTypeOptions: readonly string[];
  item?: AdminScheduleItem;
  onSaved: () => void;
  onCancel: () => void;
};

type ClassTypeCreateResponse = {
  id: string;
  name: string;
  slug: string;
};

function initialState(item?: AdminScheduleItem): FormState {
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
      item?.availableSpots === undefined ? "10" : String(item.availableSpots),
    description: item?.description ?? "",
    isActive: item?.isActive ?? true,
  };
}

function payloadFromState(
  form: FormState,
  t: ReturnType<typeof useTranslations>,
): ScheduleMutationPayload {
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
  if (className.length > MAX_CLASS_NAME_LENGTH) {
    throw new Error(t("form.errors.classNameTooLong"));
  }
  if (instructorName.length === 0) {
    throw new Error(t("form.errors.instructorRequired"));
  }
  if (instructorName.length > MAX_INSTRUCTOR_LENGTH) {
    throw new Error(t("form.errors.instructorTooLong"));
  }
  if (classType.length === 0) {
    throw new Error(t("form.errors.classTypeRequired"));
  }
  if (classType.length > MAX_CLASS_TYPE_LENGTH) {
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
    if (!Number.isInteger(durationMinutes) || durationMinutes < MIN_DURATION) {
      throw new Error(t("form.errors.durationInvalid"));
    }
  }

  const availableSpots = Number(spotsText);
  if (!Number.isInteger(availableSpots) || availableSpots < MIN_SPOTS) {
    throw new Error(t("form.errors.spotsInvalid"));
  }
  if (description.length > MAX_DESCRIPTION_LENGTH) {
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

export function AdminScheduleForm({
  mode,
  classTypeOptions,
  item,
  onSaved,
  onCancel,
}: AdminScheduleFormProps) {
  const t = useTranslations("adminPages.schedule");
  const [form, setForm] = useState<FormState>(() => initialState(item));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typePending, setTypePending] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeError, setNewTypeError] = useState<string | null>(null);
  const [typeOptions, setTypeOptions] = useState<string[]>(() => [...classTypeOptions]);
  const submitLockRef = useRef(false);

  function buildSlugFromTypeName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, MAX_TYPE_SLUG_LENGTH);
  }

  async function onAddType() {
    if (typePending || pending) {
      return;
    }
    const normalized = newTypeName.trim();
    setNewTypeError(null);

    if (normalized.length === 0) {
      setNewTypeError(t("form.errors.classTypeRequired"));
      return;
    }
    if (normalized.length > MAX_CLASS_TYPE_LENGTH) {
      setNewTypeError(t("form.errors.classTypeTooLong"));
      return;
    }
    const alreadyExists = typeOptions.some(
      (option) => option.toLowerCase() === normalized.toLowerCase(),
    );
    if (alreadyExists) {
      setForm((prev) => ({ ...prev, classType: normalized }));
      setNewTypeName("");
      return;
    }

    const slug = buildSlugFromTypeName(normalized);
    if (slug.length === 0) {
      setNewTypeError(t("form.errors.classTypeRequired"));
      return;
    }

    setTypePending(true);
    try {
      const created = await apiFetch<ClassTypeCreateResponse>("/classes/types", {
        method: "POST",
        body: JSON.stringify({
          name: normalized,
          slug,
        }),
      });
      setTypeOptions((prev) => [...prev, created.name].sort((a, b) => a.localeCompare(b)));
      setForm((prev) => ({ ...prev, classType: created.name }));
      setNewTypeName("");
      setNewTypeError(null);
    } catch (requestError) {
      setNewTypeError(
        requestError instanceof ApiError
          ? requestError.message
          : t("messages.genericError"),
      );
    } finally {
      setTypePending(false);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || submitLockRef.current) {
      return;
    }
    setError(null);

    let payload: ScheduleMutationPayload;
    try {
      payload = payloadFromState(form, t);
    } catch (validationError) {
      setError(
        validationError instanceof Error
          ? validationError.message
          : t("messages.genericError"),
      );
      return;
    }

    submitLockRef.current = true;
    setPending(true);
    try {
      if (mode === "create") {
        await apiFetch<AdminScheduleItem>("/schedule/admin", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch<AdminScheduleItem>(`/schedule/admin/${item?.id ?? ""}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      }
      onSaved();
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : t("messages.genericError"),
      );
    } finally {
      submitLockRef.current = false;
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      className="mt-5 flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium text-sage-700">{t("form.className")}</span>
          <input
            name="className"
            className="app-input border-sand-500/25 bg-white/90 text-sage-900 placeholder:text-sage-400"
            maxLength={MAX_CLASS_NAME_LENGTH}
            value={form.className}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, className: event.target.value }))
            }
            disabled={pending}
            required
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium text-sage-700">{t("form.instructor")}</span>
          <input
            name="instructorName"
            className="app-input border-sand-500/25 bg-white/90 text-sage-900 placeholder:text-sage-400"
            maxLength={MAX_INSTRUCTOR_LENGTH}
            value={form.instructorName}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, instructorName: event.target.value }))
            }
            disabled={pending}
            required
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium text-sage-700">{t("form.classType")}</span>
          <select
            name="classType"
            className="app-input border-sand-500/25 bg-white/90 text-sage-900"
            value={form.classType}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, classType: event.target.value }))
            }
            disabled={pending}
            required
          >
            <option value="">{t("form.selectClassTypePlaceholder")}</option>
            {typeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <div className="space-y-1">
          <span className="text-sm font-medium text-sage-700">{t("form.addClassTypeLabel")}</span>
          <div className="flex items-center gap-2">
            <input
              name="newClassType"
              className="app-input border-sand-500/25 bg-white/90 text-sage-900 placeholder:text-sage-400"
              maxLength={MAX_CLASS_TYPE_LENGTH}
              value={newTypeName}
              onChange={(event) => setNewTypeName(event.target.value)}
              placeholder={t("form.newClassTypePlaceholder")}
              disabled={pending || typePending}
            />
            <OmmButton
              type="button"
              variant="secondary"
              size="sm"
              className="h-10 rounded-xl px-3 text-xs"
              onClick={() => {
                void onAddType();
              }}
              disabled={pending || typePending}
            >
              {typePending ? t("form.addingType") : t("form.addTypeButton")}
            </OmmButton>
          </div>
          {newTypeError !== null ? (
            <p className="text-xs text-red-800">{newTypeError}</p>
          ) : null}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium text-sage-700">{t("form.day")}</span>
          <select
            name="dayOfWeek"
            className="app-input border-sand-500/25 bg-white/90 text-sage-900"
            value={form.dayOfWeek}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                dayOfWeek: event.target.value as ScheduleDayOfWeek,
              }))
            }
            disabled={pending}
          >
            {SCHEDULE_DAY_OPTIONS.map((day) => (
              <option key={day} value={day}>
                {t(`days.${day}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="space-y-1">
          <span className="text-sm font-medium text-sage-700">{t("form.startTime")}</span>
          <input
            name="startTime"
            type="time"
            className="app-input border-sand-500/25 bg-white/90 text-sage-900"
            value={form.startTime}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, startTime: event.target.value }))
            }
            disabled={pending}
            required
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium text-sage-700">{t("form.endTime")}</span>
          <input
            name="endTime"
            type="time"
            className="app-input border-sand-500/25 bg-white/90 text-sage-900"
            value={form.endTime}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, endTime: event.target.value }))
            }
            disabled={pending}
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium text-sage-700">{t("form.durationMinutes")}</span>
          <input
            name="durationMinutes"
            type="number"
            min={MIN_DURATION}
            className="app-input border-sand-500/25 bg-white/90 text-sage-900"
            value={form.durationMinutes}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, durationMinutes: event.target.value }))
            }
            disabled={pending}
            placeholder={t("form.durationHint")}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium text-sage-700">{t("form.availableSpots")}</span>
          <input
            name="availableSpots"
            type="number"
            min={MIN_SPOTS}
            className="app-input border-sand-500/25 bg-white/90 text-sage-900"
            value={form.availableSpots}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, availableSpots: event.target.value }))
            }
            disabled={pending}
            required
          />
        </label>
        <label className="inline-flex items-center gap-3 rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm text-sage-800">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, isActive: event.target.checked }))
            }
            disabled={pending}
          />
          <span>{t("form.active")}</span>
        </label>
      </div>

      <label className="space-y-1">
        <span className="text-sm font-medium text-sage-700">{t("form.description")}</span>
        <textarea
          name="description"
          className="app-input min-h-24 border-sand-500/25 bg-white/90 text-sage-900 placeholder:text-sage-400"
          maxLength={MAX_DESCRIPTION_LENGTH}
          value={form.description}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, description: event.target.value }))
          }
          disabled={pending}
        />
      </label>

      {error !== null ? (
        <p className="app-alert-warn text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-3 pt-2">
        <OmmButton
          type="button"
          variant="ghost"
          size="sm"
          className="h-10 rounded-xl px-4 text-xs"
          onClick={onCancel}
          disabled={pending}
        >
          {t("cancelButton")}
        </OmmButton>
        <OmmButton
          type="submit"
          variant="primary"
          size="sm"
          className="h-10 rounded-xl px-5 text-xs"
          disabled={pending}
        >
          {pending
            ? mode === "create"
              ? t("savingCreate")
              : t("savingEdit")
            : mode === "create"
              ? t("submitCreate")
              : t("submitEdit")}
        </OmmButton>
      </div>
    </form>
  );
}
