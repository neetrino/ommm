"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { AuthBackToHomeLink } from "@/components/auth/auth-back-to-home-link";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";
import { pickUiLocaleForUser, setUiLocaleCookie } from "@/lib/ui-locale-cookie";
import { homePathForRole } from "@/lib/role-home";

const MIN_PASSWORD_LENGTH = 8;
const MAX_EMAIL_LENGTH = 254;
const MAX_NAME_LENGTH = 120;
const MIN_PHONE_DIGITS = 8;
const MAX_PHONE_DIGITS = 15;
const MAX_PHONE_CHARS = 32;

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

export default function RegisterPage() {
  const router = useRouter();
  const urlLocale = useLocale();
  const t = useTranslations("common");
  const tAuth = useTranslations("auth.register");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const submitLockRef = useRef(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending || submitLockRef.current) {
      return;
    }
    const fd = new FormData(e.currentTarget);
    const emailRaw = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const firstNameRaw = String(fd.get("firstName") ?? "").trim();
    const lastNameRaw = String(fd.get("lastName") ?? "").trim();
    const phoneRaw = String(fd.get("phone") ?? "").trim();

    setError(null);

    if (firstNameRaw.length === 0) {
      setError(tAuth("firstNameRequired"));
      return;
    }
    if (lastNameRaw.length === 0) {
      setError(tAuth("lastNameRequired"));
      return;
    }
    if (phoneRaw.length === 0) {
      setError(tAuth("phoneRequired"));
      return;
    }
    if (!isValidEmail(emailRaw)) {
      setError(tAuth("invalidEmail"));
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(tAuth("passwordTooShort", { min: MIN_PASSWORD_LENGTH }));
      return;
    }
    if (firstNameRaw.length > MAX_NAME_LENGTH) {
      setError(tAuth("firstNameTooLong"));
      return;
    }
    if (lastNameRaw.length > MAX_NAME_LENGTH) {
      setError(tAuth("lastNameTooLong"));
      return;
    }
    if (!isValidPhone(phoneRaw)) {
      setError(tAuth("invalidPhone"));
      return;
    }

    submitLockRef.current = true;
    setPending(true);
    try {
      const { user } = await apiFetch<{ user: { role: string; locale: string } }>(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            email: emailRaw.toLowerCase(),
            password,
            name: firstNameRaw,
            lastName: lastNameRaw,
            phone: phoneRaw,
            locale: urlLocale,
          }),
        },
      );
      const nextLocale = pickUiLocaleForUser(user.locale, urlLocale);
      setUiLocaleCookie(nextLocale);
      router.push(homePathForRole(user.role), { locale: nextLocale });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : tAuth("registerFailed"));
    } finally {
      setPending(false);
      submitLockRef.current = false;
    }
  }

  return (
    <div>
      <AuthBackToHomeLink />
      <h1 className="font-serif text-2xl font-semibold tracking-tight text-sage-800">
        {t("register")}
      </h1>
      <p className="ommm-body-muted mt-2">{tAuth("lead")}</p>
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="ommm-label">{tAuth("firstName")}</span>
          <input
            name="firstName"
            required
            autoComplete="given-name"
            className="ommm-input"
            maxLength={MAX_NAME_LENGTH}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="ommm-label">{tAuth("lastName")}</span>
          <input
            name="lastName"
            required
            autoComplete="family-name"
            className="ommm-input"
            maxLength={MAX_NAME_LENGTH}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="ommm-label">{tAuth("phone")}</span>
          <input
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            className="ommm-input"
            maxLength={MAX_PHONE_CHARS}
            inputMode="tel"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="ommm-label">{tAuth("email")}</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="ommm-input"
            maxLength={MAX_EMAIL_LENGTH}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="ommm-label">{tAuth("password")}</span>
          <input
            name="password"
            type="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            maxLength={128}
            autoComplete="new-password"
            className="ommm-input"
          />
        </label>
        <p className="text-xs text-sage-500">{tAuth("passwordHint")}</p>
        <OmmButton type="submit" variant="primary" className="mt-2" disabled={pending}>
          {pending ? tAuth("creating") : tAuth("createAccount")}
        </OmmButton>
      </form>
      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <p className="ommm-body-muted mt-8 text-center text-sm">
        {tAuth("alreadyHavePrompt")}{" "}
        <Link href="/login" className="ommm-link-sage">
          {t("login")}
        </Link>
      </p>
    </div>
  );
}
