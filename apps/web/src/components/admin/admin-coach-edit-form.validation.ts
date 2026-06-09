import {
  calculateAgeFromBirthday,
  COACH_MAX_AGE,
  COACH_MIN_AGE,
  hasDuplicateScheduleRows,
  isValidTime,
  MAX_BIO_LENGTH,
  MAX_EXPERIENCE_YEARS,
  MAX_PHOTO_BYTES,
  MAX_SPECIALIZATION_LENGTH,
  MIN_SCHEDULE_SPOTS,
  normalizeScheduleForApi,
  filterKnownAssignedClassTypeIds,
  type CoachClassOption,
} from "@/components/admin/admin-coach-form-helpers";
import { parseBirthdayDisplayToIso } from "@/lib/date-display";
import {
  completeCoachScheduleRows,
  type CoachEditFormErrors,
  type CoachEditFormState,
  type CoachUpdatePayload,
} from "@/components/admin/admin-coach-edit-form.types";

const MIN_PHONE_DIGITS = 8;
const MAX_PHONE_DIGITS = 15;

type ValidateCoachFormArgs = {
  form: CoachEditFormState;
  photoFile: File | null;
  photoRemoved: boolean;
  classOptions: readonly CoachClassOption[];
  labels: {
    emailRequired: string;
    emailInvalid: string;
    phoneInvalid: string;
    ageInvalid: string;
    birthdayInvalid: string;
    ageBirthdayMismatch: string;
    bioTooLong: string;
    experienceInvalid: string;
    specializationTooLong: string;
    photoTooLarge: string;
    scheduleInvalid: string;
  };
};

export function validateCoachEditForm({
  form,
  photoFile,
  photoRemoved,
  classOptions,
  labels,
}: ValidateCoachFormArgs): { errors: CoachEditFormErrors; payload: CoachUpdatePayload | null } {
  const email = form.email.trim().toLowerCase();
  const name = form.name.trim();
  const lastName = form.lastName.trim();
  const phone = form.phone.trim();
  const ageRaw = form.age.trim();
  const age = ageRaw.length > 0 ? Number(ageRaw) : null;
  const birthdayDisplay = form.birthday.trim();
  const birthday = parseBirthdayDisplayToIso(birthdayDisplay);
  const bio = form.bio.trim();
  const experienceRaw = form.experienceYears.trim();
  const experienceYears = experienceRaw.length > 0 ? Number(experienceRaw) : null;
  const specialization = form.specialization.trim();
  const assignedClassTypeIds = filterKnownAssignedClassTypeIds(
    form.assignedClassTypeIds,
    classOptions,
  );
  const scheduleRows = completeCoachScheduleRows(form.schedule);
  const errors: CoachEditFormErrors = {};

  if (email === "") {
    errors.email = labels.emailRequired;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = labels.emailInvalid;
  }
  const phoneDigits = phone.replace(/\D/g, "").length;
  if (phone.length > 0 && (phoneDigits < MIN_PHONE_DIGITS || phoneDigits > MAX_PHONE_DIGITS)) {
    errors.phone = labels.phoneInvalid;
  }
  if (age !== null && (!Number.isInteger(age) || age < COACH_MIN_AGE || age > COACH_MAX_AGE)) {
    errors.age = labels.ageInvalid;
  }
  if (birthdayDisplay !== "") {
    const derivedAge = birthday === null ? null : calculateAgeFromBirthday(birthday);
    if (birthday === null || derivedAge === null) {
      errors.birthday = labels.birthdayInvalid;
    } else if (age !== null && Math.abs(derivedAge - age) > 1) {
      errors.birthday = labels.ageBirthdayMismatch;
    }
  }
  if (bio.length > MAX_BIO_LENGTH) {
    errors.bio = labels.bioTooLong;
  }
  if (
    experienceYears !== null &&
    (!Number.isInteger(experienceYears) ||
      experienceYears < 0 ||
      experienceYears > MAX_EXPERIENCE_YEARS)
  ) {
    errors.experienceYears = labels.experienceInvalid;
  }
  if (specialization.length > MAX_SPECIALIZATION_LENGTH) {
    errors.specialization = labels.specializationTooLong;
  }
  if (photoFile !== null && photoFile.size > MAX_PHOTO_BYTES) {
    errors.photo = labels.photoTooLarge;
  }
  const scheduleInvalid = scheduleRows.some((row) => {
    const spots = Number(row.spots);
    return !isValidTime(row.time.trim()) || !Number.isInteger(spots) || spots < MIN_SCHEDULE_SPOTS;
  });
  if (scheduleInvalid || hasDuplicateScheduleRows(scheduleRows)) {
    errors.schedule = labels.scheduleInvalid;
  }

  if (Object.keys(errors).length > 0) {
    return { errors, payload: null };
  }

  const payload: CoachUpdatePayload = {
    email,
    name: name.length > 0 ? name : null,
    lastName: lastName.length > 0 ? lastName : null,
    phone: phone.length > 0 ? phone : null,
    ...(age !== null ? { age } : {}),
    birthday: birthdayDisplay === "" ? null : birthday,
    bio: bio.length > 0 ? bio : null,
    specialization: specialization.length > 0 ? specialization : null,
    experienceYears,
    assignedClassTypeIds,
    schedule: normalizeScheduleForApi(scheduleRows),
    ...(photoRemoved ? { photoUrl: "" } : {}),
  };

  return { errors, payload };
}
