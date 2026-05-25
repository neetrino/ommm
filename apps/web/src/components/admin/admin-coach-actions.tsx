"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";
import { adminChrome } from "@/components/admin/admin-chrome";
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
  isValidTime,
  MAX_BIO_LENGTH,
  MAX_EXPERIENCE_YEARS,
  MAX_PHOTO_BYTES,
  MAX_PHONE_CHARS,
  MAX_SPECIALIZATION_LENGTH,
  MIN_SCHEDULE_SPOTS,
  normalizeScheduleForApi,
  readFileAsBase64Payload,
  sanitizeCoachPreviewSrc,
  type CoachClassOption,
  type CoachScheduleInput,
} from "@/components/admin/admin-coach-form-helpers";
import { OmmButton } from "@/components/ui/omm-button";
import { DatePickerInput } from "@/components/ui/date-picker-input";

type AdminCoachActionsProps = {
  coachId: string;
  classTypeOptions?: readonly string[];
  classOptions?: readonly CoachClassOption[];
  initialEmail?: string;
  initialName?: string;
  initialLastName?: string;
  initialPhone?: string;
  initialAge?: number | null;
  initialBirthday?: string | null;
  initialPhotoUrl?: string | null;
  initialExperienceYears?: number | null;
  initialAssignedClassTypeIds?: readonly string[];
  initialSchedule?: readonly { id: string; date: string; time: string; spots: number }[];
  initialSpecialization?: string;
  initialClassType?: string;
  initialBio?: string;
};

type FormState = {
  email: string;
  name: string;
  lastName: string;
  phone: string;
  age: string;
  birthday: string;
  photoUrl: string;
  bio: string;
  experienceYears: string;
  assignedClassTypeIds: string[];
  schedule: CoachScheduleInput[];
  specialization: string;
  classType: string;
};

type FormErrors = {
  email?: string;
  name?: string;
  lastName?: string;
  phone?: string;
  age?: string;
  birthday?: string;
  photo?: string;
  bio?: string;
  experienceYears?: string;
  assignedClassTypeIds?: string;
  schedule?: string;
  specialization?: string;
  classType?: string;
};

const EDIT_COACH_QUERY_KEY = "editCoach";
const MIN_PHONE_DIGITS = 8;
const MAX_PHONE_DIGITS = 15;

