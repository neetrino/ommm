"use client";

import { PhoneInputField } from "@/components/ui/phone-input-field";
import { PSEUDO_PHONE } from "@/lib/pseudo-form-placeholders";

type RegisterWhatsappPhoneFieldsProps = {
  phone: string;
  whatsappPhone: string;
  sameAsPhone: boolean;
  onWhatsappPhoneChange: (value: string) => void;
  onSameAsPhoneChange: (same: boolean) => void;
  sameAsPhoneLabel: string;
};

const FIELD_SHELL_CLASS = "relative";
const PHONE_INPUT_CLASS = "ommm-input pr-12";
const CHECKBOX_CLASS =
  "absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 rounded border-sand-500/50 accent-sand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500/40";

/** WhatsApp number on signup, with same-as-phone toggle inside the field. */
export function RegisterWhatsappPhoneFields({
  phone,
  whatsappPhone,
  sameAsPhone,
  onWhatsappPhoneChange,
  onSameAsPhoneChange,
  sameAsPhoneLabel,
}: RegisterWhatsappPhoneFieldsProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="ommm-label">{sameAsPhoneLabel}</span>
      <div className={FIELD_SHELL_CLASS}>
        <PhoneInputField
          name="whatsappPhone"
          className={PHONE_INPUT_CLASS}
          value={sameAsPhone ? phone : whatsappPhone}
          onValueChange={onWhatsappPhoneChange}
          placeholder={PSEUDO_PHONE}
          disabled={sameAsPhone}
          required={!sameAsPhone}
          autoComplete="tel"
        />
        <input
          type="checkbox"
          checked={sameAsPhone}
          onChange={(event) => onSameAsPhoneChange(event.target.checked)}
          className={CHECKBOX_CLASS}
          aria-label={sameAsPhoneLabel}
        />
      </div>
    </div>
  );
}
