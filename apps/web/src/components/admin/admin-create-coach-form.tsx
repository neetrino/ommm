"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { OmmButton } from "@/components/ui/omm-button";
import { PasswordInput } from "@/components/ui/password-input";

const MIN_PASSWORD_LENGTH = 8;
const MAX_EMAIL_LENGTH = 254;
const MAX_NAME_LENGTH = 120;
const MIN_PHONE_DIGITS = 8;
const MAX_PHONE_DIGITS = 15;
const MAX_PHONE_CHARS = 32;
const COACH_MIN_AGE = 16;
const COACH_MAX_AGE = 100;
const MAX_SPECIALIZATION_LENGTH = 200;

function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_EMAIL_LENGTH) {
    return false;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

function countDigits(value: string): number {
  return (value.match(/\d/g) ?? []).length;
}

function isValidPhone(trimmed: string): boolean {
  if (trimmed.length < MIN_PHONE_DIGITS || trimmed.length > MAX_PHONE_CHARS) {
    return false;
  }
  const digits = countDigits(trimmed);
  return digits >= MIN_PHONE_DIGITS && digits <= MAX_PHONE_DIGITS;
}

type CreateCoachApiResponse = {
  id: string;
  user: {
    id: string;
    name: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
  };
};

export type AdminCreateCoachFormProps = {
  /** When set, successful create invokes this instead of inline success + refresh (parent handles refresh). */
  onCreated?: () => void;
  /** Optional Cancel (e.g. close modal); omit for standalone usage. */
  onCancel?: () => void;
};

export function AdminCreateCoachForm({
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

    submitLockRef.current = true;
    setPending(true);
    try {
      await apiFetch<CreateCoachApiResponse>("/coaches", {
        method: "POST",
        body: JSON.stringify({
          email: emailRaw.toLowerCase(),
          password,
          name: nameRaw,
          lastName: lastNameRaw,
          phone: phoneRaw,
          age: ageNum,
          specialization: specializationRaw,
        }),
      });
      form.reset();
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
