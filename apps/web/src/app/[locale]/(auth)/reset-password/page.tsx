"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { FormErrorBanner } from "@/components/ui/form-validation";
import { OmmButton } from "@/components/ui/omm-button";
import { PasswordInput } from "@/components/ui/password-input";

const PASSWORD_MIN_LENGTH = 8;
const POST_SUCCESS_REDIRECT_MS = 1200;

function ResetPasswordForm() {
  const router = useRouter();
  const t = useTranslations("auth.resetPassword");
  const search = useSearchParams();
  const token = search.get("token")?.trim() ?? "";
  const mode = search.get("mode");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "create" || token.length === 0) {
      return;
    }
    router.replace(`/create-password/${encodeURIComponent(token)}`);
  }, [mode, router, token]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) {
      return;
    }
    setMessage(null);
    setError(null);
    if (token.length === 0) {
      setError(t("missingToken"));
      return;
    }
    const password = newPassword.trim();
    const confirmation = confirmPassword.trim();
    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(t("passwordTooShort", { min: PASSWORD_MIN_LENGTH }));
      return;
    }
    if (password !== confirmation) {
      setError(t("mismatch"));
      return;
    }
    setBusy(true);
    try {
      await apiFetch<{ ok: boolean }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword: password }),
      });
      setMessage(t("success"));
      setNewPassword("");
      setConfirmPassword("");
      window.setTimeout(() => {
        router.push("/login");
      }, POST_SUCCESS_REDIRECT_MS);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("failed"));
      setBusy(false);
    }
  }

  if (mode === "create") {
    return (
      <p className="text-sm text-sage-500">{t("submitting")}</p>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold tracking-tight text-sage-800">
        {t("title")}
      </h1>
      <p className="ommm-body-muted mt-2">{t("lead")}</p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="ommm-label">{t("password")}</span>
          <PasswordInput
            required
            name="newPassword"
            autoComplete="new-password"
            className="ommm-input"
            value={newPassword}
            onChange={(ev) => setNewPassword(ev.target.value)}
            showPasswordLabel={t("showPassword")}
            hidePasswordLabel={t("hidePassword")}
            disabled={busy && message !== null}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="ommm-label">{t("confirmPassword")}</span>
          <PasswordInput
            required
            name="confirmPassword"
            autoComplete="new-password"
            className="ommm-input"
            value={confirmPassword}
            onChange={(ev) => setConfirmPassword(ev.target.value)}
            showPasswordLabel={t("showPassword")}
            hidePasswordLabel={t("hidePassword")}
            disabled={busy && message !== null}
          />
        </label>
        <OmmButton type="submit" variant="primary" disabled={busy}>
          {busy && message === null ? t("submitting") : t("submit")}
        </OmmButton>
      </form>

      {message ? (
        <p className="mt-4 text-sm text-sage-700" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <FormErrorBanner message={error} variant="inline" className="mt-4" />
      ) : null}

      <p className="ommm-body-muted mt-8 text-center text-sm">
        <Link href="/login" className="ommm-link-sage">
          {t("backToLogin")}
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  const t = useTranslations("common");
  return (
    <Suspense fallback={<p className="text-sm text-sage-500">{t("loading")}</p>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
