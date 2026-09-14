"use client";

import { useTranslations } from "next-intl";
import { OmmButton } from "@/components/ui/omm-button";

type BookingPackageSelectGuestActionsProps = {
  busy: boolean;
  showGuestAction: boolean;
  canConfirmOwner: boolean;
  canConfirmGuest: boolean;
  onConfirmOwner: () => void;
  onConfirmGuest: () => void;
};

export function BookingPackageSelectGuestActions({
  busy,
  showGuestAction,
  canConfirmOwner,
  canConfirmGuest,
  onConfirmOwner,
  onConfirmGuest,
}: BookingPackageSelectGuestActionsProps) {
  const t = useTranslations("forms.bookSession");

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      {showGuestAction ? (
        <OmmButton
          type="button"
          variant="secondary"
          size="md"
          disabled={busy || !canConfirmGuest}
          onClick={onConfirmGuest}
        >
          {t("packageModalBookGuest")}
        </OmmButton>
      ) : null}
      <OmmButton
        type="button"
        variant="primary"
        size="md"
        disabled={busy || !canConfirmOwner}
        onClick={onConfirmOwner}
      >
        {busy ? t("packageModalConfirming") : t("packageModalConfirm")}
      </OmmButton>
    </div>
  );
}