function PencilGlyph({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function CloseGlyph({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
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

function formatIsoBirthdayToDisplay(isoValue: string | null | undefined): string {
  if (isoValue === null || isoValue === undefined) {
    return "";
  }
  const trimmed = isoValue.trim();
  if (trimmed === "") {
    return "";
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed.slice(0, 10));
  if (match === null) {
    return "";
  }
  return `${match[3]}/${match[2]}/${match[1]}`;
}

export function AdminCoachActions({
  coachId,
  classTypeOptions = [],
  classOptions = [],
  initialEmail = "",
  initialName = "",
  initialLastName = "",
  initialPhone = "",
  initialAge = null,
  initialBirthday = null,
  initialPhotoUrl = null,
  initialExperienceYears = null,
  initialAssignedClassTypeIds = [],
  initialSchedule = [],
  initialSpecialization = "",
  initialClassType = "",
  initialBio = "",
}: AdminCoachActionsProps) {
  const t = useTranslations("adminPages.coaches");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<FormState>({
    email: initialEmail,
    name: initialName,
    lastName: initialLastName,
    phone: initialPhone,
    age: initialAge === null ? "" : String(initialAge),
    birthday: formatIsoBirthdayToDisplay(initialBirthday),
    photoUrl: initialPhotoUrl ?? "",
    bio: initialBio,
    experienceYears: initialExperienceYears === null ? "" : String(initialExperienceYears),
    assignedClassTypeIds: [...initialAssignedClassTypeIds],
    schedule:
      initialSchedule.length > 0
        ? initialSchedule.map((slot) => ({
            id: slot.id,
            date: slot.date.slice(0, 10),
            time: slot.time,
            spots: String(slot.spots),
          }))
        : [createScheduleRow()],
    specialization: initialSpecialization,
    classType: initialClassType,
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [busy, setBusy] = useState(false);
  const [inlineMessage, setInlineMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");
  const [isMounted, setIsMounted] = useState(false);
  const isOpen = searchParams.get(EDIT_COACH_QUERY_KEY) === coachId;
  const classTypeDropdownOptions: ScheduleFilterOption<string>[] = classTypeOptions.map(
    (value) => ({
      value,
      label: value,
    }),
  );
  const photoPreview = useMemo(() => {
    const localPreview =
      photoPreviewUrl !== null ? sanitizeCoachPreviewSrc(photoPreviewUrl) : null;
    if (localPreview !== null) {
      return localPreview;
    }
    const remote =
      form.photoUrl.trim() === ""
        ? null
        : sanitizeCoachPreviewSrc(
            resolveApiAssetUrl(form.photoUrl.trim()) ?? form.photoUrl.trim(),
          );
    return remote;
  }, [form.photoUrl, photoPreviewUrl]);

  const resetForm = useCallback(() => {
    setForm({
      email: initialEmail,
      name: initialName,
      lastName: initialLastName,
      phone: initialPhone,
      age: initialAge === null ? "" : String(initialAge),
      birthday: formatIsoBirthdayToDisplay(initialBirthday),
      photoUrl: initialPhotoUrl ?? "",
      bio: initialBio,
      experienceYears: initialExperienceYears === null ? "" : String(initialExperienceYears),
      assignedClassTypeIds: [...initialAssignedClassTypeIds],
      schedule:
        initialSchedule.length > 0
          ? initialSchedule.map((slot) => ({
              id: slot.id,
              date: slot.date.slice(0, 10),
              time: slot.time,
              spots: String(slot.spots),
            }))
          : [createScheduleRow()],
      specialization: initialSpecialization,
      classType: initialClassType,
    });
    if (photoPreviewUrl !== null) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
    setPhotoPreviewUrl(null);
    setPhotoFile(null);
    setPhotoRemoved(false);
    setErrors({});
  }, [
    initialAge,
    initialAssignedClassTypeIds,
    initialBirthday,
    initialBio,
    initialEmail,
    initialExperienceYears,
    initialLastName,
    initialName,
    initialPhotoUrl,
    initialPhone,
    initialSchedule,
    initialSpecialization,
    initialClassType,
    photoPreviewUrl,
  ]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function onPhotoSelected(file: File | null): void {
    if (photoPreviewUrl !== null) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
    setPhotoFile(file);
    setPhotoPreviewUrl(file !== null ? URL.createObjectURL(file) : null);
    if (file !== null) {
      setPhotoRemoved(false);
    }
    setErrors((prev) => ({ ...prev, photo: undefined }));
  }

  function onPhotoDeleted(): void {
    if (photoPreviewUrl !== null) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
    setPhotoPreviewUrl(null);
    setPhotoFile(null);
    setPhotoRemoved(true);
    updateField("photoUrl", "");
    setErrors((prev) => ({ ...prev, photo: undefined }));
  }

  function toggleClassSelection(classTypeId: string): void {
    setForm((prev) => ({
      ...prev,
      assignedClassTypeIds: prev.assignedClassTypeIds.includes(classTypeId)
        ? prev.assignedClassTypeIds.filter((value) => value !== classTypeId)
        : [...prev.assignedClassTypeIds, classTypeId],
    }));
    setErrors((prev) => ({ ...prev, assignedClassTypeIds: undefined }));
  }

  function updateSchedule(
    rowId: string,
    key: keyof Omit<CoachScheduleInput, "id">,
    value: string,
  ): void {
    setForm((prev) => ({
      ...prev,
      schedule: prev.schedule.map((row) =>
        row.id === rowId ? { ...row, [key]: value } : row,
      ),
    }));
    setErrors((prev) => ({ ...prev, schedule: undefined }));
  }

  function addScheduleRow(): void {
    setForm((prev) => ({ ...prev, schedule: [...prev.schedule, createScheduleRow()] }));
  }

  function removeScheduleRow(rowId: string): void {
    setForm((prev) => ({
      ...prev,
      schedule:
        prev.schedule.length <= 1
          ? prev.schedule
          : prev.schedule.filter((row) => row.id !== rowId),
    }));
  }

  function openModal() {
    const params = new URLSearchParams(searchParams.toString());
    params.set(EDIT_COACH_QUERY_KEY, coachId);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
    setInlineMessage(null);
    resetForm();
  }

  const closeModal = useCallback(() => {
    if (busy) {
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.delete(EDIT_COACH_QUERY_KEY);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
    setErrors({});
  }, [busy, pathname, router, searchParams]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeModal();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [closeModal, isOpen]);

  useEffect(() => {
    if (!isOpen || panelRef.current === null) {
      return;
    }
    const input = panelRef.current.querySelector<HTMLInputElement>(
      'input[name="email"]',
    );
    input?.focus();
  }, [isOpen]);

  async function run(action: () => Promise<void>, okLabel: string) {
    if (busy) {
      return;
    }
    setBusy(true);
    setInlineMessage(null);
    try {
      await action();
      setTone("ok");
      setInlineMessage(okLabel);
      closeModal();
      router.refresh();
    } catch (error) {
      setTone("err");
      setInlineMessage(error instanceof ApiError ? error.message : t("genericError"));
    } finally {
      setBusy(false);
    }
  }

  async function onSave() {
    const email = form.email.trim().toLowerCase();
    const name = form.name.trim();
    const lastName = form.lastName.trim();
    const phone = form.phone.trim();
    const age = Number(form.age.trim());
    const birthdayDisplay = form.birthday.trim();
    const birthday = parseBirthdayDisplayToIso(birthdayDisplay);
    const bio = form.bio.trim();
    const experienceYears = Number(form.experienceYears.trim());
    const specialization = form.specialization.trim();
    const classType = form.classType.trim();
    const assignedClassTypeIds = form.assignedClassTypeIds;
    const nextErrors: FormErrors = {};
    if (email === "") {
      nextErrors.email = t("emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = t("emailInvalid");
    }
    if (name.length === 0) {
      nextErrors.name = t("nameRequired");
    }
    if (lastName.length === 0) {
      nextErrors.lastName = t("lastNameRequired");
    }
    const phoneDigits = phone.replace(/\D/g, "").length;
    if (phone.length === 0) {
      nextErrors.phone = t("phoneRequired");
    } else if (phoneDigits < MIN_PHONE_DIGITS || phoneDigits > MAX_PHONE_DIGITS) {
      nextErrors.phone = t("phoneInvalid");
    }
    if (
      form.age.trim().length === 0 ||
      !Number.isInteger(age) ||
      age < COACH_MIN_AGE ||
      age > COACH_MAX_AGE
    ) {
      nextErrors.age = t("ageInvalid", { min: COACH_MIN_AGE, max: COACH_MAX_AGE });
    }
    if (birthdayDisplay === "") {
      nextErrors.birthday = t("birthdayRequired");
    } else {
      const derivedAge =
        birthday === null ? null : calculateAgeFromBirthday(birthday);
      if (birthday === null || derivedAge === null) {
        nextErrors.birthday = t("birthdayInvalid");
      } else if (Math.abs(derivedAge - age) > 1) {
        nextErrors.birthday = t("ageBirthdayMismatch");
      }
    }
    if (bio.length === 0) {
      nextErrors.bio = t("bioRequired");
    } else if (bio.length > MAX_BIO_LENGTH) {
      nextErrors.bio = t("bioTooLong");
    }
    if (
      form.experienceYears.trim().length === 0 ||
      !Number.isInteger(experienceYears) ||
      experienceYears < 0 ||
      experienceYears > MAX_EXPERIENCE_YEARS
    ) {
      nextErrors.experienceYears = t("experienceInvalid");
    }
    if (specialization.length === 0) {
      nextErrors.specialization = t("specializationRequired");
    } else if (specialization.length > MAX_SPECIALIZATION_LENGTH) {
      nextErrors.specialization = t("specializationTooLong");
    }
    if (classType.length === 0) {
      nextErrors.classType = t("classTypeRequired");
    } else if (
      classTypeOptions.length > 0 &&
      !classTypeOptions.includes(classType)
    ) {
      nextErrors.classType = t("classTypeInvalid");
    }
    if (assignedClassTypeIds.length === 0) {
      nextErrors.assignedClassTypeIds = t("assignedClassesRequired");
    } else if (classOptions.length > 0) {
      const allowedClassIds = new Set(classOptions.map((option) => option.id));
      if (assignedClassTypeIds.some((id) => !allowedClassIds.has(id))) {
        nextErrors.assignedClassTypeIds = t("assignedClassesInvalid");
      }
    }
    if (photoFile !== null && photoFile.size > MAX_PHOTO_BYTES) {
      nextErrors.photo = t("photoTooLarge");
    }
    const scheduleInvalid = form.schedule.some((row) => {
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
    if (scheduleInvalid) {
      nextErrors.schedule = t("scheduleInvalid");
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    const birthdayIso = birthday === null ? "" : birthday;

    await run(
      async () => {
        await apiFetch(`/coaches/${coachId}`, {
          method: "PATCH",
          body: JSON.stringify({
            email,
            name,
            lastName,
            phone,
            age,
            birthday: birthdayIso,
            bio,
            specialization,
            classType,
            experienceYears,
            assignedClassTypeIds,
            schedule: normalizeScheduleForApi(form.schedule),
            ...(photoRemoved ? { photoUrl: "" } : {}),
          }),
        });
        if (photoFile !== null) {
          const payload = await readFileAsBase64Payload(photoFile);
          const uploaded = await apiFetch<{ avatarUrl: string }>(
            `/coaches/${coachId}/photo-json`,
            {
              method: "POST",
              body: JSON.stringify(payload),
            },
          );
          updateField("photoUrl", uploaded.avatarUrl);
          onPhotoSelected(null);
        }
      },
      t("updateSuccess"),
    );
  }

  return (
    <>
      <div className="flex items-center justify-center">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/70 text-sage-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-sage-900 active:scale-95 active:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50"
          aria-label={t("editCoach")}
          title={t("editCoach")}
          onClick={openModal}
        >
          <PencilGlyph className="h-4 w-4" />
        </button>
      </div>

      {inlineMessage ? (
        <div
          role="status"
          className={`fixed bottom-4 right-4 max-w-sm rounded-xl border px-4 py-3 text-sm shadow-[0_12px_32px_-20px_rgba(45,40,35,0.4)] backdrop-blur-md ${
            tone === "ok"
              ? "border-mint-200/80 bg-mint-50/95 text-sage-900"
              : "border-red-200/80 bg-red-50/95 text-red-900"
          }`}
        >
          {inlineMessage}
        </div>
      ) : null}

      {isOpen && isMounted
        ? createPortal(
            <div
              className="fixed inset-0 flex items-end justify-center p-0 sm:items-center sm:p-4"
              role="presentation"
            >
              <button
                type="button"
                className="absolute inset-0 bg-sage-950/45 backdrop-blur-[2px] transition-opacity"
                aria-label={t("modalBackdropClose")}
                onClick={closeModal}
              />
              <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descId}
                className="relative mt-auto max-h-[min(92vh,840px)] w-full max-w-[min(940px,95vw)] overflow-y-auto rounded-t-[28px] border border-white/60 bg-white/80 p-5 shadow-[0_24px_60px_-28px_rgba(45,40,35,0.35)] backdrop-blur-md sm:mt-0 sm:rounded-[24px] sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 id={titleId} className={adminChrome.panelHeading}>
                      {t("editModalTitle")}
                    </h2>
                    <p id={descId} className="ommm-body-muted mt-1 text-sm">
                      {t("editModalDescription")}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 rounded-full p-2 text-sage-500 transition-colors hover:bg-white/60 hover:text-sage-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                    aria-label={t("modalCloseAria")}
                    onClick={closeModal}
                    disabled={busy}
                  >
                    <CloseGlyph className="h-5 w-5" />
                  </button>
                </div>

                <form
                  className="mt-5 flex flex-col gap-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void onSave();
                  }}
                >
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-sage-700" htmlFor={`email-${coachId}`}>
                      {t("fieldEmail")}
                    </label>
                    <input
                      id={`email-${coachId}`}
                      name="email"
                      type="email"
                      autoComplete="email"
                      className="app-input border-sand-500/25 bg-white/90 text-sage-900 placeholder:text-sage-400"
                      value={form.email}
                      onChange={(event) => updateField("email", event.target.value)}
                      disabled={busy}
                    />
                    {errors.email ? <p className="text-xs text-red-800">{errors.email}</p> : null}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label
                        className="text-sm font-medium text-sage-700"
                        htmlFor={`name-${coachId}`}
                      >
                        {t("fieldName")}
                      </label>
                      <input
                        id={`name-${coachId}`}
                        type="text"
                        autoComplete="given-name"
                        className="app-input border-sand-500/25 bg-white/90 text-sage-900 placeholder:text-sage-400"
                        value={form.name}
                        onChange={(event) => updateField("name", event.target.value)}
                        disabled={busy}
                      />
                      {errors.name ? <p className="text-xs text-red-800">{errors.name}</p> : null}
                    </div>
                    <div className="space-y-1">
                      <label
                        className="text-sm font-medium text-sage-700"
                        htmlFor={`last-name-${coachId}`}
                      >
                        {t("fieldLastName")}
                      </label>
                      <input
                        id={`last-name-${coachId}`}
                        type="text"
                        autoComplete="family-name"
                        className="app-input border-sand-500/25 bg-white/90 text-sage-900 placeholder:text-sage-400"
                        value={form.lastName}
                        onChange={(event) => updateField("lastName", event.target.value)}
                        disabled={busy}
                      />
                      {errors.lastName ? (
                        <p className="text-xs text-red-800">{errors.lastName}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-sage-700" htmlFor={`phone-${coachId}`}>
                        {t("fieldPhone")}
                      </label>
                      <input
                        id={`phone-${coachId}`}
                        type="tel"
                        autoComplete="tel"
                        className="app-input border-sand-500/25 bg-white/90 text-sage-900 placeholder:text-sage-400"
                        value={form.phone}
                        onChange={(event) => updateField("phone", event.target.value)}
                        maxLength={MAX_PHONE_CHARS}
                        disabled={busy}
                      />
                      {errors.phone ? <p className="text-xs text-red-800">{errors.phone}</p> : null}
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-sage-700" htmlFor={`age-${coachId}`}>
                        {t("fieldAge")}
                      </label>
                      <input
                        id={`age-${coachId}`}
                        type="number"
                        min={COACH_MIN_AGE}
                        max={COACH_MAX_AGE}
                        inputMode="numeric"
                        className="app-input border-sand-500/25 bg-white/90 text-sage-900 placeholder:text-sage-400"
                        value={form.age}
                        onChange={(event) => updateField("age", event.target.value)}
                        disabled={busy}
                      />
                      {errors.age ? <p className="text-xs text-red-800">{errors.age}</p> : null}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label
                        className="text-sm font-medium text-sage-700"
                        htmlFor={`birthday-${coachId}`}
                      >
                        {t("fieldBirthday")}
                      </label>
                      <input
                        id={`birthday-${coachId}`}
                        name="birthdayDisplay"
                        type="text"
                        inputMode="numeric"
                        autoComplete="bday"
                        maxLength={10}
                        className="app-input border-sand-500/25 bg-white/90 text-sage-900 placeholder:text-sage-400"
                        value={form.birthday}
                        placeholder="DD/MM/YYYY"
                        onChange={(event) => {
                          const nextValue = formatBirthdayInput(event.target.value);
                          updateField("birthday", nextValue);
                          const iso = parseBirthdayDisplayToIso(nextValue);
                          const derivedAge =
                            iso === null ? null : calculateAgeFromBirthday(iso);
                          if (derivedAge !== null) {
                            updateField("age", String(derivedAge));
                          }
                        }}
                        disabled={busy}
                      />
                      {errors.birthday ? (
                        <p className="text-xs text-red-800">{errors.birthday}</p>
                      ) : null}
                    </div>
                    <div className="space-y-1">
                      <label
                        className="text-sm font-medium text-sage-700"
                        htmlFor={`experience-${coachId}`}
                      >
                        {t("fieldExperience")}
                      </label>
                      <input
                        id={`experience-${coachId}`}
                        type="number"
                        min={0}
                        max={MAX_EXPERIENCE_YEARS}
                        className="app-input border-sand-500/25 bg-white/90 text-sage-900 placeholder:text-sage-400"
                        value={form.experienceYears}
                        onChange={(event) =>
                          updateField("experienceYears", event.target.value)
                        }
                        disabled={busy}
                      />
                      {errors.experienceYears ? (
                        <p className="text-xs text-red-800">{errors.experienceYears}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-sage-700" htmlFor={`bio-${coachId}`}>
                      {t("fieldBio")}
                    </label>
                    <textarea
                      id={`bio-${coachId}`}
                      className="app-input min-h-[110px] resize-y border-sand-500/25 bg-white/90 text-sage-900 placeholder:text-sage-400"
                      value={form.bio}
                      maxLength={MAX_BIO_LENGTH}
                      onChange={(event) => updateField("bio", event.target.value)}
                      disabled={busy}
                    />
                    {errors.bio ? <p className="text-xs text-red-800">{errors.bio}</p> : null}
                  </div>
                  <div className="space-y-1">
                    <label
                      className="text-sm font-medium text-sage-700"
                      htmlFor={`specialization-${coachId}`}
                    >
                      {t("fieldSpecialization")}
                    </label>
                    <input
                      id={`specialization-${coachId}`}
                      type="text"
                      className="app-input border-sand-500/25 bg-white/90 text-sage-900 placeholder:text-sage-400"
                      value={form.specialization}
                      maxLength={MAX_SPECIALIZATION_LENGTH}
                      onChange={(event) =>
                        updateField("specialization", event.target.value)
                      }
                      placeholder={t("fieldSpecializationPlaceholder")}
                      disabled={busy}
                    />
                    {errors.specialization ? (
                      <p className="text-xs text-red-800">{errors.specialization}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-sage-700">{t("fieldAssignedClasses")}</p>
                    <div className="grid gap-2 rounded-xl border border-sand-500/20 bg-white/70 p-3 sm:grid-cols-2">
                      {classOptions.map((option) => (
                        <label
                          key={option.id}
                          className="inline-flex items-center gap-2 text-sm text-sage-700"
                        >
                          <input
                            type="checkbox"
                            checked={form.assignedClassTypeIds.includes(option.id)}
                            onChange={() => toggleClassSelection(option.id)}
                            disabled={busy}
                          />
                          <span>{option.name}</span>
                        </label>
                      ))}
                      {classOptions.length === 0 ? (
                        <p className="text-sm text-sage-500">{t("fieldAssignedClassesEmpty")}</p>
                      ) : null}
                    </div>
                    {errors.assignedClassTypeIds ? (
                      <p className="text-xs text-red-800">{errors.assignedClassTypeIds}</p>
                    ) : null}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-sage-700">{t("fieldClassType")}</p>
                    <ScheduleFilterDropdown
                      label={t("fieldClassTypePlaceholder")}
                      ariaLabel={t("fieldClassType")}
                      value={form.classType}
                      options={classTypeDropdownOptions}
                      onChange={(value) => updateField("classType", value)}
                      disabled={busy}
                    />
                    {errors.classType ? (
                      <p className="text-xs text-red-800">{errors.classType}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-sage-700">{t("fieldSchedule")}</p>
                      <OmmButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 rounded-xl px-3 text-xs"
                        onClick={addScheduleRow}
                        disabled={busy}
                      >
                        {t("fieldScheduleAdd")}
                      </OmmButton>
                    </div>
                    <div className="space-y-2 rounded-xl border border-sand-500/20 bg-white/70 p-3">
                      {form.schedule.map((slot, index) => (
                        <div
                          key={slot.id}
                          className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_112px_auto]"
                        >
                          <DatePickerInput
                            name={`slot-date-${index}`}
                            ariaLabel={t("fieldSchedule")}
                            placeholder={t("fieldSchedule")}
                            value={slot.date}
                            onChange={(nextValue) => updateSchedule(slot.id, "date", nextValue)}
                            disabled={busy}
                          />
                          <input
                            type="time"
                            className="app-input border-sand-500/25 bg-white/90 text-sage-900"
                            value={slot.time}
                            onChange={(event) =>
                              updateSchedule(slot.id, "time", event.target.value)
                            }
                            disabled={busy}
                          />
                          <input
                            type="number"
                            min={MIN_SCHEDULE_SPOTS}
                            className="app-input border-sand-500/25 bg-white/90 text-sage-900"
                            value={slot.spots}
                            onChange={(event) =>
                              updateSchedule(slot.id, "spots", event.target.value)
                            }
                            disabled={busy}
                          />
                          <OmmButton
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-10 rounded-xl px-3 text-xs"
                            onClick={() => removeScheduleRow(slot.id)}
                            disabled={busy || form.schedule.length <= 1}
                          >
                            {t("fieldScheduleRemove")}
                          </OmmButton>
                        </div>
                      ))}
                    </div>
                    {errors.schedule ? <p className="text-xs text-red-800">{errors.schedule}</p> : null}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-sage-700">{t("fieldPhoto")}</p>
                    <div className="rounded-xl border border-sand-500/20 bg-white/70 p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="inline-flex cursor-pointer items-center rounded-xl border border-sand-500/30 px-3 py-2 text-xs text-sage-700 hover:bg-sand-50/60">
                          <input
                            type="file"
                            accept={ACCEPT_PHOTO}
                            className="sr-only"
                            disabled={busy}
                            onChange={(event) => {
                              const file = event.target.files?.[0] ?? null;
                              onPhotoSelected(file);
                            }}
                          />
                          {t("fieldPhotoChoose")}
                        </label>
                        {photoPreview !== null ? (
                          <OmmButton
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-9 rounded-xl px-3 text-xs"
                            onClick={onPhotoDeleted}
                            disabled={busy}
                          >
                            {t("fieldScheduleRemove")}
                          </OmmButton>
                        ) : null}
                      </div>
                      {photoPreview !== null ? (
                        <div className="mt-3 overflow-hidden rounded-xl border border-white/70 bg-sage-50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photoPreview}
                            alt={t("fieldPhotoPreviewAlt")}
                            className="h-40 w-full object-contain"
                          />
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-sage-500">{t("fieldPhotoHint")}</p>
                      )}
                    </div>
                    {errors.photo ? <p className="text-xs text-red-800">{errors.photo}</p> : null}
                  </div>

                  <div className="flex flex-wrap justify-end gap-3 pt-2">
                    <OmmButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-10 rounded-xl px-4 text-xs"
                      onClick={closeModal}
                      disabled={busy}
                    >
                      {t("cancelButton")}
                    </OmmButton>
                    <OmmButton
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="h-10 rounded-xl px-5 text-xs"
                      disabled={busy}
                    >
                      {busy ? t("savingButton") : t("saveButton")}
                    </OmmButton>
                  </div>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
