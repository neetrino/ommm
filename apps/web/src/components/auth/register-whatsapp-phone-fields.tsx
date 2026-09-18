"use client";

import { PhoneInputField } from "@/components/ui/phone-input-field";
import {
  WhatsappBrandIcon,
  WHATSAPP_BRAND_ICON_SM_CLASS,
} from "@/components/ui/whatsapp-brand-icon";
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

const CHECKBOX_CLASS =
  "h-5 w-5 shrink-0 rounded border-sand-500/50 accent-sand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500/40";

const SAME_AS_PHONE_IDLE_CLASS =
  "flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-sand-500/40 bg-white px-3.5 py-3 shadow-[0_8px_20px_-16px_rgba(45,40,35,0.35)] transition-colors hover:border-sand-500 hover:bg-sand-50";

const SAME_AS_PHONE_ACTIVE_CLASS =
  "flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-mint-500 bg-mint-100 px-3.5 py-3 shadow-[0_8px_20px_-16px_rgba(45,40,35,0.28)]";

/** WhatsApp number on signup: same as phone via a clear tap target, or a separate number. */
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
    <div className="flex flex-col gap-2">
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
      <label className={sameAsPhone ? SAME_AS_PHONE_ACTIVE_CLASS : SAME_AS_PHONE_IDLE_CLASS}>
        <input
          type="checkbox"
          checked={sameAsPhone}
          onChange={(event) => onSameAsPhoneChange(event.target.checked)}
          className={CHECKBOX_CLASS}
        />
        <span className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-sage-900">
          <WhatsappBrandIcon className={WHATSAPP_BRAND_ICON_SM_CLASS} />
          {sameAsPhoneLabel}
        </span>
      </label>
    </div>
  );
}
