"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";
import { homePathForRole } from "@/lib/role-home";

const MIN_PASSWORD_LENGTH = 8;
const MAX_EMAIL_LENGTH = 254;
const MAX_NAME_LENGTH = 120;

function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_EMAIL_LENGTH) {
    return false;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations("common");
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
    const nameRaw = String(fd.get("name") ?? "").trim();

    setError(null);

    if (!isValidEmail(emailRaw)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (nameRaw.length > MAX_NAME_LENGTH) {
      setError("Name is too long.");
      return;
    }

    submitLockRef.current = true;
    setPending(true);
    try {
      const { user } = await apiFetch<{ user: { role: string } }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: emailRaw.toLowerCase(),
          password,
          name: nameRaw.length > 0 ? nameRaw : undefined,
        }),
      });
      router.push(homePathForRole(user.role));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Register failed");
    } finally {
      setPending(false);
      submitLockRef.current = false;
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
          <input name="name" autoComplete="name" className="ommm-input" maxLength={MAX_NAME_LENGTH} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="ommm-label">Email</span>
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
          <span className="ommm-label">Password</span>
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
