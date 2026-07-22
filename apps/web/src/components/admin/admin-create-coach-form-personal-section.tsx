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
import { PhoneInputField } from "@/components/ui/phone-input-field";
import { PasswordInput } from "@/components/ui/password-input";
import {
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
  t: (key: string) => string;
};

export function AdminCreateCoachFormPersonalSection({
  formRef,
  phone,
  onPhoneChange,
  birthdayValue,
  onBirthdayChange,
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
            className="ommm-input"
            autoComplete="given-name"
            maxLength={MAX_NAME_LENGTH}
            placeholder={PSEUDO_FIRST_NAME}
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">
            {t("lastNameLabel")}
            <AdminRequiredMark />
          </span>
          <input
            name="lastName"
            className="ommm-input"
            autoComplete="family-name"
            maxLength={MAX_NAME_LENGTH}
            placeholder={PSEUDO_LAST_NAME}
            required
          />
        </label>
        <label className="flex flex-col gap-1 lg:col-span-2">
          <span className="ommm-label text-xs uppercase tracking-wide">
            {t("emailLabel")}
            <AdminRequiredMark />
          </span>
          <input
            name="email"
            type="email"
            className="ommm-input"
            autoComplete="email"
            maxLength={MAX_EMAIL_LENGTH}
            placeholder={PSEUDO_EMAIL}
            required
          />
          <span className="text-xs text-sage-500">{t("emailHint")}</span>
        </label>
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">
            {t("phoneLabel")}
            <AdminRequiredMark />
          </span>
          <PhoneInputField
            name="phone"
            className="ommm-input"
            value={phone}
            onValueChange={onPhoneChange}
            placeholder={PSEUDO_PHONE}
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">
            {t("passwordLabel")}
            <AdminRequiredMark />
          </span>
          <PasswordInput
            name="password"
            className="ommm-input"
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            maxLength={128}
            placeholder={PSEUDO_PASSWORD}
            required
            showPasswordLabel={t("showPassword")}
            hidePasswordLabel={t("hidePassword")}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("birthdayLabel")}</span>
          <input
            name="birthday"
            type="text"
            inputMode="numeric"
            autoComplete="bday"
            maxLength={10}
            className="ommm-input"
            value={birthdayValue}
            placeholder={PSEUDO_BIRTHDAY}
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
        </label>
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("ageLabel")}</span>
          <input
            name="age"
            type="number"
            className="ommm-input"
            min={COACH_MIN_AGE}
            max={COACH_MAX_AGE}
            inputMode="numeric"
          />
        </label>
      </div>
    </section>
  );
}
