"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("common");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    setPending(true);
    try {
      await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: fd.get("email"),
          password: fd.get("password"),
        }),
      });
      router.push("/account");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold tracking-tight text-sage-800">
        {t("login")}
      </h1>
      <p className="ommm-body-muted mt-2">
        Welcome back — use the email and password for your studio account.
      </p>
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="ommm-label">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="ommm-input"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="ommm-label">Password</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="ommm-input"
          />
        </label>
        <OmmButton type="submit" variant="primary" className="mt-2" disabled={pending}>
          {pending ? "Signing in…" : "Continue"}
        </OmmButton>
      </form>
      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <p className="ommm-body-muted mt-8 text-center text-sm">
        No account?{" "}
        <Link href="/register" className="ommm-link-sage">
          {t("register")}
        </Link>
      </p>
    </div>
  );
}
