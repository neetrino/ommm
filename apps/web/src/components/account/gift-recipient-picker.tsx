"use client";

import { useTranslations } from "next-intl";
import type { CustomGiftDelivery } from "@/components/account/custom-gift-options";
import { FormErrorBanner, formFieldInputClass } from "@/components/ui/form-validation";
import { PhoneInputField } from "@/components/ui/phone-input-field";

type GiftRecipientEmailFieldProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  validationMessage?: string | null;
  /** Drops the extra card chrome when the field sits inside another surface. */
  embedded?: boolean;
};

/** Email address that receives the gift code after payment. */
export function GiftRecipientEmailField({
  value,
  onChange,
  disabled = false,
  validationMessage = null,
  embedded = false,
}: GiftRecipientEmailFieldProps) {
  const t = useTranslations("userPages.giftCards.purchaseForm");
  const chrome = recipientEmailChrome(embedded);

  return (
    <section className={chrome.section}>
      <p className={chrome.title}>{t("recipientSectionLabel")}</p>
      <p className={chrome.hint}>{t("recipientSectionHint")}</p>
      <label className={`${chrome.fields} ommm-label flex flex-col gap-2`}>
        {t("recipientSearchLabel")}
        <input
          type="email"
          value={value}
          disabled={disabled}
          data-form-field="recipient"
          aria-invalid={validationMessage !== null}
          className={formFieldInputClass(validationMessage !== null, "ommm-input")}
          placeholder={t("recipientSearchPlaceholder")}
          autoComplete="email"
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
      <FormErrorBanner message={validationMessage} variant="inline" />
    </section>
  );
}

type GiftDeliveryFieldsProps = {
  delivery: CustomGiftDelivery;
  email: string;
  phone: string;
  disabled: boolean;
  validationMessage: string | null;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
};

/** Destination field for the chosen delivery: email, WhatsApp number, or print. */
export function GiftDeliveryFields(props: GiftDeliveryFieldsProps) {
  const t = useTranslations("userPages.giftCards.purchaseForm");
  if (props.delivery === "PRINT") {
    return <p className="text-sm leading-relaxed text-sage-600">{t("printSectionHint")}</p>;
  }
  if (props.delivery === "WHATSAPP") {
    return (
      <GiftRecipientPhoneField
        embedded
        value={props.phone}
        disabled={props.disabled}
        validationMessage={props.validationMessage}
        onChange={props.onPhoneChange}
      />
    );
  }
  return (
    <GiftRecipientEmailField
      embedded
      value={props.email}
      disabled={props.disabled}
      validationMessage={props.validationMessage}
      onChange={props.onEmailChange}
    />
  );
}

/** WhatsApp number that receives the gift code after payment. */
export function GiftRecipientPhoneField({
  value,
  onChange,
  disabled = false,
  validationMessage = null,
  embedded = false,
}: GiftRecipientEmailFieldProps) {
  const t = useTranslations("userPages.giftCards.purchaseForm");
  const chrome = recipientEmailChrome(embedded);
  return (
    <section className={chrome.section}>
      <p className={chrome.title}>{t("whatsappSectionLabel")}</p>
      <p className={chrome.hint}>{t("whatsappSectionHint")}</p>
      <label className={`${chrome.fields} ommm-label flex flex-col gap-2`}>
        {t("whatsappPhoneLabel")}
        <PhoneInputField
          value={value}
          disabled={disabled}
          data-form-field="recipient"
          aria-invalid={validationMessage !== null}
          className={formFieldInputClass(validationMessage !== null, "ommm-input")}
          autoComplete="tel"
          onValueChange={onChange}
        />
      </label>
      <FormErrorBanner message={validationMessage} variant="inline" />
    </section>
  );
}

function recipientEmailChrome(embedded: boolean): {
  section: string;
  title: string;
  hint: string;
  fields: string;
} {
  if (!embedded) {
    return {
      section:
        "rounded-[24px] border border-white/60 bg-white/75 p-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.18)] sm:p-5",
      title: "text-sm font-medium text-sage-800",
      hint: "mt-1 text-xs leading-5 text-sage-500",
      fields: "mt-4",
    };
  }
  return {
    section: "flex flex-col gap-3 rounded-[20px] border border-white/70 bg-white/55 p-4",
    title: "ommm-label text-xs uppercase tracking-wide",
    hint: "text-sm leading-relaxed text-sage-600",
    fields: "",
  };
}
