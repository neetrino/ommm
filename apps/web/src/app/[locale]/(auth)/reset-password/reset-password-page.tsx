"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FormErrorBanner } from "@/components/ui/form-validation";
import { OmmButton } from "@/components/ui/omm-button";
import { PasswordInput } from "@/components/ui/password-input";
import { useResetPasswordForm } from "./use-reset-password-form";

type ResetPasswordFieldProps = {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
};

function ResetPasswordField({ name, label, value, onChange, disabled }: ResetPasswordFieldProps) {
  const t = useTranslations("auth.resetPassword");
  return (
    <label className="flex flex-col gap-2">
      <span className="ommm-label">{label}</span>
      <PasswordInput
        required
        name={name}
        autoComplete="new-password"
        className="ommm-input"
        value={value}
        onChange={(ev) => onChange(ev.target.value)}
        showPasswordLabel={t("showPassword")}
        hidePasswordLabel={t("hidePassword")}
        disabled={disabled}
      />
    </label>
  );
}

export type ResetPasswordPageProps = {
  initialToken: string;
};

export function ResetPasswordPage({ initialToken }: ResetPasswordPageProps) {
  const t = useTranslations("auth.resetPassword");
  const token = initialToken.trim();
  const hasToken = token.length > 0;
  const form = useResetPasswordForm(token);
  const fieldsLocked = !hasToken || (form.busy && form.message !== null);
  const visibleError = hasToken ? form.error : t("missingToken");

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold tracking-tight text-sage-800">
        {t("title")}
      </h1>
      <p className="ommm-body-muted mt-2">{t("lead")}</p>

      <form onSubmit={form.onSubmit} className="mt-8 flex flex-col gap-4">
        <ResetPasswordField
          name="newPassword"
          label={t("password")}
          value={form.newPassword}
          onChange={form.setNewPassword}
          disabled={fieldsLocked}
        />
        <ResetPasswordField
          name="confirmPassword"
          label={t("confirmPassword")}
          value={form.confirmPassword}
          onChange={form.setConfirmPassword}
          disabled={fieldsLocked}
        />
        <OmmButton type="submit" variant="primary" disabled={form.busy || !hasToken}>
          {form.busy && form.message === null ? t("submitting") : t("submit")}
        </OmmButton>
      </form>

      {form.message ? (
        <p className="mt-4 text-sm text-sage-700" role="status">
          {form.message}
        </p>
      ) : null}
      {visibleError ? <FormErrorBanner message={visibleError} variant="inline" className="mt-4" /> : null}
      {!hasToken || form.requestFailed ? (
        <p className="ommm-body-muted mt-4 text-center text-sm">
          <Link href="/forgot-password" className="ommm-link-sage">
            {t("requestNewLink")}
          </Link>
        </p>
      ) : null}

      <p className="ommm-body-muted mt-8 text-center text-sm">
        <Link href="/login" className="ommm-link-sage">
          {t("backToLogin")}
        </Link>
      </p>
    </div>
  );
}
