"use client";

import { useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";
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
  const [photoUrlInput, setPhotoUrlInput] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const classTypeDropdownOptions: ScheduleFilterOption<string>[] = classTypeOptions.map(
    (value) => ({
      value,
      label: value,
    }),
  );
  const photoPreview = useMemo(() => {
    const objectPreview =
      photoPreviewUrl !== null ? sanitizeCoachPreviewSrc(photoPreviewUrl) : null;
    if (objectPreview !== null) {
      return objectPreview;
    }
    const remotePreview =
      photoUrlInput.trim() === ""
        ? null
        : sanitizeCoachPreviewSrc(
            resolveApiAssetUrl(photoUrlInput.trim()) ?? photoUrlInput.trim(),
          );
    return remotePreview;
  }, [photoPreviewUrl, photoUrlInput]);

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
    const photoUrlRaw = photoUrlInput.trim();
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
    const birthdayDate = new Date(birthdayRaw);
    if (Number.isNaN(birthdayDate.getTime())) {
      setError(t("birthdayInvalid"));
      return;
    }
    const derivedAge = calculateAgeFromBirthday(birthdayRaw);
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
    if (photoFile === null && photoUrlRaw === "") {
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
          birthday: birthdayRaw,
          photoUrl: photoUrlRaw.length > 0 ? photoUrlRaw : undefined,
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
        const uploadResult = await apiFetch<{ avatarUrl: string }>(
          `/coaches/${created.id}/photo-json`,
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
        );
        setPhotoUrlInput(uploadResult.avatarUrl);
      }
      form.reset();
      setClassTypeValue("");
      setBirthdayValue("");
      setSelectedClassIds([]);
      setScheduleRows([createScheduleRow()]);
      onPhotoSelected(null);
      setPhotoUrlInput("");
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
      className="flex flex-col gap-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
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
      </div>
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
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">
            {t("birthdayLabel")}
          </span>
          <input
            name="birthday"
            type="date"
            className="ommm-input"
            value={birthdayValue}
            required
            onChange={(event) => {
              setBirthdayValue(event.target.value);
              const age = calculateAgeFromBirthday(event.target.value);
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
      </div>
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
      <label className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">
          {t("bioLabel")}
        </span>
        <textarea
          name="bio"
          className="ommm-input min-h-[120px] resize-y"
          maxLength={MAX_BIO_LENGTH}
          required
        />
      </label>
      <div className="flex flex-col gap-2">
        <span className="ommm-label text-xs uppercase tracking-wide">
          {t("assignedClassesLabel")}
        </span>
        <div className="grid gap-2 rounded-2xl border border-sand-500/20 bg-white/70 p-3 sm:grid-cols-2">
          {classOptions.map((option) => (
            <label key={option.id} className="inline-flex items-center gap-2 text-sm text-sage-700">
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
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="ommm-label text-xs uppercase tracking-wide">
            {t("scheduleLabel")}
          </span>
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
        <div className="flex flex-col gap-3 rounded-2xl border border-sand-500/20 bg-white/70 p-3">
          {scheduleRows.map((row) => (
            <div key={row.id} className="grid gap-2 sm:grid-cols-[1fr_1fr_110px_auto]">
              <input
                type="date"
                className="ommm-input"
                value={row.date}
                onChange={(event) => updateScheduleRow(row.id, "date", event.target.value)}
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
      </div>
      <div className="flex flex-col gap-2">
        <span className="ommm-label text-xs uppercase tracking-wide">{t("photoLabel")}</span>
        <div className="rounded-2xl border border-sand-500/20 bg-white/70 p-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center rounded-xl border border-sand-500/30 px-3 py-2 text-sm text-sage-700 hover:bg-sand-50/70">
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
            <input
              name="photoUrl"
              className="ommm-input min-w-[220px] flex-1"
              placeholder={t("photoUrlPlaceholder")}
              value={photoUrlInput}
              onChange={(event) => setPhotoUrlInput(event.target.value)}
              disabled={pending}
            />
          </div>
          {photoPreview !== null ? (
            <div className="mt-3 overflow-hidden rounded-xl border border-white/70 bg-sage-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoPreview} alt={t("photoPreviewAlt")} className="h-40 w-full object-cover" />
            </div>
          ) : (
            <p className="mt-2 text-xs text-sage-500">{t("photoHint")}</p>
          )}
        </div>
      </div>
      <label className="flex flex-col gap-1">
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
      <div className="grid gap-4 sm:grid-cols-2">
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
      <div className="flex flex-wrap items-center gap-3">
        {onCancel !== undefined ? (
          <OmmButton
            type="button"
            variant="secondary"
            size="sm"
            disabled={pending}
            onClick={onCancel}
          >
            {tPage("cancelButton")}
          </OmmButton>
        ) : null}
        <OmmButton type="submit" variant="primary" size="sm" disabled={pending}>
          {pending ? t("submitting") : t("submit")}
        </OmmButton>
      </div>
    </form>
  );
}
