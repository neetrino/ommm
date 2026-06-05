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
};

const CANCEL_BOOKING_BUTTON_CLASSES =
  "inline-flex cursor-pointer items-center rounded-md px-1 py-0.5 text-xs font-medium text-red-700 transition-[background-color,color,box-shadow] hover:bg-red-50 hover:text-red-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";

const CANCEL_BOOKING_CONFIRM_CLASS = "ommm-btn-lifecycle-action--danger";

export function CancelBookingButton({
  bookingId,
  appearance = "link",
  size = "md",
  onCancelled,
}: Props) {
  const router = useRouter();
  const t = useTranslations("forms.cancelBooking");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
    setMsg(null);
    try {
      await apiFetch(`/bookings/${bookingId}`, { method: "DELETE" });
      setConfirmOpen(false);
      onCancelled?.();
      router.refresh();
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : t("failed"));
      setConfirmOpen(false);
    } finally {
      setBusy(false);
    }
  }

  const action =
    appearance === "button" ? (
      <OmmButton
        type="button"
        variant="danger"
        size={size}
        disabled={busy}
        onClick={openConfirm}
      >
        {t("action")}
      </OmmButton>
    ) : (
      <button
        type="button"
        disabled={busy}
        onClick={openConfirm}
        className={CANCEL_BOOKING_BUTTON_CLASSES}
      >
        {t("action")}
      </button>
    );

  return (
    <>
      <div className="flex flex-col items-start gap-1">
        {action}
        {msg ? <p className="text-xs text-amber-800">{msg}</p> : null}
      </div>
      <OmmConfirmDialog
        isOpen={confirmOpen}
        title={t("confirmTitle")}
        description={t("confirm")}
        confirmLabel={t("action")}
        cancelLabel={t("confirmNo")}
        backdropAriaLabel={t("modalBackdropClose")}
        tone="danger"
        confirmClassName={CANCEL_BOOKING_CONFIRM_CLASS}
        pending={busy}
        onConfirm={() => void confirmCancel()}
        onCancel={closeConfirm}
      />
    </>
  );
}
