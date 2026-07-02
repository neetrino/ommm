"use client";

import type { useTranslations } from "next-intl";
import {
  ADMIN_SCHEDULE_FORM_MAX_CLASS_NAME_LENGTH,
  ADMIN_SCHEDULE_FORM_MAX_CLASS_TYPE_LENGTH,
  ADMIN_SCHEDULE_FORM_MAX_DESCRIPTION_LENGTH,
  ADMIN_SCHEDULE_FORM_MAX_INSTRUCTOR_LENGTH,
  ADMIN_SCHEDULE_FORM_MIN_DURATION,
  ADMIN_SCHEDULE_FORM_MIN_SPOTS,
  type AdminScheduleFormState,
} from "@/components/admin/admin-schedule-form.types";
import {
  ScheduleFilterDropdown,
  type ScheduleFilterOption,
} from "@/components/marketing/schedule/schedule-filter-dropdown";
import { OmmButton } from "@/components/ui/omm-button";
import { TimePickerInput } from "@/components/ui/time-picker-input";
import type { ScheduleDayOfWeek } from "@/components/admin/admin-schedule-types";

type AdminScheduleFormFieldsProps = {
  form: AdminScheduleFormState;
  setForm: React.Dispatch<React.SetStateAction<AdminScheduleFormState>>;
  pending: boolean;
  typePending: boolean;
  newTypeName: string;
  setNewTypeName: (value: string) => void;
  newTypeError: string | null;
  onAddType: () => void;
  mappedDayOptions: readonly ScheduleFilterOption<ScheduleDayOfWeek>[];
  mappedTypeOptions: readonly ScheduleFilterOption<string>[];
  t: ReturnType<typeof useTranslations<"adminPages.schedule">>;
};

export function AdminScheduleFormFields({
  form,
  setForm,
  pending,
  typePending,
  newTypeName,
  setNewTypeName,
  newTypeError,
  onAddType,
  mappedDayOptions,
  mappedTypeOptions,
  t,
}: AdminScheduleFormFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("form.className")}</span>
          <input
            name="className"
            className="ommm-input"
            maxLength={ADMIN_SCHEDULE_FORM_MAX_CLASS_NAME_LENGTH}
            value={form.className}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, className: event.target.value }))
            }
            disabled={pending}
            required
          />
        </label>
        <label className="space-y-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("form.instructor")}</span>
          <input
            name="instructorName"
            className="ommm-input"
            maxLength={ADMIN_SCHEDULE_FORM_MAX_INSTRUCTOR_LENGTH}
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
          <span className="ommm-label text-xs uppercase tracking-wide">{t("form.classType")}</span>
          <ScheduleFilterDropdown
            name="classType"
            label={t("form.selectClassTypePlaceholder")}
            ariaLabel={t("form.classType")}
            value={form.classType}
            options={mappedTypeOptions}
            onChange={(value) => setForm((prev) => ({ ...prev, classType: value }))}
            disabled={pending}
            required
          />
        </label>
        <div className="space-y-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("form.addClassTypeLabel")}</span>
          <div className="flex items-center gap-2">
            <input
              name="newClassType"
              className="ommm-input"
              maxLength={ADMIN_SCHEDULE_FORM_MAX_CLASS_TYPE_LENGTH}
              value={newTypeName}
              onChange={(event) => setNewTypeName(event.target.value)}
              placeholder={t("form.newClassTypePlaceholder")}
              disabled={pending || typePending}
            />
            <OmmButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={onAddType}
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
          <span className="ommm-label text-xs uppercase tracking-wide">{t("form.day")}</span>
          <ScheduleFilterDropdown
            name="dayOfWeek"
            label={t("form.day")}
            ariaLabel={t("form.day")}
            value={form.dayOfWeek}
            options={mappedDayOptions}
            onChange={(value) => setForm((prev) => ({ ...prev, dayOfWeek: value }))}
            disabled={pending}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("form.startTime")}</span>
          <TimePickerInput
            name="startTime"
            value={form.startTime}
            onChange={(nextValue) => setForm((prev) => ({ ...prev, startTime: nextValue }))}
            disabled={pending}
            required
          />
        </label>
        <label className="space-y-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("form.endTime")}</span>
          <TimePickerInput
            name="endTime"
            value={form.endTime}
            onChange={(nextValue) => setForm((prev) => ({ ...prev, endTime: nextValue }))}
            disabled={pending}
          />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("form.durationMinutes")}</span>
          <input
            name="durationMinutes"
            type="number"
            min={ADMIN_SCHEDULE_FORM_MIN_DURATION}
            className="ommm-input"
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
          <span className="ommm-label text-xs uppercase tracking-wide">{t("form.availableSpots")}</span>
          <input
            name="availableSpots"
            type="number"
            min={ADMIN_SCHEDULE_FORM_MIN_SPOTS}
            className="ommm-input"
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
        <span className="ommm-label text-xs uppercase tracking-wide">{t("form.description")}</span>
        <textarea
          name="description"
          className="ommm-input min-h-24"
          maxLength={ADMIN_SCHEDULE_FORM_MAX_DESCRIPTION_LENGTH}
          value={form.description}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, description: event.target.value }))
          }
          disabled={pending}
        />
      </label>
    </>
  );
}
