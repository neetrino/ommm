import { isLatinPersonName } from "@/lib/latin-person-name";
import type { RegisterNameField } from "@/components/auth/register-name-fields";

type TranslateAuth = (key: string, values?: Record<string, string | number>) => string;

const MIN_PASSWORD_LENGTH = 8;
const MAX_NAME_LENGTH = 120;

export { MIN_PASSWORD_LENGTH, MAX_NAME_LENGTH };

export type RegisterNameFieldError = {
  field: RegisterNameField;
  message: string;
};

export type RegisterFormValues = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type RegisterClientValidation =
  | { ok: true }
  | { ok: false; kind: "name"; field: RegisterNameField; message: string }
  | { ok: false; kind: "form"; message: string };

/** Client-side register checks — name errors stay on the field; others use the form banner. */
export function validateRegisterForm(
  values: RegisterFormValues,
  tAuth: TranslateAuth,
  isValidEmail: (value: string) => boolean,
  isValidPhone: (value: string) => boolean,
): RegisterClientValidation {
  const firstName = values.firstName.trim();
  const lastName = values.lastName.trim();
  const phone = values.phone.trim();

  if (firstName.length === 0) {
    return { ok: false, kind: "name", field: "firstName", message: tAuth("firstNameRequired") };
  }
  if (!isLatinPersonName(firstName)) {
    return { ok: false, kind: "name", field: "firstName", message: tAuth("firstNameLatinOnly") };
  }
  if (lastName.length === 0) {
    return { ok: false, kind: "name", field: "lastName", message: tAuth("lastNameRequired") };
  }
  if (!isLatinPersonName(lastName)) {
    return { ok: false, kind: "name", field: "lastName", message: tAuth("lastNameLatinOnly") };
  }
  if (firstName.length > MAX_NAME_LENGTH) {
    return { ok: false, kind: "name", field: "firstName", message: tAuth("firstNameTooLong") };
  }
  if (lastName.length > MAX_NAME_LENGTH) {
    return { ok: false, kind: "name", field: "lastName", message: tAuth("lastNameTooLong") };
  }
  if (phone.length === 0) {
    return { ok: false, kind: "form", message: tAuth("phoneRequired") };
  }
  if (!isValidEmail(values.email.trim())) {
    return { ok: false, kind: "form", message: tAuth("invalidEmail") };
  }
  if (values.password.length === 0) {
    return { ok: false, kind: "form", message: tAuth("passwordRequired") };
  }
  if (values.confirmPassword.length === 0) {
    return { ok: false, kind: "form", message: tAuth("confirmPasswordRequired") };
  }
  if (values.password !== values.confirmPassword) {
    return { ok: false, kind: "form", message: tAuth("passwordMismatch") };
  }
  if (values.password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      kind: "form",
      message: tAuth("passwordTooShort", { min: MIN_PASSWORD_LENGTH }),
    };
  }
  if (!isValidPhone(phone)) {
    return { ok: false, kind: "form", message: tAuth("invalidPhone") };
  }
  return { ok: true };
}

/** Latin-only check when leaving a name field (no required-empty noise on blur). */
export function latinNameFieldError(
  field: RegisterNameField,
  value: string,
  tAuth: TranslateAuth,
): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0 || isLatinPersonName(trimmed)) {
    return null;
  }
  return field === "firstName"
    ? tAuth("firstNameLatinOnly")
    : tAuth("lastNameLatinOnly");
}
