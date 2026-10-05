"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { CustomGiftFormatSection } from "@/components/account/custom-gift-format";
import { CustomGiftForm } from "@/components/account/custom-gift-form-view";
import {
  composerCopy,
  continueGiftToPayment,
  submitCustomGift,
} from "@/components/account/custom-gift-composer-submit";
import {
  CustomGiftDeliverySection,
  CustomGiftKindSection,
  type CustomGiftDelivery,
  type CustomGiftKind,
} from "@/components/account/custom-gift-options";
import { useGiftAmountPolicy } from "@/components/account/use-gift-amount-policy";
import { useRouter } from "@/i18n/navigation";
import { CUSTOM_GIFT_CARD_MAX_AMD, CUSTOM_GIFT_CARD_MIN_AMD } from "@/lib/custom-gift-card.constants";
import { customGiftAmountBelowMin } from "@/lib/custom-gift-checkout";
import { giftPayableAmd, PHYSICAL_GIFT_CARD_FEE_AMD, type GiftCardMedium } from "@/lib/gift-card-medium";
import { formatAmdFromCents, parseAmdMoneyInput } from "@/lib/price-amd";

type CustomGiftComposerProps = {
  locale: string;
};

export function CustomGiftComposer({ locale }: CustomGiftComposerProps) {
  const t = useTranslations("userPages.giftCards.customGift");
  const router = useRouter();
  const amountId = useId();
  const [amountRaw, setAmountRaw] = useState(String(CUSTOM_GIFT_CARD_MIN_AMD));
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [kind, setKind] = useState<CustomGiftKind>("FIXED_VALUE");
  const [classTypeId, setClassTypeId] = useState("");
  const [classSessions, setClassSessions] = useState("1");
  const [classPackageId, setClassPackageId] = useState("");
  const [classPriceAmd, setClassPriceAmd] = useState<number | null>(null);
  const [delivery, setDelivery] = useState<CustomGiftDelivery>("EMAIL");
  const [format, setFormat] = useState<GiftCardMedium>("DIGITAL");
  const [error, setError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [recipientError, setRecipientError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const policy = useGiftAmountPolicy(locale);
  const minLabel = formatAmdFromCents(policy.minAmd, locale);
  const maxLabel = formatAmdFromCents(CUSTOM_GIFT_CARD_MAX_AMD, locale);
  const selectedAmountAmd = parseAmdMoneyInput(amountRaw);
  const faceAmd = kind === "FIXED_CLASS" ? classPriceAmd : selectedAmountAmd;
  const payableAmd = giftPayableAmd({ faceAmd, medium: format });

  return (
    <CustomGiftForm
      amountId={amountId}
      amountRaw={amountRaw}
      recipientEmail={recipientEmail}
      recipientPhone={recipientPhone}
      delivery={delivery}
      error={error}
      amountError={amountError}
      recipientError={recipientError}
      busy={busy}
      minLabel={minLabel}
      amountChoices={policy.choices}
      selectedAmountAmd={selectedAmountAmd}
      showAmount={kind === "FIXED_VALUE"}
      priceLabel={payableAmd === null ? null : formatAmdFromCents(payableAmd, locale)}
      leading={
        <>
          <CustomGiftKindSection
            kind={kind}
            classTypeId={classTypeId}
            classSessions={classSessions}
            delivery={delivery}
            disabled={busy}
            onKindChange={setKind}
            onClassTypeChange={setClassTypeId}
            onClassSessionsChange={setClassSessions}
            onPackagePlanChange={setClassPackageId}
            onQuotedPriceChange={setClassPriceAmd}
            onDeliveryChange={setDelivery}
            t={t}
          />
          <CustomGiftFormatSection
            value={format}
            disabled={busy}
            feeLabel={formatAmdFromCents(PHYSICAL_GIFT_CARD_FEE_AMD, locale)}
            onChange={setFormat}
          />
        </>
      }
      onAmountChange={(value) => {
        setAmountRaw(value);
        setAmountError(customGiftAmountBelowMin(value) ? t("amountMin", { min: minLabel }) : null);
      }}
      onRecipientEmailChange={(value) => {
        setRecipientEmail(value);
        setRecipientError(null);
      }}
      onRecipientPhoneChange={(value) => {
        setRecipientPhone(value);
        setRecipientError(null);
      }}
      extras={
        <CustomGiftDeliverySection
          kind={kind}
          classTypeId={classTypeId}
          classSessions={classSessions}
          delivery={delivery}
          disabled={busy}
          onKindChange={setKind}
          onClassTypeChange={setClassTypeId}
          onClassSessionsChange={setClassSessions}
          onPackagePlanChange={setClassPackageId}
          onQuotedPriceChange={setClassPriceAmd}
          onDeliveryChange={(value) => {
            setDelivery(value);
            setRecipientError(null);
          }}
          t={t}
        />
      }
      onSubmit={(event) => {
        void submitCustomGift(event, {
          amountRaw,
          recipientEmail,
          recipientPhone,
          kind,
          classTypeId,
          classSessions,
          classPackageId,
          delivery,
          format,
          classRequired: t("classRequired"),
          checkoutFailed: t("checkoutFailed"),
          copy: composerCopy(t, minLabel, maxLabel),
          setError,
          setAmountError,
          setRecipientError,
          setBusy,
          goToCheckout: (reference) =>
            continueGiftToPayment(reference, locale, (href) => {
              router.push(href);
              router.refresh();
            }),
        });
      }}
    />
  );
}
