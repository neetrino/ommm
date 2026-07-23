"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { OmmButton } from "@/components/ui/omm-button";
import { PasswordInput } from "@/components/ui/password-input";
import { dismissMobileKeyboard } from "@/lib/dismiss-mobile-keyboard";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

type AccountChangePasswordFormProps = {
  hasPassword: boolean;
  /** When true, section title is provided by the parent card. */
  embedded?: boolean;
  /** Mobile: right-align the submit button only. */
  mobileSubmitAlignEnd?: boolean;
};

export function AccountChangePasswordForm({
  hasPassword,
  embedded = false,
  mobileSubmitAlignEnd = false,
}: AccountChangePasswordFormProps) {
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
      if (!n || !conf || (hasPassword && !c)) {
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
      const payload: {
        newPassword: string;
        confirmNewPassword: string;
        currentPassword?: string;
      } = {
        newPassword: n,
        confirmNewPassword: conf,
      };
      if (hasPassword) {
        payload.currentPassword = c;
      }
      const res = await apiFetch<{ message: string }>("/users/me/password", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setTone("ok");
      setMsg(res.message);
      dismissMobileKeyboard();
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
    <div className="flex flex-col gap-4">
      {!embedded ? (
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-sage-900">
            {hasPassword ? t("changeTitle") : t("setTitle")}
          </h3>
          {!hasPassword ? (
            <p className="text-sm text-sage-600">{t("setDescription")}</p>
          ) : null}
        </div>
      ) : !hasPassword ? (
        <p className="text-sm text-sage-600">{t("setDescription")}</p>
      ) : null}
      {hasPassword ? (
        <div className="space-y-1">
          <label className="ommm-label" htmlFor="current-password">
            {t("currentPasswordLabel")}
          </label>
          <PasswordInput
            id="current-password"
            autoComplete="current-password"
            className="ommm-input"
            value={currentPassword}
            onChange={(ev) => setCurrentPassword(ev.target.value)}
            showPasswordLabel={t("showPassword")}
            hidePasswordLabel={t("hidePassword")}
          />
        </div>
      ) : null}
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
      {mobileSubmitAlignEnd ? (
        <div className="max-md:flex max-md:w-full max-md:justify-end">
          <OmmButton
            type="button"
            variant="primary"
            size="sm"
            className="w-fit"
            disabled={busy}
            onClick={() => void submit()}
          >
            {hasPassword ? t("changeButton") : t("setButton")}
          </OmmButton>
        </div>
      ) : (
        <OmmButton
          type="button"
          variant="primary"
          size="sm"
          className="w-fit"
          disabled={busy}
          onClick={() => void submit()}
        >
          {hasPassword ? t("changeButton") : t("setButton")}
        </OmmButton>
      )}
      {msg ? (
        <p className={`text-sm ${tone === "ok" ? "text-sage-600" : "text-red-800"}`}>{msg}</p>
      ) : null}
    </div>
  );
}
