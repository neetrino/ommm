"use client";

import type { FormEvent } from "react";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { AdminCoachEditableAvatar } from "@/components/admin/admin-coach-editable-avatar";
import {
  AdminSheetEditableField,
  AdminSheetReadOnlyField,
  ADMIN_SHEET_FORM_SECTION_CLASS,
} from "@/components/admin/admin-sheet-editable-field";
import {
  calculateAgeFromBirthday,
  COACH_MAX_AGE,
  COACH_MIN_AGE,
  MAX_BIO_LENGTH,
  MAX_EXPERIENCE_YEARS,
  MAX_SPECIALIZATION_LENGTH,
  MIN_SCHEDULE_SPOTS,
  sanitizeCoachPreviewSrc,
  type CoachClassOption,
} from "@/components/admin/admin-coach-form-helpers";
import {
  getCoachFormSectionLabels,
  type CoachEditFormErrors,
  type CoachEditFormState,
} from "@/components/admin/admin-coach-edit-form.types";
import type { useCoachEditForm } from "@/components/admin/admin-coach-edit-form.use";
import { PlusIcon } from "@/components/ui/plus-icon";
import { OmmButton } from "@/components/ui/omm-button";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { TimePickerInput } from "@/components/ui/time-picker-input";
import { formatBirthdayInput, formatDateForUi, parseBirthdayDisplayToIso } from "@/lib/date-display";
import { formatPhoneDisplay } from "@/lib/phone";
import { PhoneInputField } from "@/components/ui/phone-input-field";
import { EditActionButton } from "@/components/ui/edit-action-button";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";
import { AdminCoachAssignedClassesPicker } from "@/components/admin/admin-coach-assigned-classes-picker";
import { coachCardInitials, type CoachCardUser } from "@/components/coaches/coach-card-display";

type CoachFormController = ReturnType<typeof useCoachEditForm>;

export type CoachSheetOverviewContext = {
  isActive: boolean;
  createdAt: string;
  totalClasses: number;
  substituteClasses: number;
  assignedClassesCount: number;
  availabilitySlotsCount: number;
  initials: string;
};

