"use client";

import { useTranslations } from "next-intl";
import { OmmButton } from "@/components/ui/omm-button";

const PACKAGE_PAUSE_BUTTON_CLASS = "ommm-btn-lifecycle-action--warm";

type UserPackageFreezeDialogProps = {
  days: string;
  maxDays: number;
  remainingCount: number;
  pending: boolean;
  onDaysChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export function UserPackageFreezeDialog({
  days,
  maxDays,
  remainingCount,
  pending,
  onDaysChange,
  onConfirm,
  onCancel,
}: UserPackageFreezeDialogProps) {
  const t = useTranslations("forms.packageLifecycle");
  const parsedDays = Number.parseInt(days, 10);
  const daysValid =
    Number.isInteger(parsedDays) && parsedDays >= 1 && parsedDays <= maxDays;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-sage-950/40 px-4"
      role="presentation"
      onClick={() => {
        if (!pending) {
          onCancel();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="package-freeze-dialog-title"
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-[0_24px_60px_-28px_rgba(45,40,35,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id="package-freeze-dialog-title"
          className="font-serif text-2xl text-sage-950"
        >
          {t("freezeConfirmTitle")}
        </h2>
        <p className="mt-2 text-sm text-sage-600">{t("freezeConfirmDescription")}</p>
        <p className="mt-3 text-sm text-sage-700">
          {t("freezeRemainingHint", { remaining: remainingCount, maxDays })}
        </p>
        <label className="mt-4 flex flex-col gap-1.5">
          <span className="ommm-label text-xs uppercase tracking-wide">
            {t("freezeDaysLabel")}
          </span>
          <input
            type="number"
            min={1}
            max={maxDays}
            step={1}
            inputMode="numeric"
            value={days}
            disabled={pending}
            onChange={(event) => onDaysChange(event.target.value)}
            className="ommm-input [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <OmmButton type="button" variant="secondary" disabled={pending} onClick={onCancel}>
            {t("confirmNo")}
          </OmmButton>
          <OmmButton
            type="button"
            variant="primary"
            disabled={pending || !daysValid}
            className={PACKAGE_PAUSE_BUTTON_CLASS}
            onClick={onConfirm}
          >
            {t("freeze")}
          </OmmButton>
        </div>
      </div>
    </div>
  );
}
