"use client";

import { useTranslations } from "next-intl";
import { OmmButton } from "@/components/ui/omm-button";
import styles from "@/components/account/booking-package-select-guest-actions.module.css";

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
    <div className={styles.actions}>
      {showGuestAction ? (
        <OmmButton
          type="button"
          variant="secondary"
          size="md"
          className={styles.actionButton}
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
        className={styles.actionButton}
        disabled={busy || !canConfirmOwner}
        onClick={onConfirmOwner}
      >
        {busy ? t("packageModalConfirming") : t("packageModalConfirm")}
      </OmmButton>
    </div>
  );
}
