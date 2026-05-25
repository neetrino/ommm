"use client";

import { useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import {
  ScheduleFilterDropdown,
  type ScheduleFilterOption,
} from "@/components/marketing/schedule/schedule-filter-dropdown";
import {
  ACCEPT_PHOTO,
  calculateAgeFromBirthday,
  COACH_MAX_AGE,
  COACH_MIN_AGE,
  createScheduleRow,
  isValidEmail,
  isValidPhone,
  isValidTime,
  MAX_BIO_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_EXPERIENCE_YEARS,
  MAX_NAME_LENGTH,
  MAX_PHOTO_BYTES,
  MAX_PHONE_CHARS,
  MAX_SPECIALIZATION_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_SCHEDULE_SPOTS,
  normalizeScheduleForApi,
  readFileAsBase64Payload,
  sanitizeCoachPreviewSrc,
  type CoachClassOption,
  type CoachScheduleInput,
} from "@/components/admin/admin-coach-form-helpers";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { OmmButton } from "@/components/ui/omm-button";
import { PasswordInput } from "@/components/ui/password-input";

type CreateCoachApiResponse = {
  id: string;
  classType: string | null;
  user: {
    id: string;
    name: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
  };
};

export type AdminCreateCoachFormProps = {
  classTypeOptions: readonly string[];
  classOptions: readonly CoachClassOption[];
  /** When set, successful create invokes this instead of inline success + refresh (parent handles refresh). */
  onCreated?: () => void;
  /** Optional Cancel (e.g. close modal); omit for standalone usage. */
  onCancel?: () => void;
};

export function AdminCreateCoachForm({
  classTypeOptions,
  classOptions,
  onCreated,
  onCancel,
}: AdminCreateCoachFormProps) {
  const t = useTranslations("adminPages.coaches.create");
  const tPage = useTranslations("adminPages.coaches");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);
  const submitLockRef = useRef(false);
  const [classTypeValue, setClassTypeValue] = useState("");
  const [birthdayValue, setBirthdayValue] = useState("");
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [scheduleRows, setScheduleRows] = useState<CoachScheduleInput[]>([
    createScheduleRow(),
  ]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const classTypeDropdownOptions: ScheduleFilterOption<string>[] = classTypeOptions.map(
    (value) => ({
      value,
      label: value,
    }),
  );
  const photoPreview = useMemo(() => {
    return photoPreviewUrl !== null ? sanitizeCoachPreviewSrc(photoPreviewUrl) : null;
  }, [photoPreviewUrl]);

  function onPhotoSelected(file: File | null): void {
    if (photoPreviewUrl !== null) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
    setPhotoFile(file);
    setPhotoPreviewUrl(file !== null ? URL.createObjectURL(file) : null);
  }

  function toggleClassSelection(classTypeId: string): void {
    setSelectedClassIds((prev) =>
      prev.includes(classTypeId)
        ? prev.filter((value) => value !== classTypeId)
        : [...prev, classTypeId],
    );
  }

  function updateScheduleRow(
    rowId: string,
    key: keyof Omit<CoachScheduleInput, "id">,
    value: string,
  ): void {
    setScheduleRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [key]: value } : row)),
    );
  }

  function addScheduleRow(): void {
    setScheduleRows((prev) => [...prev, createScheduleRow()]);
  }

  function removeScheduleRow(rowId: string): void {
    setScheduleRows((prev) => {
      if (prev.length <= 1) {
        return prev;
      }
      return prev.filter((row) => row.id !== rowId);
    });
  }

  function formatBirthdayInput(rawValue: string): string {
    const digits = rawValue.replace(/\D/g, "").slice(0, 8);
    if (digits.length === 0) {
      return "";
    }

    const dayRaw = digits.slice(0, 2);
    const monthRaw = digits.slice(2, 4);
    const yearRaw = digits.slice(4, 8);

    const day =
      dayRaw.length < 2
        ? dayRaw
        : String(Math.max(1, Math.min(31, Number(dayRaw)))).padStart(2, "0");

    if (digits.length <= 2) {
      return day;
    }

    const month =
      monthRaw.length < 2
        ? monthRaw
        : String(Math.max(1, Math.min(12, Number(monthRaw)))).padStart(2, "0");

    if (digits.length <= 4) {
      return `${day}/${month}`;
    }

    return `${day}/${month}/${yearRaw}`;
  }

  function parseBirthdayDisplayToIso(displayValue: string): string | null {
    const trimmed = displayValue.trim();
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
    if (match === null) {
      return null;
    }
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
      return null;
    }
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }
    return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending || submitLockRef.current) {
      return;
    }
    const form = e.currentTarget;

    const fd = new FormData(form);
    const nameRaw = String(fd.get("name") ?? "").trim();
    const lastNameRaw = String(fd.get("lastName") ?? "").trim();
    const emailRaw = String(fd.get("email") ?? "").trim();
    const phoneRaw = String(fd.get("phone") ?? "").trim();
    const ageRaw = String(fd.get("age") ?? "").trim();
    const birthdayRaw = String(fd.get("birthday") ?? "").trim();
    const bioRaw = String(fd.get("bio") ?? "").trim();
    const experienceRaw = String(fd.get("experienceYears") ?? "").trim();
    const specializationRaw = String(fd.get("specialization") ?? "").trim();
    const classTypeRaw = String(fd.get("classType") ?? "").trim();
    const password = String(fd.get("password") ?? "");

    setError(null);
    setSuccess(false);

    if (nameRaw.length === 0) {
      setError(t("nameRequired"));
      return;
    }
    if (lastNameRaw.length === 0) {
      setError(t("lastNameRequired"));
      return;
    }
    if (!isValidEmail(emailRaw)) {
      setError(t("emailInvalid"));
      return;
    }
    if (phoneRaw.length === 0) {
      setError(t("phoneRequired"));
      return;
    }
    if (!isValidPhone(phoneRaw)) {
      setError(t("phoneInvalid"));
      return;
    }
    const ageNum = Number(ageRaw);
    if (
      ageRaw.length === 0 ||
      !Number.isInteger(ageNum) ||
      ageNum < COACH_MIN_AGE ||
      ageNum > COACH_MAX_AGE
    ) {
      setError(t("ageInvalid", { min: COACH_MIN_AGE, max: COACH_MAX_AGE }));
      return;
    }
    if (birthdayRaw.length === 0) {
      setError(t("birthdayRequired"));
      return;
    }
    const birthdayIso = parseBirthdayDisplayToIso(birthdayRaw);
    if (birthdayIso === null) {
      setError(t("birthdayInvalid"));
      return;
    }
    const birthdayDate = new Date(birthdayIso);
    if (Number.isNaN(birthdayDate.getTime())) {
      setError(t("birthdayInvalid"));
      return;
    }
    const derivedAge = calculateAgeFromBirthday(birthdayIso);
    if (derivedAge === null || Math.abs(derivedAge - ageNum) > 1) {
      setError(t("ageBirthdayMismatch"));
      return;
    }
    if (bioRaw.length === 0) {
      setError(t("bioRequired"));
      return;
    }
    if (bioRaw.length > MAX_BIO_LENGTH) {
      setError(t("bioTooLong"));
      return;
    }
    if (specializationRaw.length === 0) {
      setError(t("specializationRequired"));
      return;
    }
    if (classTypeRaw.length === 0) {
      setError(t("classTypeRequired"));
      return;
    }
    if (!classTypeOptions.includes(classTypeRaw)) {
      setError(t("classTypeInvalid"));
      return;
    }
    if (password.length === 0) {
      setError(t("passwordRequired"));
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t("passwordTooShort", { min: MIN_PASSWORD_LENGTH }));
      return;
    }
    if (nameRaw.length > MAX_NAME_LENGTH) {
      setError(t("nameTooLong"));
      return;
    }
    if (lastNameRaw.length > MAX_NAME_LENGTH) {
      setError(t("lastNameTooLong"));
      return;
    }
    if (specializationRaw.length > MAX_SPECIALIZATION_LENGTH) {
      setError(t("specializationTooLong"));
      return;
    }
    if (experienceRaw.length === 0) {
      setError(t("experienceRequired"));
      return;
    }
    const experienceYears = Number(experienceRaw);
    if (
      !Number.isInteger(experienceYears) ||
      experienceYears < 0 ||
      experienceYears > MAX_EXPERIENCE_YEARS
    ) {
      setError(t("experienceInvalid"));
      return;
    }
    if (selectedClassIds.length === 0) {
      setError(t("assignedClassesRequired"));
      return;
    }
    if (classOptions.length > 0) {
      const allowedClassIds = new Set(classOptions.map((option) => option.id));
      const hasInvalidClass = selectedClassIds.some((id) => !allowedClassIds.has(id));
      if (hasInvalidClass) {
        setError(t("assignedClassesInvalid"));
        return;
      }
    }
    const scheduleValidationFailed = scheduleRows.some((row) => {
      if (row.date.trim() === "" || row.time.trim() === "" || row.spots.trim() === "") {
        return true;
      }
      const spots = Number(row.spots);
      return (
        !isValidTime(row.time.trim()) ||
        !Number.isInteger(spots) ||
        spots < MIN_SCHEDULE_SPOTS
      );
    });
    if (scheduleValidationFailed) {
      setError(t("scheduleInvalid"));
      return;
    }
    if (photoFile === null) {
      setError(t("photoRequired"));
      return;
    }
    if (photoFile !== null && photoFile.size > MAX_PHOTO_BYTES) {
      setError(t("photoTooLarge"));
      return;
    }

    submitLockRef.current = true;
    setPending(true);
    try {
      const created = await apiFetch<CreateCoachApiResponse>("/coaches", {
        method: "POST",
        body: JSON.stringify({
          email: emailRaw.toLowerCase(),
          password,
          name: nameRaw,
          lastName: lastNameRaw,
          phone: phoneRaw,
          age: ageNum,
          birthday: birthdayIso,
          bio: bioRaw,
          specialization: specializationRaw,
          classType: classTypeRaw,
          experienceYears,
          assignedClassTypeIds: selectedClassIds,
          schedule: normalizeScheduleForApi(scheduleRows),
        }),
      });
      if (photoFile !== null) {
        const payload = await readFileAsBase64Payload(photoFile);
        await apiFetch<{ avatarUrl: string }>(
          `/coaches/${created.id}/photo-json`,
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
        );
        onPhotoSelected(null);
      }
      form.reset();
      setClassTypeValue("");
      setBirthdayValue("");
      setSelectedClassIds([]);
      setScheduleRows([createScheduleRow()]);
      onPhotoSelected(null);
      setError(null);
      if (onCreated !== undefined) {
        onCreated();
      } else {
        setSuccess(true);
        router.refresh();
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error && err.message.trim().length > 0) {
        setError(err.message);
      } else {
        setError(t("genericError"));
      }
    } finally {
      setPending(false);
      submitLockRef.current = false;
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={(ev) => {
        void onSubmit(ev);
      }}
      className="flex flex-col gap-5"
    >
      <section className="relative z-20 rounded-[24px] border border-white/60 bg-white/60 p-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-sage-800">
            Personal Information
          </h3>
          <p className="text-xs text-sage-500">Core account and identity details</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="ommm-label text-xs uppercase tracking-wide">
              {t("nameLabel")}
            </span>
            <input
              name="name"
              className="ommm-input"
              autoComplete="given-name"
              maxLength={MAX_NAME_LENGTH}
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="ommm-label text-xs uppercase tracking-wide">
              {t("lastNameLabel")}
            </span>
            <input
              name="lastName"
              className="ommm-input"
              autoComplete="family-name"
              maxLength={MAX_NAME_LENGTH}
              required
            />
          </label>
          <label className="flex flex-col gap-1 lg:col-span-2">
            <span className="ommm-label text-xs uppercase tracking-wide">
              {t("emailLabel")}
            </span>
            <input
              name="email"
              type="email"
              className="ommm-input"
              autoComplete="email"
              maxLength={MAX_EMAIL_LENGTH}
              required
            />
            <span className="text-xs text-sage-500">{t("emailHint")}</span>
          </label>
          <label className="flex flex-col gap-1">
            <span className="ommm-label text-xs uppercase tracking-wide">
              {t("phoneLabel")}
            </span>
            <input
              name="phone"
              type="tel"
              className="ommm-input"
              autoComplete="tel"
              maxLength={MAX_PHONE_CHARS}
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="ommm-label text-xs uppercase tracking-wide">
              {t("passwordLabel")}
            </span>
            <PasswordInput
              name="password"
              className="ommm-input"
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              maxLength={128}
              required
              showPasswordLabel={t("showPassword")}
              hidePasswordLabel={t("hidePassword")}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="ommm-label text-xs uppercase tracking-wide">
              {t("birthdayLabel")}
            </span>
          <input
              name="birthday"
            type="text"
            inputMode="numeric"
            autoComplete="bday"
            maxLength={10}
            className="ommm-input"
              value={birthdayValue}
              required
            placeholder="DD/MM/YYYY"
            onChange={(event) => {
              const nextValue = formatBirthdayInput(event.target.value);
              setBirthdayValue(nextValue);
              const iso = parseBirthdayDisplayToIso(nextValue);
              const age = iso === null ? null : calculateAgeFromBirthday(iso);
                if (age !== null) {
                  const ageInput = formRef.current?.elements.namedItem(
                    "age",
                  ) as HTMLInputElement | null;
                  if (ageInput !== null) {
                    ageInput.value = String(age);
                  }
                }
              }}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="ommm-label text-xs uppercase tracking-wide">
              {t("ageLabel")}
            </span>
            <input
              name="age"
              type="number"
              className="ommm-input"
              min={COACH_MIN_AGE}
              max={COACH_MAX_AGE}
              inputMode="numeric"
              required
            />
          </label>
        </div>
      </section>

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
            </span>
            <input
              name="specialization"
              className="ommm-input"
              maxLength={MAX_SPECIALIZATION_LENGTH}
              placeholder={t("specializationPlaceholder")}
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="ommm-label text-xs uppercase tracking-wide">
              {t("experienceLabel")}
            </span>
            <input
              name="experienceYears"
              type="number"
              className="ommm-input"
              min={0}
              max={MAX_EXPERIENCE_YEARS}
              inputMode="numeric"
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="ommm-label text-xs uppercase tracking-wide">
              {t("classTypeLabel")}
            </span>
            <ScheduleFilterDropdown
              name="classType"
              label={t("classTypePlaceholder")}
              ariaLabel={t("classTypeLabel")}
              value={classTypeValue}
              options={classTypeDropdownOptions}
              onChange={setClassTypeValue}
              disabled={pending}
              required
            />
          </label>
          <div className="flex flex-col gap-2">
            <span className="ommm-label text-xs uppercase tracking-wide">{t("photoLabel")}</span>
            <div className="rounded-2xl border border-sand-500/20 bg-white/80 p-3">
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
              </div>
              {photoPreview !== null ? (
                <div className="mt-3 overflow-hidden rounded-xl border border-white/70 bg-sage-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreview}
                    alt={t("photoPreviewAlt")}
                    className="h-44 w-full object-cover"
                  />
                </div>
              ) : (
                <p className="mt-2 text-xs text-sage-500">{t("photoHint")}</p>
              )}
            </div>
          </div>
          <label className="flex flex-col gap-1 lg:col-span-2">
            <span className="ommm-label text-xs uppercase tracking-wide">
              {t("bioLabel")}
            </span>
            <textarea
              name="bio"
              className="ommm-input min-h-[150px] resize-y"
              maxLength={MAX_BIO_LENGTH}
              required
            />
          </label>
        </div>
      </section>

      <section className="rounded-[24px] border border-white/60 bg-white/60 p-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-sage-800">
            Assigned Classes
          </h3>
          <p className="text-xs text-sage-500">Select class types coached by this person</p>
        </div>
        <div className="grid gap-2 rounded-2xl border border-sand-500/20 bg-white/80 p-3 sm:grid-cols-2 xl:grid-cols-3">
          {classOptions.map((option) => (
            <label
              key={option.id}
              className="inline-flex items-center gap-2 rounded-xl border border-white/70 bg-white/80 px-3 py-2 text-sm text-sage-700"
            >
              <input
                type="checkbox"
                checked={selectedClassIds.includes(option.id)}
                onChange={() => toggleClassSelection(option.id)}
                disabled={pending}
              />
              <span>{option.name}</span>
            </label>
          ))}
          {classOptions.length === 0 ? (
            <p className="text-sm text-sage-500">{t("assignedClassesEmpty")}</p>
          ) : null}
        </div>
      </section>

      <section className="rounded-[24px] border border-white/60 bg-white/60 p-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-sage-800">
            Schedule / Availability
          </h3>
          <OmmButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={addScheduleRow}
            disabled={pending}
          >
            {t("scheduleAddRow")}
          </OmmButton>
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border border-sand-500/20 bg-white/80 p-3">
          {scheduleRows.map((row, index) => (
            <div
              key={row.id}
              className="grid gap-2 rounded-xl border border-white/70 bg-white/85 p-2 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_130px_auto]"
            >
              <DatePickerInput
                name={`schedule-date-${index}`}
                ariaLabel={t("scheduleLabel")}
                placeholder={t("scheduleLabel")}
                value={row.date}
                onChange={(nextValue) => updateScheduleRow(row.id, "date", nextValue)}
                disabled={pending}
                required
              />
              <input
                type="time"
                className="ommm-input"
                value={row.time}
                onChange={(event) => updateScheduleRow(row.id, "time", event.target.value)}
                disabled={pending}
                required
              />
              <input
                type="number"
                min={MIN_SCHEDULE_SPOTS}
                className="ommm-input"
                value={row.spots}
                onChange={(event) => updateScheduleRow(row.id, "spots", event.target.value)}
                disabled={pending}
                required
              />
              <OmmButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeScheduleRow(row.id)}
                disabled={pending || scheduleRows.length <= 1}
              >
                {t("scheduleRemoveRow")}
              </OmmButton>
            </div>
          ))}
        </div>
      </section>

      {error !== null ? (
        <p className="app-alert-warn text-sm" role="alert">
          {error}
        </p>
      ) : null}
      {onCreated === undefined && success ? (
        <p className="rounded-xl border border-mint-200/80 bg-mint-50/90 px-3 py-2 text-sm text-sage-800 shadow-sm">
          {t("success")}
        </p>
      ) : null}
      <div className="-mx-5 mt-1 flex flex-wrap items-center justify-end gap-3 border-t border-white/60 bg-white/65 px-5 py-4 backdrop-blur-sm sm:-mx-7 sm:px-7">
        {onCancel !== undefined ? (
          <OmmButton
            type="button"
            variant="secondary"
            size="md"
            disabled={pending}
            onClick={onCancel}
          >
            {tPage("cancelButton")}
          </OmmButton>
        ) : null}
        <OmmButton type="submit" variant="primary" size="md" disabled={pending}>
          {pending ? t("submitting") : t("submit")}
        </OmmButton>
      </div>
    </form>
  );
}
