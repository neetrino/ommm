"use client";

import type { useTranslations } from "next-intl";
import {
  GiftCardAssignSection,
  GiftCardImageField,
} from "@/components/admin/admin-create-gift-card-form-sections";
import type { AdminGiftCardFormMode } from "@/components/admin/admin-create-gift-card-form.types";
import { AmdMoneyInput } from "@/components/ui/amd-money-input";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import type { DropdownOption } from "@/components/ui/dropdown-select";

type AdminCreateGiftCardFormFieldsProps = {
  mode: AdminGiftCardFormMode;
  hideAmount: boolean;
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
  hideAmount,
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
      {hideAmount ? null : (
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldAmount")}</span>
          <AmdMoneyInput
            name="amountAmd"
            placeholder={t("fieldAmountPlaceholder")}
            value={amountAmd}
            onValueChange={setAmountAmd}
            align="start"
            disabled={busy}
            required
          />
        </label>
      )}
      <GiftCardAssignSection
        showAssignedUser={showAssignedUser}
        setShowAssignedUser={setShowAssignedUser}
        recipientId={recipientId}
        setRecipientId={setRecipientId}
        message={message}
        setMessage={setMessage}
        recipientOptions={recipientOptions}
        busy={busy}
        t={t}
      />
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
      <GiftCardImageField
        imageInputRef={imageInputRef}
        imageFile={imageFile}
        imagePreviewUrl={imagePreviewUrl}
        onImageChange={onImageChange}
        busy={busy}
        t={t}
      />
      {mode === "create" ? null : (
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldExpiration")}</span>
          <DatePickerInput
            name="expiresAt"
            ariaLabel={t("fieldExpiration")}
            value={expiresAt}
            onChange={setExpiresAt}
            disablePastDates
            disabled={busy}
          />
        </label>
      )}
    </>
  );
}

export function GiftCardFormHero({ title, caption }: { title: string; caption: string }) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-white/80 bg-white shadow-[0_16px_36px_-18px_rgba(45,40,35,0.28)]">
      <div className="bg-gradient-to-br from-sand-50 via-paper to-mint-50 px-5 py-6">
        <p className="font-serif text-4xl font-normal tracking-tight text-sage-900">{title}</p>
        <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-sage-500">{caption}</p>
      </div>
    </div>
  );
}
