"use client";

import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";

const DELETE_ACCOUNT_TRIGGER_CLASS =
  "text-sm text-sage-500 underline decoration-sage-300/80 underline-offset-4 transition hover:text-red-700 hover:decoration-red-300/80 disabled:cursor-not-allowed disabled:opacity-50";

const DELETE_ACCOUNT_CONFIRM_CLASS = "ommm-btn-lifecycle-action--danger";
const ACCOUNT_DELETION_CODE_LENGTH = 6;

type DeleteStep = "confirm" | "code";

type DeleteAccountButtonProps = {
  triggerClassName?: string;
  triggerContent?: ReactNode;
  /** Shown while pending when `triggerContent` is a menu row layout. */
  busyTriggerContent?: ReactNode;
  /** When true, omit outer wrapper — for account hub menu rows. */
  bare?: boolean;
  /** Profile page: red pill button; hub/menu keeps link or custom row. */
  appearance?: "link" | "dangerButton";
  /** Optional wrapper classes (e.g. mobile alignment on profile page). */
  wrapperClassName?: string;
};

async function requestDeletionCode(): Promise<void> {
  await apiFetch<{ ok: boolean }>("/users/me/deletion-code", { method: "POST" });
}

async function closeAccount(code: string): Promise<void> {
  await apiFetch<{ ok: boolean }>("/users/me", {
    method: "DELETE",
    body: JSON.stringify({ code }),
  });
  try {
    await apiFetch<{ ok: boolean }>("/auth/logout", { method: "POST" });
  } catch {
    // Session cookie is cleared by DELETE /users/me; logout is best-effort.
  }
}

function deleteConfirmLabel(
  step: DeleteStep,
  busy: boolean,
  labels: { sending: string; deleting: string; confirm: string },
): string {
  if (busy && step === "confirm") {
    return labels.sending;
  }
  if (busy) {
    return labels.deleting;
  }
  return labels.confirm;
}

function deletionErrorMessage(
  error: unknown,
  step: DeleteStep,
  invalidCode: string,
  fallback: string,
): string {
  if (step === "code" && error instanceof ApiError && error.status === 400) {
    return invalidCode;
  }
  return error instanceof ApiError ? error.message : fallback;
}

export function DeleteAccountButton({
  triggerClassName,
  triggerContent,
  busyTriggerContent,
  bare = false,
  appearance = "link",
  wrapperClassName = "",
}: DeleteAccountButtonProps = {}) {
  const t = useTranslations("userPages.profile");
  const locale = useLocale();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [step, setStep] = useState<DeleteStep>("confirm");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function resetDialog() {
    setStep("confirm");
    setCode("");
    setMessage(null);
  }

  function openConfirm() {
    if (busy) {
      return;
    }
    resetDialog();
    setConfirmOpen(true);
  }

  function closeConfirm() {
    if (busy) {
      return;
    }
    setConfirmOpen(false);
    resetDialog();
  }

  async function sendCode() {
    setBusy(true);
    setMessage(null);
    try {
      await requestDeletionCode();
      setStep("code");
    } catch (error) {
      setMessage(deletionErrorMessage(error, "confirm", "", t("deleteAccountFailed")));
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (code.length !== ACCOUNT_DELETION_CODE_LENGTH) {
      setMessage(t("deleteAccountCodeInvalid"));
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await closeAccount(code);
      setConfirmOpen(false);
      resetDialog();
      router.replace("/", { locale });
      router.refresh();
    } catch (error) {
      setMessage(
        deletionErrorMessage(
          error,
          "code",
          t("deleteAccountCodeInvalid"),
          t("deleteAccountFailed"),
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  const triggerLabel = busy
    ? (busyTriggerContent ??
      (triggerContent !== undefined ? triggerContent : t("deleteAccountDeleting")))
    : (triggerContent ?? t("deleteAccount"));

  const useDangerButton =
    appearance === "dangerButton" &&
    triggerClassName === undefined &&
    triggerContent === undefined;

  const trigger = useDangerButton ? (
    <OmmButton variant="danger" onClick={openConfirm} disabled={busy}>
      {busy ? t("deleteAccountDeleting") : t("deleteAccount")}
    </OmmButton>
  ) : (
    <button
      type="button"
      className={triggerClassName ?? DELETE_ACCOUNT_TRIGGER_CLASS}
      onClick={openConfirm}
      disabled={busy}
    >
      {triggerLabel}
    </button>
  );

  const confirmLabel = deleteConfirmLabel(step, busy, {
    sending: t("deleteAccountCodeSending"),
    deleting: t("deleteAccountDeleting"),
    confirm: t("deleteAccountConfirmYes"),
  });

  return (
    <>
      {bare ? trigger : (
        <div className={`flex flex-col items-start gap-1 ${wrapperClassName}`.trim()}>
          {trigger}
        </div>
      )}
      <OmmConfirmDialog
        isOpen={confirmOpen}
        title={step === "code" ? t("deleteAccountCodeTitle") : t("deleteAccountConfirmTitle")}
        description={
          step === "code"
            ? t("deleteAccountCodeDescription")
            : t("deleteAccountConfirmDescription")
        }
        confirmLabel={confirmLabel}
        cancelLabel={t("deleteAccountConfirmNo")}
        backdropAriaLabel={t("deleteAccountBackdropClose")}
        tone="danger"
        confirmClassName={DELETE_ACCOUNT_CONFIRM_CLASS}
        pending={busy}
        forceCenteredModal
        onConfirm={() => void (step === "code" ? confirmDelete() : sendCode())}
        onCancel={closeConfirm}
      >
        {step === "code" ? (
          <DeletionCodeField
            label={t("deleteAccountCodeLabel")}
            placeholder={t("deleteAccountCodePlaceholder")}
            value={code}
            disabled={busy}
            onChange={setCode}
          />
        ) : null}
        {message ? <p className="text-xs text-red-800">{message}</p> : null}
      </OmmConfirmDialog>
    </>
  );
}

function DeletionCodeField({
  label,
  placeholder,
  value,
  disabled,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="ommm-label">{label}</span>
      <input
        value={value}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={ACCOUNT_DELETION_CODE_LENGTH}
        placeholder={placeholder}
        disabled={disabled}
        className="ommm-input text-center"
        onChange={(event) => {
          const digits = event.target.value
            .replace(/\D/g, "")
            .slice(0, ACCOUNT_DELETION_CODE_LENGTH);
          onChange(digits);
        }}
      />
    </label>
  );
}
