"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { OmmButton } from "@/components/ui/omm-button";
import { PasswordInput } from "@/components/ui/password-input";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

export function AccountChangePasswordForm() {
  const router = useRouter();
  const t = useTranslations("forms.changePassword");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");

  async function submit() {
    setBusy(true);
    setMsg(null);
    try {
      const c = currentPassword.trim();
      const n = newPassword.trim();
      const conf = confirmPassword.trim();
      if (!c || !n || !conf) {
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
      const res = await apiFetch<{ message: string }>("/users/me/password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: c,
          newPassword: n,
          confirmNewPassword: conf,
        }),
      });
      setTone("ok");
      setMsg(res.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.refresh();
    } catch (e) {
      setTone("err");
      setMsg(e instanceof ApiError ? e.message : t("failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex max-w-md flex-col gap-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-sage-700" htmlFor="current-password">
          {t("currentPasswordLabel")}
        </label>
        <PasswordInput
          id="current-password"
          autoComplete="current-password"
          className="app-input border-sand-500/25 bg-white/90 text-sage-900 placeholder:text-sage-400"
          value={currentPassword}
          onChange={(ev) => setCurrentPassword(ev.target.value)}
          showPasswordLabel={t("showPassword")}
          hidePasswordLabel={t("hidePassword")}
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-sage-700" htmlFor="new-password">
          {t("newPasswordLabel")}
        </label>
        <PasswordInput
          id="new-password"
          autoComplete="new-password"
          className="app-input border-sand-500/25 bg-white/90 text-sage-900 placeholder:text-sage-400"
          value={newPassword}
          onChange={(ev) => setNewPassword(ev.target.value)}
          showPasswordLabel={t("showPassword")}
          hidePasswordLabel={t("hidePassword")}
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-sage-700" htmlFor="confirm-password">
          {t("confirmPasswordLabel")}
        </label>
        <PasswordInput
          id="confirm-password"
          autoComplete="new-password"
          className="app-input border-sand-500/25 bg-white/90 text-sage-900 placeholder:text-sage-400"
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
        {t("updateButton")}
      </OmmButton>
      {msg ? (
        <p className={`text-sm ${tone === "ok" ? "text-sage-600" : "text-red-800"}`}>{msg}</p>
      ) : null}
    </div>
  );
}
