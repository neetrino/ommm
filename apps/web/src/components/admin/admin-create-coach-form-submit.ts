import type { MutableRefObject } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { revalidatePublicCoaches } from "@/lib/revalidate-public-coaches";
import { parseBirthdayDisplayToIso } from "@/lib/date-display";
import { normalizePhoneForApi } from "@/lib/phone";
import {
  focusAdminCreateCoachField,
  localizeAdminCreateCoachApiError,
  reportAdminCreateCoachFieldError,
  resolveAdminCreateCoachApiFocusField,
  type AdminCreateCoachFocusField,
} from "@/components/admin/admin-create-coach-form-focus";
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
  parseCoachSalaryPerClassAmd,
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
  setErrorField: (field: AdminCreateCoachFocusField | null) => void;
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
  setErrorField,
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
  const salaryRaw = String(fd.get("salaryPerClassAmd") ?? "").trim();
  const specializationRaw = String(fd.get("specialization") ?? "").trim();
  const password = String(fd.get("password") ?? "");

  setError(null);
  setErrorField(null);
  setSuccess(false);

  if (nameRaw.length === 0) {
    reportAdminCreateCoachFieldError(form, setError, setErrorField, t("nameRequired"), "name");
    return;
  }
  if (lastNameRaw.length === 0) {
    reportAdminCreateCoachFieldError(form, setError, setErrorField, t("lastNameRequired"), "lastName");
    return;
  }
  if (!isValidEmail(emailRaw)) {
    reportAdminCreateCoachFieldError(form, setError, setErrorField, t("emailInvalid"), "email");
    return;
  }
  if (phoneRaw.length === 0) {
    reportAdminCreateCoachFieldError(form, setError, setErrorField, t("phoneRequired"), "phone");
    return;
  }
  if (!isValidPhone(phoneRaw)) {
    reportAdminCreateCoachFieldError(form, setError, setErrorField, t("phoneInvalid"), "phone");
    return;
  }
  const ageNum = ageRaw.length > 0 ? Number(ageRaw) : undefined;
  if (
    ageNum !== undefined &&
    (!Number.isInteger(ageNum) || ageNum < COACH_MIN_AGE || ageNum > COACH_MAX_AGE)
  ) {
    reportAdminCreateCoachFieldError(
      form,
      setError,
      setErrorField,
      t("ageInvalid", { min: COACH_MIN_AGE, max: COACH_MAX_AGE }),
      "age",
    );
    return;
  }
  let birthdayIso: string | undefined;
  if (birthdayRaw.length > 0) {
    birthdayIso = parseBirthdayDisplayToIso(birthdayRaw) ?? undefined;
    if (birthdayIso === undefined) {
      reportAdminCreateCoachFieldError(form, setError, setErrorField, t("birthdayInvalid"), "birthday");
      return;
    }
    const birthdayDate = new Date(birthdayIso);
    if (Number.isNaN(birthdayDate.getTime())) {
      reportAdminCreateCoachFieldError(form, setError, setErrorField, t("birthdayInvalid"), "birthday");
      return;
    }
    const derivedAge = calculateAgeFromBirthday(birthdayIso);
    if (
      ageNum !== undefined &&
      (derivedAge === null || Math.abs(derivedAge - ageNum) > 1)
    ) {
      reportAdminCreateCoachFieldError(form, setError, setErrorField, t("ageBirthdayMismatch"), "birthday");
      return;
    }
  }
  if (bioRaw.length > MAX_BIO_LENGTH) {
    reportAdminCreateCoachFieldError(form, setError, setErrorField, t("bioTooLong"), "bio");
    return;
  }
  if (specializationRaw.length === 0) {
    reportAdminCreateCoachFieldError(form, setError, setErrorField, t("specializationRequired"), "specialization");
    return;
  }
  if (password.length === 0) {
    reportAdminCreateCoachFieldError(form, setError, setErrorField, t("passwordRequired"), "password");
    return;
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    reportAdminCreateCoachFieldError(
      form,
      setError,
      setErrorField,
      t("passwordTooShort", { min: MIN_PASSWORD_LENGTH }),
      "password",
    );
    return;
  }
  if (nameRaw.length > MAX_NAME_LENGTH) {
    reportAdminCreateCoachFieldError(form, setError, setErrorField, t("nameTooLong"), "name");
    return;
  }
  if (lastNameRaw.length > MAX_NAME_LENGTH) {
    reportAdminCreateCoachFieldError(form, setError, setErrorField, t("lastNameTooLong"), "lastName");
    return;
  }
  if (specializationRaw.length > MAX_SPECIALIZATION_LENGTH) {
    reportAdminCreateCoachFieldError(form, setError, setErrorField, t("specializationTooLong"), "specialization");
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
      reportAdminCreateCoachFieldError(form, setError, setErrorField, t("experienceInvalid"), "experienceYears");
      return;
    }
  }
  const salaryPerClassAmd = parseCoachSalaryPerClassAmd(salaryRaw);
  if (salaryPerClassAmd === null) {
    reportAdminCreateCoachFieldError(
      form,
      setError,
      setErrorField,
      t("salaryPerClassInvalid"),
      "salaryPerClassAmd",
    );
    return;
  }
  if (selectedClassIds.length === 0) {
    reportAdminCreateCoachFieldError(form, setError, setErrorField, t("assignedClassesRequired"), "assignedClasses");
    return;
  }
  if (classOptions.length > 0) {
    const allowedClassIds = new Set(classOptions.map((option) => option.id));
    const hasInvalidClass = selectedClassIds.some((id) => !allowedClassIds.has(id));
    if (hasInvalidClass) {
      reportAdminCreateCoachFieldError(form, setError, setErrorField, t("assignedClassesInvalid"), "assignedClasses");
      return;
    }
  }
  const primaryAssignedClass = classOptions.find(
    (option) => option.id === selectedClassIds[0],
  );
  const classTypeRaw = primaryAssignedClass?.name.trim() ?? "";
  if (classTypeRaw.length === 0) {
    reportAdminCreateCoachFieldError(form, setError, setErrorField, t("assignedClassesInvalid"), "assignedClasses");
    return;
  }
  if (photoFile !== null && photoFile.size > MAX_PHOTO_BYTES) {
    reportAdminCreateCoachFieldError(form, setError, setErrorField, t("photoTooLarge"), "photo");
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
        salaryPerClassAmd,
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
    setErrorField(null);
    await revalidatePublicCoaches();
    if (onCreated !== undefined) {
      onCreated();
    } else {
      setSuccess(true);
      refresh();
    }
  } catch (err) {
    let message = t("genericError");
    if (err instanceof ApiError) {
      message = localizeAdminCreateCoachApiError(err.message, t);
    } else if (err instanceof Error && err.message.trim().length > 0) {
      message = localizeAdminCreateCoachApiError(err.message, t);
    }
    setError(message);
    const apiField = resolveAdminCreateCoachApiFocusField(
      err instanceof ApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : message,
    );
    setErrorField(apiField);
    if (apiField !== null) {
      focusAdminCreateCoachField(form, apiField);
    }
  } finally {
    setPending(false);
    submitLockRef.current = false;
  }
}
