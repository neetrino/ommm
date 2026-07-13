"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminClientCredentialsHandover } from "@/components/admin/admin-client-credentials-handover";
import {
  isValidEmail,
  isValidPhone,
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "@/components/admin/admin-coach-form-helpers";
import type { ClientRow } from "@/components/admin/admin-clients-types";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { OmmButton } from "@/components/ui/omm-button";
import { PasswordInput } from "@/components/ui/password-input";
import { PhoneInputField } from "@/components/ui/phone-input-field";
import { ApiError, apiFetch } from "@/lib/api";
import { generateSecurePassword } from "@/lib/generate-secure-password";
import { normalizePhoneForApi } from "@/lib/phone";

type CreateClientApiResponse = {
  client: ClientRow;
  credentials: {
    email: string;
    temporaryPassword: string | null;
    passwordResetUrl: string | null;
  };
  welcomeEmailSent: boolean;
};

export type AdminCreateClientFormProps = {
  onCreated: (client: ClientRow) => void;
  onCancel?: () => void;
};

export function AdminCreateClientForm({ onCreated, onCancel }: AdminCreateClientFormProps) {
  const t = useTranslations("adminPages.clients.create");
  const tPage = useTranslations("adminPages.clients");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [phone, setPhone] = useState("");
  const [birthdayValue, setBirthdayValue] = useState("");
  const [password, setPassword] = useState("");
  const [autoGeneratePassword, setAutoGeneratePassword] = useState(false);
  const [forcePasswordReset, setForcePasswordReset] = useState(false);
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(false);
  const [handover, setHandover] = useState<CreateClientApiResponse | null>(null);
  const submitLockRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  function onGeneratePassword(): void {
    setAutoGeneratePassword(true);
    setPassword(generateSecurePassword());
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending || submitLockRef.current || handover !== null) {
      return;
    }

    const form = e.currentTarget;
    const fd = new FormData(form);
    const nameRaw = String(fd.get("name") ?? "").trim();
    const lastNameRaw = String(fd.get("lastName") ?? "").trim();
    const emailRaw = String(fd.get("email") ?? "").trim();
    const phoneRaw = phone.trim();
    const notesRaw = String(fd.get("notes") ?? "").trim();
    const passwordRaw = autoGeneratePassword ? "" : password.trim();

    setError(null);

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
    if (!autoGeneratePassword) {
      if (passwordRaw.length === 0) {
        setError(t("passwordRequired"));
        return;
      }
      if (passwordRaw.length < MIN_PASSWORD_LENGTH) {
        setError(t("passwordTooShort", { min: MIN_PASSWORD_LENGTH }));
        return;
      }
    }
    if (birthdayValue.trim().length > 0 && Number.isNaN(Date.parse(birthdayValue))) {
      setError(t("birthdayInvalid"));
      return;
    }

    submitLockRef.current = true;
    setPending(true);
    try {
      const response = await apiFetch<CreateClientApiResponse>("/clients", {
        method: "POST",
        body: JSON.stringify({
          email: emailRaw.toLowerCase(),
          name: nameRaw,
          lastName: lastNameRaw,
          phone: normalizePhoneForApi(phoneRaw),
          ...(birthdayValue.trim().length > 0 ? { dateOfBirth: birthdayValue.trim() } : {}),
          ...(autoGeneratePassword
            ? { autoGeneratePassword: true }
            : { password: passwordRaw }),
          forcePasswordResetOnFirstLogin: forcePasswordReset,
          sendWelcomeEmail,
          ...(notesRaw.length > 0 ? { notes: notesRaw } : {}),
        }),
      });
      form.reset();
      setPhone("");
      setBirthdayValue("");
      setPassword("");
      setAutoGeneratePassword(false);
      setForcePasswordReset(false);
      setSendWelcomeEmail(false);
      setHandover(response);
      onCreated(response.client);
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

  if (handover !== null) {
    return (
      <AdminClientCredentialsHandover
        email={handover.credentials.email}
        temporaryPassword={handover.credentials.temporaryPassword}
        passwordResetUrl={handover.credentials.passwordResetUrl}
        welcomeEmailSent={handover.welcomeEmailSent}
        onDone={() => {
          setHandover(null);
          onCancel?.();
        }}
      />
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={(ev) => {
        void onSubmit(ev);
      }}
      className="flex flex-col gap-5"
    >
      <section className="rounded-[24px] border border-white/60 bg-white/60 p-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md sm:p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-sage-800">
            {t("sectionPersonal")}
          </h3>
          <p className="mt-1 text-xs text-sage-500">{t("sectionPersonalLead")}</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="ommm-label text-xs uppercase tracking-wide">{t("nameLabel")}</span>
            <input
              name="name"
              className="ommm-input"
              autoComplete="given-name"
              maxLength={MAX_NAME_LENGTH}
              required
              disabled={pending}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="ommm-label text-xs uppercase tracking-wide">{t("lastNameLabel")}</span>
            <input
              name="lastName"
              className="ommm-input"
              autoComplete="family-name"
              maxLength={MAX_NAME_LENGTH}
              required
              disabled={pending}
            />
          </label>
          <label className="flex flex-col gap-1 lg:col-span-2">
            <span className="ommm-label text-xs uppercase tracking-wide">{t("emailLabel")}</span>
            <input
              name="email"
              type="email"
              className="ommm-input"
              autoComplete="email"
              maxLength={MAX_EMAIL_LENGTH}
              required
              disabled={pending}
            />
            <span className="text-xs text-sage-500">{t("emailHint")}</span>
          </label>
          <label className="flex flex-col gap-1">
            <span className="ommm-label text-xs uppercase tracking-wide">{t("phoneLabel")}</span>
            <PhoneInputField
              name="phone"
              className="ommm-input"
              value={phone}
              onValueChange={setPhone}
              required
              disabled={pending}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="ommm-label text-xs uppercase tracking-wide">{t("birthdayLabel")}</span>
            <DatePickerInput
              name="birthday"
              value={birthdayValue}
              onChange={setBirthdayValue}
              ariaLabel={t("birthdayLabel")}
              placeholder={tPage("birthdayPlaceholder")}
              allowManualEntry
              disabled={pending}
            />
            <span className="text-xs text-sage-500">{t("birthdayOptionalHint")}</span>
          </label>
        </div>
      </section>

      <section className="rounded-[24px] border border-white/60 bg-white/60 p-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md sm:p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-sage-800">
            {t("sectionAccess")}
          </h3>
          <p className="mt-1 text-xs text-sage-500">{t("sectionAccessLead")}</p>
        </div>
        <div className="grid gap-4">
          <div className="flex flex-col gap-2">
            <label className="flex flex-col gap-1">
              <span className="ommm-label text-xs uppercase tracking-wide">{t("passwordLabel")}</span>
              <PasswordInput
                name="password"
                className="ommm-input"
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                maxLength={128}
                value={password}
                onChange={(event) => {
                  setAutoGeneratePassword(false);
                  setPassword(event.target.value);
                }}
                required={!autoGeneratePassword}
                disabled={pending || autoGeneratePassword}
                showPasswordLabel={t("showPassword")}
                hidePasswordLabel={t("hidePassword")}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <OmmButton
                type="button"
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={onGeneratePassword}
              >
                {t("generatePassword")}
              </OmmButton>
              {autoGeneratePassword ? (
                <p className="text-xs text-sage-600">{t("autoGenerateHint")}</p>
              ) : null}
            </div>
          </div>
          <label className="flex items-start gap-3 text-sm text-sage-700">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-sage-300"
              checked={forcePasswordReset}
              onChange={(event) => setForcePasswordReset(event.target.checked)}
              disabled={pending}
            />
            <span>
              <span className="font-medium text-sage-900">{t("forceResetLabel")}</span>
              <span className="mt-0.5 block text-xs text-sage-500">{t("forceResetHint")}</span>
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm text-sage-700">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-sage-300"
              checked={sendWelcomeEmail}
              onChange={(event) => setSendWelcomeEmail(event.target.checked)}
              disabled={pending}
            />
            <span>
              <span className="font-medium text-sage-900">{t("welcomeEmailLabel")}</span>
              <span className="mt-0.5 block text-xs text-sage-500">{t("welcomeEmailHint")}</span>
            </span>
          </label>
        </div>
      </section>

      <section className="rounded-[24px] border border-white/60 bg-white/60 p-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md sm:p-5">
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("notesLabel")}</span>
          <textarea
            name="notes"
            className="ommm-input min-h-[100px] resize-y"
            maxLength={4000}
            disabled={pending}
            placeholder={t("notesPlaceholder")}
          />
          <span className="text-xs text-sage-500">{t("notesHint")}</span>
        </label>
      </section>

      {error !== null ? (
        <p className="app-alert-warn text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <div className="-mx-5 mt-1 flex flex-wrap items-center justify-end gap-3 border-t border-white/60 bg-white/65 px-5 py-4 backdrop-blur-sm sm:-mx-7 sm:px-7">
        {onCancel !== undefined ? (
          <OmmButton type="button" variant="secondary" size="md" disabled={pending} onClick={onCancel}>
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
