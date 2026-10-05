"use client";

import { useTranslations } from "next-intl";
import type { GiftCardMedium } from "@/lib/gift-card-medium";

const FORMAT_OPTIONS = ["DIGITAL", "PHYSICAL"] as const;

type CustomGiftFormatSectionProps = {
  value: GiftCardMedium;
  disabled: boolean;
  feeLabel: string;
  onChange: (value: GiftCardMedium) => void;
};

/** Digital is free. A physical card adds the print fee, noted under that choice. */
export function CustomGiftFormatSection(props: CustomGiftFormatSectionProps) {
  const t = useTranslations("userPages.giftCards.customGift");
  return (
    <fieldset disabled={props.disabled} className="grid gap-2">
      <legend className="ommm-label text-xs uppercase tracking-wide">{t("formatLabel")}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {FORMAT_OPTIONS.map((option) => (
          <FormatChoice
            key={option}
            option={option}
            checked={props.value === option}
            title={option === "DIGITAL" ? t("formatDigital") : t("formatPhysical")}
            hint={
              option === "DIGITAL"
                ? t("formatDigitalHint")
                : t("formatPhysicalHint", { fee: props.feeLabel })
            }
            onChange={props.onChange}
          />
        ))}
      </div>
    </fieldset>
  );
}

function FormatChoice(props: {
  option: GiftCardMedium;
  checked: boolean;
  title: string;
  hint: string;
  onChange: (value: GiftCardMedium) => void;
}) {
  return (
    <label className="flex cursor-pointer flex-col gap-1 rounded-2xl border border-sage-100 bg-white/80 px-4 py-3 transition-[background-color,border-color,box-shadow] hover:border-sage-200 hover:bg-white hover:shadow-sm focus-within:ring-2 focus-within:ring-sage-500/20 has-[:checked]:border-sage-700 has-[:checked]:bg-sage-50 has-[:disabled]:pointer-events-none has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
      <span className="flex items-center gap-3">
        <input
          type="radio"
          name="giftCardMedium"
          value={props.option}
          checked={props.checked}
          className="h-4 w-4 accent-sage-800"
          onChange={() => props.onChange(props.option)}
        />
        <span className="text-sm text-sage-900">{props.title}</span>
      </span>
      <span className="pl-7 text-xs text-sage-500">{props.hint}</span>
    </label>
  );
}
