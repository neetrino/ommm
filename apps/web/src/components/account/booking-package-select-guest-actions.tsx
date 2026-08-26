"use client";

import { useTranslations } from "next-intl";
import { OmmButton } from "@/components/ui/omm-button";

type BookingPackageSelectGuestActionsProps = {
  busy: boolean;
  guestName: string;
  showGuestField: boolean;
  canConfirmOwner: boolean;
  canConfirmGuest: boolean;
  onGuestNameChange: (value: string) => void;
  onClose: () => void;
  onConfirmOwner: () => void;
  onConfirmGuest: () => void;
};

export function BookingPackageSelectGuestActions({
  busy,
  guestName,
  showGuestField,
  canConfirmOwner,
  canConfirmGuest,
  onGuestNameChange,
  onClose,
  onConfirmOwner,
  onConfirmGuest,
}: BookingPackageSelectGuestActionsProps) {
  const t = useTranslations("forms.bookSession");

  return (
    <div className="space-y-3 border-t border-white/60 bg-white/70 px-5 py-4 sm:px-6">
      {showGuestField ? (
        <label className="block text-sm text-sage-700">
          <span className="mb-1 block text-xs font-medium text-sage-500">
            {t("guestPassNameLabel")}
          </span>
          <input
            type="text"
            name="guestName"
            value={guestName}
            onChange={(event) => onGuestNameChange(event.target.value)}
            className="w-full rounded-2xl border border-sand-200/80 bg-white px-3.5 py-2.5 text-sm text-sage-900"
            placeholder={t("guestPassNamePlaceholder")}
            disabled={busy}
          />
        </label>
      ) : null}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <OmmButton type="button" variant="secondary" size="md" onClick={onClose} disabled={busy}>
          {t("packageModalCancel")}
        </OmmButton>
        <OmmButton
          type="button"
          variant="secondary"
          size="md"
          disabled={busy || !canConfirmGuest}
          onClick={onConfirmGuest}
        >
          {t("packageModalBookGuest")}
        </OmmButton>
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
    </div>
  );
}
