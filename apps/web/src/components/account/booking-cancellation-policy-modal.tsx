"use client";

import { useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";
import { OmmConfirmCenteredModal } from "@/components/ui/omm-confirm-centered-modal";

type BookingCancellationPolicyModalProps = {
  isOpen: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Pre-booking notice: late cancellation (&lt;24h) deducts a session from the package.
 */
export function BookingCancellationPolicyModal({
  isOpen,
  pending = false,
  onConfirm,
  onCancel,
}: BookingCancellationPolicyModalProps) {
  const t = useTranslations("forms.bookSession");
  const checkboxId = useId();
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAcknowledged(false);
    }
  }, [isOpen]);

  return (
    <OmmConfirmCenteredModal
      isOpen={isOpen}
      title={t("policyConfirmTitle")}
      description={t("policyConfirmDescription")}
      confirmLabel={t("policyConfirmContinue")}
      cancelLabel={t("policyConfirmCancel")}
      backdropAriaLabel={t("policyConfirmBackdrop")}
      tone="warm"
      pending={pending}
      confirmPending={pending || !acknowledged}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      <label
        htmlFor={checkboxId}
        className="flex cursor-pointer items-start gap-3 rounded-2xl border border-sand-200/80 bg-sand-50/60 px-3.5 py-3 text-sm text-sage-800"
      >
        <input
          id={checkboxId}
          type="checkbox"
          checked={acknowledged}
          disabled={pending}
          onChange={(event) => setAcknowledged(event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-sand-500/40 accent-sand-500 focus:ring-sand-500/30"
        />
        <span className="leading-relaxed">{t("policyConfirmCheckbox")}</span>
      </label>
    </OmmConfirmCenteredModal>
  );
}
