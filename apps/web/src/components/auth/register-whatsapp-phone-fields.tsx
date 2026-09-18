"use client";

import {
  WhatsappBrandIcon,
  WHATSAPP_BRAND_ICON_SM_CLASS,
} from "@/components/ui/whatsapp-brand-icon";
import { PhoneInputWithSameToggle } from "@/components/ui/phone-input-with-same-toggle";
import { PSEUDO_PHONE } from "@/lib/pseudo-form-placeholders";

type RegisterWhatsappPhoneFieldsProps = {
  phone: string;
  whatsappPhone: string;
  sameAsPhone: boolean;
  onWhatsappPhoneChange: (value: string) => void;
  onSameAsPhoneChange: (same: boolean) => void;
  sameAsPhoneLabel: string;
};

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
      <span className="ommm-label inline-flex items-center gap-1.5">
        <WhatsappBrandIcon className={WHATSAPP_BRAND_ICON_SM_CLASS} />
        {sameAsPhoneLabel}
      </span>
      <PhoneInputWithSameToggle
        name="whatsappPhone"
        className="ommm-input"
        phone={phone}
        value={whatsappPhone}
        sameAsPhone={sameAsPhone}
        sameAsPhoneLabel={sameAsPhoneLabel}
        onValueChange={onWhatsappPhoneChange}
        onSameAsPhoneChange={onSameAsPhoneChange}
        placeholder={PSEUDO_PHONE}
        required={!sameAsPhone}
        autoComplete="tel"
      />
    </div>
  );
}
