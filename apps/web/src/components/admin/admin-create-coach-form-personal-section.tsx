import type { RefObject } from "react";
import { formatBirthdayInput, parseBirthdayDisplayToIso } from "@/lib/date-display";
import {
  calculateAgeFromBirthday,
  COACH_MAX_AGE,
  COACH_MIN_AGE,
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "@/components/admin/admin-coach-form-helpers";
import {
  FormFieldErrorFor,
  formFieldInputClassFor,
} from "@/components/ui/form-validation";
import type { AdminCreateCoachFocusField } from "@/components/admin/admin-create-coach-form-focus";
import { PhoneInputField } from "@/components/ui/phone-input-field";
import { PasswordInput } from "@/components/ui/password-input";
import {
  PSEUDO_AGE,
  PSEUDO_BIRTHDAY,
  PSEUDO_EMAIL,
  PSEUDO_FIRST_NAME,
  PSEUDO_LAST_NAME,
  PSEUDO_PASSWORD,
  PSEUDO_PHONE,
} from "@/lib/pseudo-form-placeholders";
import { AdminRequiredMark } from "@/components/admin/admin-sheet-editable-field";

type AdminCreateCoachFormPersonalSectionProps = {
  formRef: RefObject<HTMLFormElement | null>;
  phone: string;
  onPhoneChange: (value: string) => void;
  birthdayValue: string;
  onBirthdayChange: (value: string) => void;
  errorField: AdminCreateCoachFocusField | null;
  errorMessage: string | null;
  t: (key: string) => string;
};

export function AdminCreateCoachFormPersonalSection({
  formRef,
  phone,
  onPhoneChange,
  birthdayValue,
  onBirthdayChange,
  errorField,
  errorMessage,
  t,
}: AdminCreateCoachFormPersonalSectionProps) {
  return (
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
            <AdminRequiredMark />
          </span>
          <input
            name="name"
            className={formFieldInputClassFor("name", errorField)}
            autoComplete="given-name"
            maxLength={MAX_NAME_LENGTH}
            placeholder={PSEUDO_FIRST_NAME}
            required
            aria-invalid={errorField === "name"}
          />
          <FormFieldErrorFor field="name" errorField={errorField} message={errorMessage} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">
            {t("lastNameLabel")}
            <AdminRequiredMark />
          </span>
          <input
            name="lastName"
            className={formFieldInputClassFor("lastName", errorField)}
            autoComplete="family-name"
            maxLength={MAX_NAME_LENGTH}
            placeholder={PSEUDO_LAST_NAME}
            required
            aria-invalid={errorField === "lastName"}
          />
          <FormFieldErrorFor field="lastName" errorField={errorField} message={errorMessage} />
        </label>
        <label className="flex flex-col gap-1 lg:col-span-2">
          <span className="ommm-label text-xs uppercase tracking-wide">
            {t("emailLabel")}
            <AdminRequiredMark />
          </span>
          <input
            name="email"
            type="email"
            className={formFieldInputClassFor("email", errorField)}
            autoComplete="email"
            maxLength={MAX_EMAIL_LENGTH}
            placeholder={PSEUDO_EMAIL}
            required
            aria-invalid={errorField === "email"}
          />
          <FormFieldErrorFor field="email" errorField={errorField} message={errorMessage} />
          {errorField !== "email" ? (
            <span className="text-xs text-sage-500">{t("emailHint")}</span>
          ) : null}
        </label>
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">
            {t("phoneLabel")}
            <AdminRequiredMark />
          </span>
          <PhoneInputField
            name="phone"
            className={formFieldInputClassFor("phone", errorField)}
            value={phone}
            onValueChange={onPhoneChange}
            placeholder={PSEUDO_PHONE}
            required
            aria-invalid={errorField === "phone"}
          />
          <FormFieldErrorFor field="phone" errorField={errorField} message={errorMessage} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">
            {t("passwordLabel")}
            <AdminRequiredMark />
          </span>
          <PasswordInput
            name="password"
            className={formFieldInputClassFor("password", errorField)}
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            maxLength={128}
            placeholder={PSEUDO_PASSWORD}
            required
            aria-invalid={errorField === "password"}
            showPasswordLabel={t("showPassword")}
            hidePasswordLabel={t("hidePassword")}
          />
          <FormFieldErrorFor field="password" errorField={errorField} message={errorMessage} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("birthdayLabel")}</span>
          <input
            name="birthday"
            type="text"
            inputMode="numeric"
            autoComplete="bday"
            maxLength={10}
            className={formFieldInputClassFor("birthday", errorField)}
            value={birthdayValue}
            placeholder={PSEUDO_BIRTHDAY}
            aria-invalid={errorField === "birthday"}
            onChange={(event) => {
              const nextValue = formatBirthdayInput(event.target.value);
              onBirthdayChange(nextValue);
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
          <FormFieldErrorFor field="birthday" errorField={errorField} message={errorMessage} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("ageLabel")}</span>
          <input
            name="age"
            type="number"
            className={formFieldInputClassFor("age", errorField)}
            min={COACH_MIN_AGE}
            max={COACH_MAX_AGE}
            inputMode="numeric"
            placeholder={PSEUDO_AGE}
            aria-invalid={errorField === "age"}
          />
          <FormFieldErrorFor field="age" errorField={errorField} message={errorMessage} />
        </label>
      </div>
    </section>
  );
}
