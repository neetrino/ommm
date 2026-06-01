"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { OmmButton } from "@/components/ui/omm-button";
import { AuthBackToHomeLink } from "@/components/auth/auth-back-to-home-link";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgotPassword");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      await apiFetch<{ ok: boolean }>("/auth/request-password-reset", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setMessage(t("success"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <AuthBackToHomeLink />
      <h1 className="font-serif text-2xl font-semibold tracking-tight text-sage-800">
        {t("title")}
      </h1>
      <p className="ommm-body-muted mt-2">{t("lead")}</p>
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="ommm-label">{t("email")}</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="ommm-input"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
          />
        </label>
        <OmmButton type="submit" variant="primary" disabled={busy}>
          {busy ? t("sending") : t("submit")}
        </OmmButton>
      </form>
      {message ? (
        <p className="mt-4 text-sm text-sage-700" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
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
