"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { ApiError, apiFetch } from "@/lib/api";

type Props = {
  bookingId: string;
  appearance?: "link" | "button";
  size?: "sm" | "md";
  onCancelled?: () => void;
  /** When set, errors render in the parent (e.g. above a button group) instead of inline. */
  onError?: (message: string | null) => void;
};

const CANCEL_BOOKING_BUTTON_CLASS = "ommm-btn-lifecycle-action--danger";

export const CANCEL_BOOKING_ERROR_MESSAGE_CLASS =
  "mb-2 whitespace-nowrap text-xs leading-none text-amber-800";

export function CancelBookingButton({
  bookingId,
  appearance = "link",
  size = "md",
  onCancelled,
  onError,
}: Props) {
  const router = useRouter();
  const t = useTranslations("forms.cancelBooking");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const buttonSize = appearance === "link" ? "sm" : size;

  function reportError(message: string | null) {
    if (onError) {
      onError(message);
      return;
    }
    setMsg(message);
  }

  function openConfirm() {
    if (busy) {
      return;
    }
    setConfirmOpen(true);
  }

  function closeConfirm() {
    if (busy) {
      return;
    }
    setConfirmOpen(false);
  }

  async function confirmCancel() {
    setBusy(true);
    reportError(null);
    try {
      await apiFetch(`/bookings/${bookingId}`, { method: "DELETE" });
      setConfirmOpen(false);
      onCancelled?.();
      router.refresh();
    } catch (e) {
      reportError(e instanceof ApiError ? e.message : t("failed"));
      setConfirmOpen(false);
    } finally {
      setBusy(false);
    }
  }

  const inlineMessage = onError ? null : msg;

  return (
    <>
      <div className="flex flex-col items-start gap-1">
        {inlineMessage ? (
          <p className={CANCEL_BOOKING_ERROR_MESSAGE_CLASS}>{inlineMessage}</p>
        ) : null}
        <OmmButton
          type="button"
          variant="secondary"
          size={buttonSize}
          disabled={busy}
          className={CANCEL_BOOKING_BUTTON_CLASS}
          onClick={openConfirm}
        >
          {t("action")}
        </OmmButton>
      </div>
      <OmmConfirmDialog
        isOpen={confirmOpen}
        title={t("confirmTitle")}
        description={t("confirm")}
        confirmLabel={t("action")}
        cancelLabel={t("confirmNo")}
        backdropAriaLabel={t("modalBackdropClose")}
        tone="danger"
        confirmClassName={CANCEL_BOOKING_BUTTON_CLASS}
        pending={busy}
        onConfirm={() => void confirmCancel()}
        onCancel={closeConfirm}
      />
    </>
  );
}
