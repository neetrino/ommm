"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { postAuthPathForRole } from "@/lib/role-home";
import { OmmButton } from "@/components/ui/omm-button";
import { PasswordInput } from "@/components/ui/password-input";
import { Link } from "@/i18n/navigation";
import { dismissMobileKeyboard } from "@/lib/dismiss-mobile-keyboard";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

type GoogleSignupPasswordFormProps = {
  token: string;
};

type CompleteGoogleSignupResponse = {
  user: {
    role: string;
  };
};

export function GoogleSignupPasswordForm({
  token,
}: GoogleSignupPasswordFormProps) {
  const router = useRouter();
  const t = useTranslations("forms.changePassword");
  const tPage = useTranslations("setPasswordPage");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");

  async function submit() {
    setBusy(true);
    setMsg(null);
    try {
      const n = newPassword.trim();
      const conf = confirmPassword.trim();
      if (!n || !conf) {
        setTone("err");
        setMsg(t("fillAllFields"));
        return;
      }
      if (n !== conf) {
        setTone("err");
        setMsg(t("mismatch"));
        return;
      }
      if (n.length < PASSWORD_MIN_LENGTH || n.length > PASSWORD_MAX_LENGTH) {
        setTone("err");
        setMsg(
          t("lengthConstraint", {
            min: PASSWORD_MIN_LENGTH,
            max: PASSWORD_MAX_LENGTH,
          }),
        );
        return;
      }
      const res = await apiFetch<CompleteGoogleSignupResponse>(
        "/auth/complete-google-signup",
        {
          method: "POST",
          body: JSON.stringify({
            token,
            newPassword: n,
            confirmNewPassword: conf,
          }),
        },
      );
      dismissMobileKeyboard();
      router.replace(postAuthPathForRole(res.user.role));
      router.refresh();
    } catch (e) {
      setTone("err");
      setMsg(e instanceof ApiError ? e.message : t("failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center ommm-bg-auth px-4 py-12">
      <div className="ommm-card w-full max-w-md p-6 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-8">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-sage-800">
          {tPage("title")}
        </h1>
        <p className="ommm-body-muted mt-2">{tPage("lead")}</p>
        <div className="mt-6 flex flex-col gap-4">
          <p className="text-sm text-sage-600">{t("setDescription")}</p>
          <div className="space-y-1">
            <label className="ommm-label" htmlFor="new-password">
              {t("newPasswordLabel")}
            </label>
            <PasswordInput
              id="new-password"
              autoComplete="new-password"
              className="ommm-input"
              value={newPassword}
              onChange={(ev) => setNewPassword(ev.target.value)}
              showPasswordLabel={t("showPassword")}
              hidePasswordLabel={t("hidePassword")}
            />
          </div>
          <div className="space-y-1">
            <label className="ommm-label" htmlFor="confirm-password">
              {t("confirmPasswordLabel")}
            </label>
            <PasswordInput
              id="confirm-password"
              autoComplete="new-password"
              className="ommm-input"
              value={confirmPassword}
              onChange={(ev) => setConfirmPassword(ev.target.value)}
              showPasswordLabel={t("showPassword")}
              hidePasswordLabel={t("hidePassword")}
            />
          </div>
          <OmmButton
            type="button"
            variant="primary"
            size="sm"
            className="w-fit"
            disabled={busy}
            onClick={() => void submit()}
          >
            {t("setButton")}
          </OmmButton>
          {msg ? (
            <p
              className={`text-sm ${tone === "ok" ? "text-sage-600" : "text-red-800"}`}
            >
              {msg}
            </p>
          ) : null}
          <Link
            href="/login"
            className="text-sm font-medium text-sage-700 underline-offset-4 hover:underline"
          >
            {tPage("backToLogin")}
          </Link>
        </div>
      </div>
    </div>
  );
}
