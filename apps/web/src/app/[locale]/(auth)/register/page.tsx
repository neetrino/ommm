"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { GoogleLogoIcon } from "@/components/ui/google-logo-icon";
import { FormErrorBanner, focusFormField } from "@/components/ui/form-validation";
import { OmmButton } from "@/components/ui/omm-button";
import { PasswordInput } from "@/components/ui/password-input";
import {
  isValidEmail,
  MAX_EMAIL_LENGTH,
} from "@/components/admin/admin-coach-form-helpers";
import {
  RegisterNameFields,
  type RegisterNameField,
} from "@/components/auth/register-name-fields";
import {
  latinNameFieldError,
  MAX_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  validateRegisterForm,
  type RegisterNameFieldError,
} from "@/components/auth/register-form-validation";
import { ApiError, apiFetch } from "@/lib/api";
import { prefetchMarketingHeaderAccount } from "@/lib/prefetch-marketing-header-account";
import { pickUiLocaleForUser, setUiLocaleCookie } from "@/lib/ui-locale-cookie";
import { resolveAuthDestination } from "@/lib/auth-redirect";
import { isValidPhone, normalizePhoneForApi } from "@/lib/phone";
import { PhoneInputField } from "@/components/ui/phone-input-field";
import { buildGoogleAuthStartUrl } from "@/lib/google-auth-start-url";
import {
  PSEUDO_EMAIL,
  PSEUDO_PASSWORD,
  PSEUDO_PHONE,
} from "@/lib/pseudo-form-placeholders";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlLocale = useLocale();
  const t = useTranslations("common");
  const tAuth = useTranslations("auth.register");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<RegisterNameFieldError | null>(null);
  const [pending, setPending] = useState(false);
  const submitLockRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const googleAuthUrl = buildGoogleAuthStartUrl();

  function showNameFieldError(field: RegisterNameField, message: string) {
    setError(null);
    setFieldError({ field, message });
    const form = formRef.current;
    if (form) {
      focusFormField(form, field);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending || submitLockRef.current) {
      return;
    }
    const form = e.currentTarget;
    const fd = new FormData(form);
    const firstNameRaw = String(fd.get("firstName") ?? "").trim();
    const lastNameRaw = String(fd.get("lastName") ?? "").trim();
    const emailRaw = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const confirmPassword = String(fd.get("confirmPassword") ?? "");

    setError(null);
    setFieldError(null);

    const check = validateRegisterForm(
      {
        firstName: firstNameRaw,
        lastName: lastNameRaw,
        phone,
        email: emailRaw,
        password,
        confirmPassword,
      },
      tAuth,
      isValidEmail,
      isValidPhone,
    );
    if (!check.ok) {
      if (check.kind === "name") {
        showNameFieldError(check.field, check.message);
      } else {
        setError(check.message);
      }
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
            phone: normalizePhoneForApi(phone.trim()),
            locale: urlLocale,
          }),
        },
      );
      const nextLocale = pickUiLocaleForUser(user.locale, urlLocale);
      setUiLocaleCookie(nextLocale);
      await prefetchMarketingHeaderAccount();
      router.push(resolveAuthDestination(user.role, searchParams), {
        locale: nextLocale,
      });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : tAuth("registerFailed");
      if (/latin letters/i.test(message)) {
        showNameFieldError("firstName", tAuth("firstNameLatinOnly"));
      } else {
        setFieldError(null);
        setError(message);
      }
    } finally {
      setPending(false);
      submitLockRef.current = false;
    }
  }

  return (
    <div className="relative">
      <div className="relative z-10">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-sage-800">
          {t("register")}
        </h1>
        <p className="ommm-body-muted mt-1.5 text-sm">{tAuth("lead")}</p>
      </div>
      <form
        ref={formRef}
        onSubmit={onSubmit}
        noValidate
        className="relative z-10 mt-5 flex flex-col gap-3"
      >
        <RegisterNameFields
          firstNameLabel={tAuth("firstName")}
          lastNameLabel={tAuth("lastName")}
          maxNameLength={MAX_NAME_LENGTH}
          errorField={fieldError?.field ?? null}
          errorMessage={fieldError?.message ?? null}
          onClearFieldError={(field) => {
            if (fieldError?.field === field) {
              setFieldError(null);
            }
          }}
          onValidateField={(field, value) => {
            const message = latinNameFieldError(field, value, tAuth);
            if (message === null) {
              if (fieldError?.field === field) {
                setFieldError(null);
              }
              return;
            }
            setError(null);
            setFieldError({ field, message });
          }}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="ommm-label">{tAuth("phone")}</span>
            <PhoneInputField
              name="phone"
              required
              className="ommm-input"
              value={phone}
              onValueChange={setPhone}
              placeholder={PSEUDO_PHONE}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="ommm-label">{tAuth("email")}</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="ommm-input"
              maxLength={MAX_EMAIL_LENGTH}
              placeholder={PSEUDO_EMAIL}
            />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="ommm-label">{tAuth("password")}</span>
            <PasswordInput
              name="password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              maxLength={128}
              autoComplete="new-password"
              className="ommm-input"
              placeholder={PSEUDO_PASSWORD}
              showPasswordLabel={tAuth("showPassword")}
              hidePasswordLabel={tAuth("hidePassword")}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="ommm-label">{tAuth("confirmPassword")}</span>
            <PasswordInput
              name="confirmPassword"
              required
              minLength={MIN_PASSWORD_LENGTH}
              maxLength={128}
              autoComplete="new-password"
              className="ommm-input"
              placeholder={PSEUDO_PASSWORD}
              showPasswordLabel={tAuth("showPassword")}
              hidePasswordLabel={tAuth("hidePassword")}
            />
          </label>
        </div>
        <p className="text-xs text-sage-500">{tAuth("passwordHint")}</p>
        <OmmButton
          type="submit"
          variant="primary"
          size="sm"
          className="mt-1 min-h-9 w-full"
          disabled={pending}
        >
          {pending ? tAuth("creating") : tAuth("createAccount")}
        </OmmButton>
        <OmmButton
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => window.location.assign(googleAuthUrl)}
          className="w-full gap-2.5 border border-sand-500/25 shadow-[0_8px_20px_-14px_rgba(45,40,35,0.45)] hover:border-sand-500/45 hover:bg-white hover:text-sage-900 hover:shadow-[0_10px_24px_-14px_rgba(45,40,35,0.55)] active:translate-y-px"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.12)]">
            <GoogleLogoIcon className="h-4 w-4" />
          </span>
          <span className="leading-none">{tAuth("continueWithGoogle")}</span>
        </OmmButton>
      </form>
      {error ? (
        <FormErrorBanner message={error} variant="inline" className="mt-4" />
      ) : null}
      <p className="ommm-body-muted mt-5 text-center text-sm">
        {tAuth("alreadyHavePrompt")}{" "}
        <Link
          href={
            searchParams.toString() !== ""
              ? `/login?${searchParams.toString()}`
              : "/login"
          }
          className="ommm-link-sage"
        >
          {t("login")}
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  const t = useTranslations("common");
  return (
    <Suspense fallback={<p className="text-sm text-sage-500">{t("loading")}</p>}>
      <RegisterForm />
    </Suspense>
  );
}
