import {
  ACCEPT_PHOTO,
  MAX_BIO_LENGTH,
  MAX_EXPERIENCE_YEARS,
  MAX_SPECIALIZATION_LENGTH,
  type CoachClassOption,
} from "@/components/admin/admin-coach-form-helpers";
import {
  AdminCreateCoachFieldError,
  adminCreateCoachInputClass,
} from "@/components/admin/admin-create-coach-field-error";
import type { AdminCreateCoachFocusField } from "@/components/admin/admin-create-coach-form-focus";
import { AdminCoachAssignedClassesPicker } from "@/components/admin/admin-coach-assigned-classes-picker";
import { OmmButton } from "@/components/ui/omm-button";
import {
  AdminRequiredMark,
  ADMIN_INVALID_FIELD_CLASS,
} from "@/components/admin/admin-sheet-editable-field";

type AdminCreateCoachFormDetailsSectionProps = {
  classOptions: readonly CoachClassOption[];
  selectedClassIds: string[];
  onToggleClassSelection: (classTypeId: string) => void;
  photoPreview: string | null;
  photoPreviewImgSrc: string | null;
  onPhotoSelected: (file: File | null) => void;
  pending: boolean;
  errorField: AdminCreateCoachFocusField | null;
  errorMessage: string | null;
  t: (key: string) => string;
  tPage: (key: string, values?: Record<string, string | number>) => string;
};

export function AdminCreateCoachFormDetailsSection({
  classOptions,
  selectedClassIds,
  onToggleClassSelection,
  photoPreview,
  photoPreviewImgSrc,
  onPhotoSelected,
  pending,
  errorField,
  errorMessage,
  t,
  tPage,
}: AdminCreateCoachFormDetailsSectionProps) {
  const photoInvalid = errorField === "photo";
  const assignedInvalid = errorField === "assignedClasses";

  return (
    <>
      <section className="rounded-[24px] border border-white/60 bg-white/60 p-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-sage-800">
            Coach Details
          </h3>
          <p className="text-xs text-sage-500">Experience, specialization, and profile media</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="ommm-label text-xs uppercase tracking-wide">
              {t("specializationLabel")}
              <AdminRequiredMark />
            </span>
            <input
              name="specialization"
              className={adminCreateCoachInputClass("specialization", errorField)}
              maxLength={MAX_SPECIALIZATION_LENGTH}
              placeholder={t("specializationPlaceholder")}
              required
              aria-invalid={errorField === "specialization"}
            />
            <AdminCreateCoachFieldError
              field="specialization"
              errorField={errorField}
              message={errorMessage}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="ommm-label text-xs uppercase tracking-wide">
              {t("experienceLabel")}
            </span>
            <input
              name="experienceYears"
              type="number"
              className={adminCreateCoachInputClass("experienceYears", errorField)}
              min={0}
              max={MAX_EXPERIENCE_YEARS}
              inputMode="numeric"
              aria-invalid={errorField === "experienceYears"}
            />
            <AdminCreateCoachFieldError
              field="experienceYears"
              errorField={errorField}
              message={errorMessage}
            />
          </label>
          <div
            className="flex flex-col gap-2 lg:col-span-2"
            data-create-coach-field="photo"
            data-form-field="photo"
          >
            <span className="ommm-label text-xs uppercase tracking-wide">{t("photoLabel")}</span>
            <div
              className={`rounded-2xl border bg-white/80 p-3 ${
                photoInvalid
                  ? ADMIN_INVALID_FIELD_CLASS
                  : "border-sand-500/20"
              }`}
            >
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center rounded-xl border border-sand-500/30 px-3 py-2 text-sm text-sage-700 transition-colors hover:bg-sand-50/70">
                  <input
                    type="file"
                    accept={ACCEPT_PHOTO}
                    className="sr-only"
                    disabled={pending}
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      onPhotoSelected(file);
                    }}
                  />
                  {t("photoChoose")}
                </label>
                {photoPreview !== null ? (
                  <OmmButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onPhotoSelected(null)}
                    disabled={pending}
                  >
                    {t("scheduleRemoveRow")}
                  </OmmButton>
                ) : null}
              </div>
              {photoPreviewImgSrc !== null ? (
                <div className="mt-3 overflow-hidden rounded-xl border border-white/70 bg-sage-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreviewImgSrc}
                    alt={t("photoPreviewAlt")}
                    className="h-44 w-full object-contain"
                  />
                </div>
              ) : (
                <p className="mt-2 text-xs text-sage-500">{t("photoHint")}</p>
              )}
            </div>
            <AdminCreateCoachFieldError
              field="photo"
              errorField={errorField}
              message={errorMessage}
            />
          </div>
          <label className="flex flex-col gap-1 lg:col-span-2">
            <span className="ommm-label text-xs uppercase tracking-wide">{t("bioLabel")}</span>
            <textarea
              name="bio"
              className={adminCreateCoachInputClass("bio", errorField, "min-h-[150px] resize-y")}
              maxLength={MAX_BIO_LENGTH}
              aria-invalid={errorField === "bio"}
            />
            <AdminCreateCoachFieldError
              field="bio"
              errorField={errorField}
              message={errorMessage}
            />
          </label>
        </div>
      </section>

      <section
        className={`rounded-[24px] border bg-white/60 p-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md sm:p-5 ${
          assignedInvalid ? ADMIN_INVALID_FIELD_CLASS : "border-white/60"
        }`}
        data-create-coach-field="assignedClasses"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-sage-800">
            Assigned Classes
            <AdminRequiredMark />
          </h3>
          <p className="text-xs text-sage-500">Select class types coached by this person</p>
        </div>
        <AdminCoachAssignedClassesPicker
          classOptions={classOptions}
          selectedIds={selectedClassIds}
          onToggle={onToggleClassSelection}
          disabled={pending}
          emptyLabel={t("assignedClassesEmpty")}
          noneSelectedLabel={tPage("assignedClassesNoneSelected")}
          selectedCountLabel={(count) => tPage("assignedClassesSelectedCount", { count })}
          error={assignedInvalid ? (errorMessage ?? undefined) : undefined}
        />
      </section>
    </>
  );
}
