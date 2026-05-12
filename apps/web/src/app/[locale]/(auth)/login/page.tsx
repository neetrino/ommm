"use client";

import { useTranslations } from "next-intl";
import { useState, useRef } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { AuthBackToHomeLink } from "@/components/auth/auth-back-to-home-link";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";
import { homePathForRole } from "@/lib/role-home";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("common");
  const tAuth = useTranslations("auth.login");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const submitLockRef = useRef(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending || submitLockRef.current) {
      return;
    }
    const fd = new FormData(e.currentTarget);
    setError(null);
    submitLockRef.current = true;
    setPending(true);
    try {
      const { user } = await apiFetch<{ user: { role: string } }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: fd.get("email"),
          password: fd.get("password"),
        }),
      });
      router.push(homePathForRole(user.role));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : tAuth("loginFailed"));
    } finally {
      setPending(false);
      submitLockRef.current = false;
    }
  }

  return (
    <div>
      <AuthBackToHomeLink />
      <h1 className="font-serif text-2xl font-semibold tracking-tight text-sage-800">
        {t("login")}
      </h1>
      <p className="ommm-body-muted mt-2">{tAuth("lead")}</p>
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="ommm-label">{tAuth("email")}</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="ommm-input"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="ommm-label">{tAuth("password")}</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="ommm-input"
          />
        </label>
        <OmmButton type="submit" variant="primary" className="mt-2" disabled={pending}>
          {pending ? tAuth("signingIn") : tAuth("continue")}
        </OmmButton>
      </form>
      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <p className="ommm-body-muted mt-8 text-center text-sm">
        {tAuth("noAccountPrompt")}{" "}
        <Link href="/register" className="ommm-link-sage">
          {t("register")}
        </Link>
      </p>
    </div>
  );
}
