"use client";

import type { useTranslations } from "next-intl";
import {
  ADMIN_GIFT_CARD_FORM_MAX_IMAGE_BYTES,
  isAcceptedGiftCardImageType,
} from "@/components/admin/admin-create-gift-card-form.helpers";
import type { AdminGiftCardFormMode } from "@/components/admin/admin-create-gift-card-form.types";
import { AmdMoneyInput } from "@/components/ui/amd-money-input";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { DropdownSelect, type DropdownOption } from "@/components/ui/dropdown-select";
import { OmmButton } from "@/components/ui/omm-button";

type AdminCreateGiftCardFormFieldsProps = {
  mode: AdminGiftCardFormMode;
  amountAmd: string;
  setAmountAmd: (value: string) => void;
  quantity: string;
  setQuantity: (value: string) => void;
  minQuantity: number;
  projectedRemaining: number;
  issuedCount: number;
  showAssignedUser: boolean;
  setShowAssignedUser: React.Dispatch<React.SetStateAction<boolean>>;
  recipientId: string;
  setRecipientId: (value: string) => void;
  recipientEmail: string;
  setRecipientEmail: (value: string) => void;
  recipientName: string;
  setRecipientName: (value: string) => void;
  message: string;
  setMessage: (value: string) => void;
  expiresAt: string;
  setExpiresAt: (value: string) => void;
  recipientOptions: readonly DropdownOption<string>[];
  imageInputRef: React.RefObject<HTMLInputElement | null>;
  imageFile: File | null;
  imagePreviewUrl: string | null;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  busy: boolean;
  t: ReturnType<typeof useTranslations<"adminPages.giftCards">>;
};

export function AdminCreateGiftCardFormFields({
  mode,
  amountAmd,
  setAmountAmd,
  quantity,
  setQuantity,
  minQuantity,
  projectedRemaining,
  issuedCount,
  showAssignedUser,
  setShowAssignedUser,
  recipientId,
  setRecipientId,
  recipientEmail,
  setRecipientEmail,
  recipientName,
  setRecipientName,
  message,
  setMessage,
  expiresAt,
  setExpiresAt,
  recipientOptions,
  imageInputRef,
  imageFile,
  imagePreviewUrl,
  onImageChange,
  busy,
  t,
}: AdminCreateGiftCardFormFieldsProps) {
  return (
    <>
      <label className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldAmount")}</span>
        <AmdMoneyInput
          name="amountAmd"
          placeholder={t("fieldAmountPlaceholder")}
          value={amountAmd}
          onValueChange={setAmountAmd}
          disabled={busy}
          required
        />
      </label>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-start gap-3">
          <OmmButton
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={() => {
              setShowAssignedUser((current) => {
                const next = !current;
                if (!next) {
                  setRecipientId("");
                  setRecipientEmail("");
                  setRecipientName("");
                }
                return next;
              });
            }}
          >
            Assigne user
          </OmmButton>
        </div>
        {showAssignedUser ? (
          <div className="grid gap-3">
            <DropdownSelect
              label={t("fieldAssignedUserPlaceholder")}
              ariaLabel={t("fieldAssignedUser")}
              value={recipientId}
              options={recipientOptions}
              onChange={setRecipientId}
              disabled={busy}
            />
            <label className="flex flex-col gap-1">
              <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldRecipientEmail")}</span>
              <input
                type="email"
                className="ommm-input"
                placeholder={t("fieldRecipientEmailPlaceholder")}
                value={recipientEmail}
                onChange={(event) => setRecipientEmail(event.target.value)}
                disabled={busy}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldRecipientName")}</span>
              <input
                type="text"
                className="ommm-input"
                placeholder={t("fieldRecipientNamePlaceholder")}
                value={recipientName}
                onChange={(event) => setRecipientName(event.target.value)}
                disabled={busy}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldMessage")}</span>
              <textarea
                className="ommm-input min-h-24 resize-y"
                placeholder={t("fieldMessagePlaceholder")}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                disabled={busy}
              />
            </label>
          </div>
        ) : (
          <p className="text-xs text-sage-500">{t("fieldAssignedUserHiddenHint")}</p>
        )}
      </div>
      <div className={mode === "edit" ? "grid gap-4 sm:grid-cols-2" : "flex flex-col gap-1"}>
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">
            {mode === "edit" ? t("fieldQuantityTotal") : t("fieldQuantity")}
          </span>
          <input
            name="quantity"
            type="number"
            min={minQuantity}
            step={1}
            className="ommm-input [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            placeholder={t("fieldQuantityPlaceholder")}
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            disabled={busy}
            required
          />
        </label>
        {mode === "edit" ? (
          <div className="flex flex-col gap-1">
            <span className="ommm-label text-xs uppercase tracking-wide">
              {t("fieldQuantityRemaining")}
            </span>
            <p
              className="ommm-input flex min-h-[2.75rem] items-center bg-sage-50/80 text-sage-900"
              aria-live="polite"
            >
              {projectedRemaining}
            </p>
            {issuedCount > 0 ? (
              <p className="text-xs text-sage-500">
                {t("fieldQuantityRemainingHint", { issued: issuedCount })}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldImage")}</span>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          className="sr-only"
          onChange={onImageChange}
          disabled={busy}
        />
        <div className="flex flex-wrap items-center gap-3">
          <OmmButton
            type="button"
            variant="secondary"
            size="sm"
            className="cursor-pointer shadow-sm transition-transform hover:-translate-y-px"
            disabled={busy}
            onClick={() => imageInputRef.current?.click()}
          >
            Choose File
          </OmmButton>
          <span className="text-sm text-sage-700">{imageFile?.name ?? "No file chosen"}</span>
        </div>
        <span className="text-xs text-sage-500">{t("fieldImageHint")}</span>
      </div>
      {imagePreviewUrl !== null ? (
        <div className="relative h-24 w-36 overflow-hidden rounded-xl border border-white/70 bg-white/70">
          {/* eslint-disable-next-line @next/next/no-img-element -- preview image supports blob/object URLs */}
          <img
            src={imagePreviewUrl}
            alt={t("fieldImagePreviewAlt")}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}
      <label className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldExpiration")}</span>
        <DatePickerInput
          name="expiresAt"
          ariaLabel={t("fieldExpiration")}
          value={expiresAt}
          onChange={setExpiresAt}
          disabled={busy}
        />
      </label>
    </>
  );
}
