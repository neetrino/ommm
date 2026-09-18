"use client";

import { PhoneInputField } from "@/components/ui/phone-input-field";
import { PSEUDO_PHONE } from "@/lib/pseudo-form-placeholders";

type RegisterWhatsappPhoneFieldsProps = {
  phone: string;
  whatsappPhone: string;
  sameAsPhone: boolean;
  onWhatsappPhoneChange: (value: string) => void;
  onSameAsPhoneChange: (same: boolean) => void;
  whatsappLabel: string;
  sameAsPhoneLabel: string;
};

const SAME_AS_PHONE_CHECKBOX_CLASS =
  "h-4 w-4 rounded border-sand-500/40 accent-sand-500 focus:ring-sand-500/30";

/** WhatsApp number on signup: same as phone via checkbox, or a separate number. */
export function RegisterWhatsappPhoneFields({
  phone,
  whatsappPhone,
  sameAsPhone,
  onWhatsappPhoneChange,
  onSameAsPhoneChange,
  whatsappLabel,
  sameAsPhoneLabel,
}: RegisterWhatsappPhoneFieldsProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex flex-col gap-1.5">
        <span className="ommm-label">{whatsappLabel}</span>
        <PhoneInputField
          name="whatsappPhone"
          className="ommm-input"
          value={sameAsPhone ? phone : whatsappPhone}
          onValueChange={onWhatsappPhoneChange}
          placeholder={PSEUDO_PHONE}
          disabled={sameAsPhone}
          required={!sameAsPhone}
          autoComplete="tel"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-sage-700">
        <input
          type="checkbox"
          checked={sameAsPhone}
          onChange={(event) => onSameAsPhoneChange(event.target.checked)}
          className={SAME_AS_PHONE_CHECKBOX_CLASS}
        />
        {sameAsPhoneLabel}
      </label>
    </div>
  );
}
