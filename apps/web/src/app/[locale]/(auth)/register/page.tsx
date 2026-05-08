"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";

export default function RegisterPage() {
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
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: fd.get("email"),
          password: fd.get("password"),
          name: fd.get("name") || undefined,
        }),
      });
      router.push("/login");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Register failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold tracking-tight text-sage-800">
        {t("register")}
      </h1>
      <p className="ommm-body-muted mt-2">
        Create a member account to book classes and manage memberships.
      </p>
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="ommm-label">Name</span>
          <input name="name" autoComplete="name" className="ommm-input" />
        </label>
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
            minLength={8}
            autoComplete="new-password"
            className="ommm-input"
          />
        </label>
        <p className="text-xs text-sage-500">At least 8 characters.</p>
        <OmmButton type="submit" variant="primary" className="mt-2" disabled={pending}>
          {pending ? "Creating…" : "Create account"}
        </OmmButton>
      </form>
      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <p className="ommm-body-muted mt-8 text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="ommm-link-sage">
          {t("login")}
        </Link>
      </p>
    </div>
  );
}
