"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FormErrorBanner } from "@/components/ui/form-validation";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmModalPortal } from "@/components/ui/omm-modal";
import { PhoneInputField } from "@/components/ui/phone-input-field";
import { ApiError, apiFetch } from "@/lib/api";
import {
  isValidPhone,
  normalizePhoneForApi,
} from "@/lib/phone";
import { PSEUDO_PHONE } from "@/lib/pseudo-form-placeholders";
import styles from "@/components/account/required-phone-completion-gate.module.css";

type RequiredPhoneCompletionGateProps = {
  initialNeedsPhoneCompletion: boolean;
};

/**
 * Blocking gate for Google-linked members without a phone.
 * Cannot be dismissed; persists across refresh until the number is saved.
 */
export function RequiredPhoneCompletionGate({
  initialNeedsPhoneCompletion,
}: RequiredPhoneCompletionGateProps) {
  const router = useRouter();
  const t = useTranslations("account.requiredPhone");
  const titleId = useId();
  const descId = useId();
  const [open, setOpen] = useState(initialNeedsPhoneCompletion);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const submitLockRef = useRef(false);

  useEffect(() => {
    setOpen(initialNeedsPhoneCompletion);
  }, [initialNeedsPhoneCompletion]);

  if (!open) {
    return null;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || submitLockRef.current) {
      return;
    }
    const phoneRaw = phone.trim();
    setError(null);
    if (phoneRaw.length === 0) {
      setError(t("phoneRequired"));
      return;
    }
    if (!isValidPhone(phoneRaw)) {
      setError(t("invalidPhone"));
      return;
    }

    submitLockRef.current = true;
    setPending(true);
    try {
      await apiFetch("/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          phone: normalizePhoneForApi(phoneRaw),
        }),
      });
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("saveFailed"));
    } finally {
      setPending(false);
      submitLockRef.current = false;
    }
  }

  return (
    <OmmModalPortal
      isOpen
      onClose={() => undefined}
      dialogRole="alertdialog"
      ariaLabelledBy={titleId}
      ariaDescribedBy={descId}
      backdropAriaLabel={t("backdropAria")}
      closeDisabled
      closeOnEscape={false}
      centered
      overlayClassName={`${styles.overlay} ommm-modal-overlay z-[120] p-4`}
      panelClassName={styles.panel}
    >
      <form onSubmit={onSubmit} noValidate className={styles.form}>
        <p className={styles.eyebrow}>{t("eyebrow")}</p>
        <h2 id={titleId} className={styles.title}>
          {t("title")}
        </h2>
        <p id={descId} className={styles.body}>
          {t("body")}
        </p>
        <label className={styles.field}>
          <span className="ommm-label">{t("phoneLabel")}</span>
          <PhoneInputField
            name="phone"
            required
            autoFocus
            className="ommm-input"
            value={phone}
            onValueChange={setPhone}
            placeholder={PSEUDO_PHONE}
            disabled={pending}
          />
        </label>
        {error ? <FormErrorBanner message={error} variant="inline" /> : null}
        <OmmButton
          type="submit"
          variant="primary"
          size="md"
          className="mt-1 w-full"
          disabled={pending}
        >
          {pending ? t("saving") : t("save")}
        </OmmButton>
      </form>
    </OmmModalPortal>
  );
}
