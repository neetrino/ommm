"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";

const PASSWORD_MIN_LENGTH = 8;
const POST_SUCCESS_REDIRECT_MS = 1200;

export type ResetPasswordFormState = {
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  busy: boolean;
  message: string | null;
  error: string | null;
  /** The API rejected the request (usually an expired or already used link). */
  requestFailed: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
};

/** State and submit flow for the "forgot password" reset form. */
export function useResetPasswordForm(token: string): ResetPasswordFormState {
  const router = useRouter();
  const t = useTranslations("auth.resetPassword");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestFailed, setRequestFailed] = useState(false);

  function validate(password: string, confirmation: string): string | null {
    if (password.length < PASSWORD_MIN_LENGTH) {
      return t("passwordTooShort", { min: PASSWORD_MIN_LENGTH });
    }
    return password === confirmation ? null : t("mismatch");
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (busy || token.length === 0) {
      return;
    }
    setMessage(null);
    setRequestFailed(false);
    const password = newPassword.trim();
    const validationError = validate(password, confirmPassword.trim());
    setError(validationError);
    if (validationError) {
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
      window.setTimeout(() => router.push("/login"), POST_SUCCESS_REDIRECT_MS);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("failed"));
      setRequestFailed(true);
      setBusy(false);
    }
  }

  return {
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    busy,
    message,
    error,
    requestFailed,
    onSubmit,
  };
}