type CoachSheetTabPanelsProps = {
  activeTab: string;
  coachId: string;
  locale: string;
  classOptions: readonly CoachClassOption[];
  form: CoachEditFormState;
  errors: CoachEditFormErrors;
  busy: boolean;
  photoPreviewUrl: string | null;
  controller: CoachFormController;
  overview?: CoachSheetOverviewContext;
  personalInfoEditing: boolean;
  onStartPersonalInfoEdit: () => void;
  onPersonalInfoSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const SECTION_CLASS = ADMIN_SHEET_FORM_SECTION_CLASS;

export function CoachSheetTabPanels({
  activeTab,
  coachId,
  locale,
  classOptions,
  form,
  errors,
  busy,
  photoPreviewUrl,
  controller,
  overview,
  personalInfoEditing,
  onStartPersonalInfoEdit,
  onPersonalInfoSubmit,
}: CoachSheetTabPanelsProps) {
  const t = useTranslations("adminPages.coaches");
  const labels = getCoachFormSectionLabels(locale);
  const photoPreview = useMemo(() => {
    const localPreview =
      photoPreviewUrl !== null ? sanitizeCoachPreviewSrc(photoPreviewUrl) : null;
    if (localPreview !== null) {
      return localPreview;
    }
    const remote =
      form.photoUrl.trim() === ""
        ? null
        : sanitizeCoachPreviewSrc(resolveApiAssetUrl(form.photoUrl.trim()) ?? form.photoUrl.trim(), {
            allowRemoteHttp: true,
          });
    return remote;
  }, [form.photoUrl, photoPreviewUrl]);
  const photoPreviewSrc = photoPreview !== null ? encodeURI(photoPreview) : null;
  const hasPhoto = photoPreviewSrc !== null;
  const avatarInitials =
    overview?.initials ??
    coachCardInitials({
      name: form.name || null,
      lastName: form.lastName || null,
      email: form.email,
      avatarUrl: form.photoUrl || null,
    } satisfies CoachCardUser);

  if (activeTab === "profile") {
    return (
      <div className="space-y-5">
        <section className={SECTION_CLASS}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <AdminCoachEditableAvatar
              previewSrc={photoPreviewSrc}
              initials={avatarInitials}
              busy={busy}
              chooseLabel={t("fieldPhotoChoose")}
              uploadingLabel={t("fieldPhotoUploading")}
              removeLabel={t("fieldPhotoRemove")}
              showRemove={hasPhoto}
              onSelect={(file) => {
                controller.onPhotoSelected(file);
              }}
              onRemove={() => {
                controller.onPhotoDeleted();
              }}
            />
            {overview ? (
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${
                    overview.isActive
                      ? "bg-mint-100 text-sage-800"
                      : "bg-sand-100 text-sage-600"
                  }`}
                >
                  {overview.isActive ? t("filters.statusActive") : t("filters.statusInactive")}
                </span>
                <span className="text-sm text-sage-600">
                  {t("drawer.registrationDate")}: {formatDateForUi(overview.createdAt)}
                </span>
              </div>
            ) : null}
          </div>
          {errors.photo ? <p className="mt-3 text-xs text-red-800">{errors.photo}</p> : null}
        </section>

        {overview ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label={t("drawer.totalClasses")} value={overview.totalClasses} />
            <Metric label={t("drawer.substitutions")} value={overview.substituteClasses} />
            <Metric label={t("drawer.assignedClasses")} value={overview.assignedClassesCount} />
            <Metric label={t("drawer.availabilitySlots")} value={overview.availabilitySlotsCount} />
          </div>
        ) : null}

        <section className={SECTION_CLASS}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-sage-800">
                {labels.personalInfoHeading}
              </h3>
              <p className="mt-1 text-xs text-sage-500">{labels.personalInfoDescription}</p>
            </div>
            {!personalInfoEditing ? (
              <EditActionButton
                ariaLabel={t("edit")}
                onClick={onStartPersonalInfoEdit}
                disabled={busy}
              />
            ) : null}
          </div>
          {personalInfoEditing ? (
            <form className="grid gap-4 lg:grid-cols-2" onSubmit={onPersonalInfoSubmit}>
              <AdminSheetEditableField label={t("fieldEmail")} error={errors.email} className="lg:col-span-2">
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="ommm-input"
                  value={form.email}
                  onChange={(event) => controller.updateField("email", event.target.value)}
                  disabled={busy}
                />
              </AdminSheetEditableField>
              <AdminSheetEditableField label={t("fieldName")} error={errors.name}>
                <input
                  type="text"
                  autoComplete="given-name"
                  className="ommm-input"
                  value={form.name}
                  onChange={(event) => controller.updateField("name", event.target.value)}
                  disabled={busy}
                />
              </AdminSheetEditableField>
              <AdminSheetEditableField label={t("fieldLastName")} error={errors.lastName}>
                <input
                  type="text"
                  autoComplete="family-name"
                  className="ommm-input"
                  value={form.lastName}
                  onChange={(event) => controller.updateField("lastName", event.target.value)}
                  disabled={busy}
                />
              </AdminSheetEditableField>
              <AdminSheetEditableField label={t("fieldPhone")} error={errors.phone}>
                <PhoneInputField
                  autoComplete="tel"
                  className="ommm-input"
                  value={form.phone}
                  onValueChange={(value) => controller.updateField("phone", value)}
                  disabled={busy}
                />
              </AdminSheetEditableField>
              <AdminSheetEditableField label={t("fieldBirthday")} error={errors.birthday}>
                <input
                  name="birthdayDisplay"
                  type="text"
                  inputMode="numeric"
                  autoComplete="bday"
                  maxLength={10}
                  className="ommm-input"
                  value={form.birthday}
                  placeholder={labels.birthdayPlaceholder}
                  onChange={(event) => {
                    const nextValue = formatBirthdayInput(event.target.value);
                    controller.updateField("birthday", nextValue);
                    const iso = parseBirthdayDisplayToIso(nextValue);
                    const derivedAge = iso === null ? null : calculateAgeFromBirthday(iso);
                    if (derivedAge !== null) {
                      controller.updateField("age", String(derivedAge));
                    }
                  }}
                  disabled={busy}
                />
              </AdminSheetEditableField>
              <AdminSheetEditableField label={t("fieldAge")} error={errors.age}>
                <input
                  type="number"
                  min={COACH_MIN_AGE}
                  max={COACH_MAX_AGE}
                  inputMode="numeric"
                  className="ommm-input"
                  value={form.age}
                  onChange={(event) => controller.updateField("age", event.target.value)}
                  disabled={busy}
                />
              </AdminSheetEditableField>
            </form>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              <AdminSheetReadOnlyField
                label={t("fieldEmail")}
                value={form.email.trim().length > 0 ? form.email : "—"}
                className="lg:col-span-2"
              />
              <AdminSheetReadOnlyField
                label={t("fieldName")}
                value={form.name.trim().length > 0 ? form.name : "—"}
              />
              <AdminSheetReadOnlyField
                label={t("fieldLastName")}
                value={form.lastName.trim().length > 0 ? form.lastName : "—"}
              />
              <AdminSheetReadOnlyField
                label={t("fieldPhone")}
                value={form.phone.trim().length > 0 ? formatPhoneDisplay(form.phone) : "—"}
              />
              <AdminSheetReadOnlyField
                label={t("fieldBirthday")}
                value={form.birthday.trim().length > 0 ? form.birthday : "—"}
              />
              <AdminSheetReadOnlyField
                label={t("fieldAge")}
                value={form.age.trim().length > 0 ? form.age : "—"}
              />
            </div>
          )}
        </section>
      </div>
    );
  }

  if (activeTab === "details") {
    return (
      <section className={SECTION_CLASS}>
        <SectionHeading
          title={labels.coachDetailsHeading}
          description={labels.coachDetailsDescription}
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <AdminSheetEditableField label={t("fieldSpecialization")} error={errors.specialization}>
            <input
              type="text"
              className="ommm-input"
              value={form.specialization}
              maxLength={MAX_SPECIALIZATION_LENGTH}
              onChange={(event) => controller.updateField("specialization", event.target.value)}
              placeholder={t("fieldSpecializationPlaceholder")}
              disabled={busy}
            />
          </AdminSheetEditableField>
          <AdminSheetEditableField label={t("fieldExperience")} error={errors.experienceYears}>
            <input
              type="number"
              min={0}
              max={MAX_EXPERIENCE_YEARS}
              className="ommm-input"
              value={form.experienceYears}
              onChange={(event) => controller.updateField("experienceYears", event.target.value)}
              disabled={busy}
            />
          </AdminSheetEditableField>
          <AdminSheetEditableField label={t("fieldBio")} error={errors.bio} className="lg:col-span-2">
            <textarea
              className="ommm-input min-h-[150px] resize-y"
              value={form.bio}
              maxLength={MAX_BIO_LENGTH}
              onChange={(event) => controller.updateField("bio", event.target.value)}
              disabled={busy}
            />
          </AdminSheetEditableField>
        </div>
      </section>
    );
  }

  if (activeTab === "classes") {
    return (
      <section className={SECTION_CLASS}>
        <SectionHeading
          title={labels.assignedClassesHeading}
          description={labels.assignedClassesDescription}
        />
        <AdminCoachAssignedClassesPicker
          classOptions={classOptions}
          selectedIds={form.assignedClassTypeIds}
          onToggle={(classTypeId) => controller.toggleClassSelection(classTypeId)}
          disabled={busy}
          emptyLabel={t("fieldAssignedClassesEmpty")}
          noneSelectedLabel={t("assignedClassesNoneSelected")}
          selectedCountLabel={(count) => t("assignedClassesSelectedCount", { count })}
          error={errors.assignedClassTypeIds}
        />
      </section>
    );
  }

  if (activeTab === "schedule") {
    return (
      <section className={SECTION_CLASS}>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-sage-800">
            {labels.scheduleHeading}
          </h3>
          <OmmButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={controller.addScheduleRow}
            disabled={busy}
            className="gap-1.5"
          >
            <PlusIcon className="h-3.5 w-3.5 shrink-0" />
            {t("fieldScheduleAdd")}
          </OmmButton>
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border border-sand-500/20 bg-white/80 p-3">
          {form.schedule.map((slot, index) => (
            <div
              key={slot.id}
              className="grid gap-2 rounded-xl border border-white/70 bg-white/85 p-2 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_130px_auto]"
            >
              <DatePickerInput
                name={`slot-date-${coachId}-${index}`}
                ariaLabel={t("fieldSchedule")}
                placeholder={t("fieldSchedule")}
                value={slot.date}
                onChange={(nextValue) => controller.updateSchedule(slot.id, "date", nextValue)}
                disabled={busy}
              />
              <TimePickerInput
                name={`slot-time-${coachId}-${index}`}
                ariaLabel={t("fieldSchedule")}
                value={slot.time}
                onChange={(nextValue) => controller.updateSchedule(slot.id, "time", nextValue)}
                disabled={busy}
              />
              <input
                type="number"
                min={MIN_SCHEDULE_SPOTS}
                className="ommm-input"
                value={slot.spots}
                onChange={(event) => controller.updateSchedule(slot.id, "spots", event.target.value)}
                disabled={busy}
              />
              <OmmButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => controller.removeScheduleRow(slot.id)}
                disabled={busy || form.schedule.length <= 1}
              >
                {t("fieldScheduleRemove")}
              </OmmButton>
            </div>
          ))}
        </div>
        {errors.schedule ? <p className="mt-2 text-xs text-red-800">{errors.schedule}</p> : null}
      </section>
    );
  }

  return null;
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-sage-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-sage-900">{value}</p>
    </div>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-sage-800">{title}</h3>
      <p className="text-xs text-sage-500">{description}</p>
    </div>
  );
}
