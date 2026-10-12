"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { ApiError, apiFetch } from "@/lib/api";

const RETURN_BUTTON_CLASS = [
  "inline-flex shrink-0 items-center rounded-full",
  "border border-sage-200/80 bg-sage-50/80 px-2.5 py-1",
  "text-xs font-medium text-sage-800",
  "transition hover:bg-sage-100/90",
  "disabled:cursor-not-allowed disabled:opacity-50",
].join(" ");

type AdminClientBookingReturnSessionButtonProps = {
  bookingId: string;
  disabled: boolean;
  onSuccess: () => void;
  onError: (message: string) => void;
};

async function postReturnPackageSession(bookingId: string): Promise<void> {
  await apiFetch(`/bookings/admin/${bookingId}/return-package-session`, {
    method: "POST",
  });
}

function ReturnSessionDialog({
  open,
  pending,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("adminPages.clients");
  return (
    <OmmConfirmDialog
      isOpen={open}
      title={t("bookings.returnSessionConfirmTitle")}
      description={t("bookings.returnSessionConfirmDescription")}
      confirmLabel={t("bookings.returnSessionConfirmLabel")}
      cancelLabel={t("bookings.returnSessionConfirmKeep")}
      backdropAriaLabel={t("modalBackdropClose")}
      pending={pending}
      tone="success"
      forceCenteredModal
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}

export function AdminClientBookingReturnSessionButton({
  bookingId,
  disabled,
  onSuccess,
  onError,
}: AdminClientBookingReturnSessionButtonProps) {
  const t = useTranslations("adminPages.clients");
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function confirmReturn(): Promise<void> {
    if (pending) {
      return;
    }
    setPending(true);
    try {
      await postReturnPackageSession(bookingId);
      setOpen(false);
      onSuccess();
    } catch (error) {
      onError(
        error instanceof ApiError ? error.message : t("bookings.returnSessionError"),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className={RETURN_BUTTON_CLASS}
        disabled={disabled || pending}
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
      >
        {t("bookings.returnSessionButton")}
      </button>
      <ReturnSessionDialog
        open={open}
        pending={pending}
        onConfirm={() => {
          void confirmReturn();
        }}
        onCancel={() => {
          if (!pending) {
            setOpen(false);
          }
        }}
      />
    </>
  );
}
