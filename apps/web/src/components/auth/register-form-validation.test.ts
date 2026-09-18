import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  resolveRegisterWhatsappPhoneForApi,
  validateRegisterForm,
  type RegisterFormValues,
} from "./register-form-validation";

const labels: Record<string, string> = {
  firstNameRequired: "first-required",
  firstNameLatinOnly: "first-latin",
  lastNameRequired: "last-required",
  lastNameLatinOnly: "last-latin",
  firstNameTooLong: "first-long",
  lastNameTooLong: "last-long",
  phoneRequired: "phone-required",
  invalidEmail: "email-invalid",
  passwordRequired: "password-required",
  confirmPasswordRequired: "confirm-required",
  passwordMismatch: "password-mismatch",
  passwordTooShort: "password-short",
  invalidPhone: "phone-invalid",
  whatsappPhoneRequired: "whatsapp-required",
  invalidWhatsappPhone: "whatsapp-invalid",
};

function tAuth(key: string): string {
  return labels[key] ?? key;
}

function validValues(
  overrides: Partial<RegisterFormValues> = {},
): RegisterFormValues {
  return {
    firstName: "Emma",
    lastName: "Johnson",
    phone: "+374 99 123456",
    whatsappPhone: "",
    sameAsPhone: true,
    email: "emma@example.com",
    password: "password1",
    confirmPassword: "password1",
    ...overrides,
  };
}

describe("validateRegisterForm WhatsApp", () => {
  it("accepts the phone number when same-as-phone is checked", () => {
    const result = validateRegisterForm(
      validValues(),
      tAuth,
      () => true,
      () => true,
    );
    assert.deepEqual(result, { ok: true });
    assert.equal(
      resolveRegisterWhatsappPhoneForApi(validValues()),
      "+374 99 123456",
    );
  });

  it("requires a separate WhatsApp number when the checkbox is off", () => {
    const result = validateRegisterForm(
      validValues({ sameAsPhone: false, whatsappPhone: "" }),
      tAuth,
      () => true,
      () => true,
    );
    assert.deepEqual(result, {
      ok: false,
      kind: "form",
      message: "whatsapp-required",
    });
  });

  it("rejects an invalid separate WhatsApp number", () => {
    const result = validateRegisterForm(
      validValues({ sameAsPhone: false, whatsappPhone: "12" }),
      tAuth,
      () => true,
      (value) => value !== "12",
    );
    assert.deepEqual(result, {
      ok: false,
      kind: "form",
      message: "whatsapp-invalid",
    });
  });
});
