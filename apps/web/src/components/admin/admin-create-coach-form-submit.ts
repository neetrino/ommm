import type { MutableRefObject } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { revalidatePublicCoaches } from "@/lib/revalidate-public-coaches";
import { parseBirthdayDisplayToIso } from "@/lib/date-display";
import { normalizePhoneForApi } from "@/lib/phone";
import {
  calculateAgeFromBirthday,
  COACH_MAX_AGE,
  COACH_MIN_AGE,
  isValidEmail,
  isValidPhone,
  MAX_BIO_LENGTH,
  MAX_EXPERIENCE_YEARS,
  MAX_NAME_LENGTH,
  MAX_PHOTO_BYTES,
  MAX_SPECIALIZATION_LENGTH,
  MIN_PASSWORD_LENGTH,
  readFileAsBase64Payload,
  type CoachClassOption,
} from "@/components/admin/admin-coach-form-helpers";

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

export type AdminCreateCoachSubmitParams = {
  form: HTMLFormElement;
  phone: string;
  selectedClassIds: string[];
  classOptions: readonly CoachClassOption[];
  photoFile: File | null;
  pending: boolean;
  submitLockRef: MutableRefObject<boolean>;
  t: (key: string, values?: Record<string, string | number>) => string;
  onCreated?: () => void;
  onPhotoSelected: (file: File | null) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: boolean) => void;
  setPending: (pending: boolean) => void;
  setBirthdayValue: (value: string) => void;
  setSelectedClassIds: (ids: string[]) => void;
  refresh: () => void;
};

export async function submitAdminCreateCoachForm({
  form,
  phone,
  selectedClassIds,
  classOptions,
  photoFile,
  pending,
  submitLockRef,
  t,
  onCreated,
  onPhotoSelected,
  setError,
  setSuccess,
  setPending,
  setBirthdayValue,
  setSelectedClassIds,
  refresh,
}: AdminCreateCoachSubmitParams): Promise<void> {
  if (pending || submitLockRef.current) {
    return;
  }

  const fd = new FormData(form);
  const nameRaw = String(fd.get("name") ?? "").trim();
  const lastNameRaw = String(fd.get("lastName") ?? "").trim();
  const emailRaw = String(fd.get("email") ?? "").trim();
  const phoneRaw = phone.trim();
  const ageRaw = String(fd.get("age") ?? "").trim();
  const birthdayRaw = String(fd.get("birthday") ?? "").trim();
  const bioRaw = String(fd.get("bio") ?? "").trim();
  const experienceRaw = String(fd.get("experienceYears") ?? "").trim();
  const specializationRaw = String(fd.get("specialization") ?? "").trim();
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
  const ageNum = ageRaw.length > 0 ? Number(ageRaw) : undefined;
  if (
    ageNum !== undefined &&
    (!Number.isInteger(ageNum) || ageNum < COACH_MIN_AGE || ageNum > COACH_MAX_AGE)
  ) {
    setError(t("ageInvalid", { min: COACH_MIN_AGE, max: COACH_MAX_AGE }));
    return;
  }
  let birthdayIso: string | undefined;
  if (birthdayRaw.length > 0) {
    birthdayIso = parseBirthdayDisplayToIso(birthdayRaw) ?? undefined;
    if (birthdayIso === undefined) {
      setError(t("birthdayInvalid"));
      return;
    }
    const birthdayDate = new Date(birthdayIso);
    if (Number.isNaN(birthdayDate.getTime())) {
      setError(t("birthdayInvalid"));
      return;
    }
    const derivedAge = calculateAgeFromBirthday(birthdayIso);
    if (
      ageNum !== undefined &&
      (derivedAge === null || Math.abs(derivedAge - ageNum) > 1)
    ) {
      setError(t("ageBirthdayMismatch"));
      return;
    }
  }
  if (bioRaw.length > MAX_BIO_LENGTH) {
    setError(t("bioTooLong"));
    return;
  }
  if (specializationRaw.length === 0) {
    setError(t("specializationRequired"));
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
  let experienceYears: number | undefined;
  if (experienceRaw.length > 0) {
    experienceYears = Number(experienceRaw);
    if (
      !Number.isInteger(experienceYears) ||
      experienceYears < 0 ||
      experienceYears > MAX_EXPERIENCE_YEARS
    ) {
      setError(t("experienceInvalid"));
      return;
    }
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
  const primaryAssignedClass = classOptions.find(
    (option) => option.id === selectedClassIds[0],
  );
  const classTypeRaw = primaryAssignedClass?.name.trim() ?? "";
  if (classTypeRaw.length === 0) {
    setError(t("assignedClassesInvalid"));
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
        phone: normalizePhoneForApi(phoneRaw),
        ...(ageNum !== undefined ? { age: ageNum } : {}),
        ...(birthdayIso !== undefined ? { birthday: birthdayIso } : {}),
        ...(bioRaw.length > 0 ? { bio: bioRaw } : {}),
        specialization: specializationRaw,
        classType: classTypeRaw,
        ...(experienceYears !== undefined ? { experienceYears } : {}),
        assignedClassTypeIds: selectedClassIds,
      }),
    });
    if (photoFile !== null) {
      const payload = await readFileAsBase64Payload(photoFile);
      await apiFetch<{ avatarUrl: string }>(`/coaches/${created.id}/photo-json`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      onPhotoSelected(null);
    }
    form.reset();
    setBirthdayValue("");
    setSelectedClassIds([]);
    onPhotoSelected(null);
    setError(null);
    await revalidatePublicCoaches();
    if (onCreated !== undefined) {
      onCreated();
    } else {
      setSuccess(true);
      refresh();
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
