"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";
import type { ManualPaymentMethod } from "@/lib/manual-payment-method";

type FakeGiftPaymentFormProps = {
  amountLabel: string;
  paymentReference: string | null;
};

type PaymentStep = "summary" | "method" | "success" | "cashPending";
type GiftPaymentMethod = Extract<ManualPaymentMethod, "CARD" | "CASH">;

const GIFT_PAYMENT_METHODS: readonly GiftPaymentMethod[] = ["CARD", "CASH"];

export function FakeGiftPaymentForm({
  amountLabel,
  paymentReference,
}: FakeGiftPaymentFormProps) {
  const t = useTranslations("userPages.giftCards.fakePayment");
  const router = useRouter();
  const [step, setStep] = useState<PaymentStep>("summary");
  const [paymentMethod, setPaymentMethod] = useState<GiftPaymentMethod>("CARD");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmPayment() {
    if (paymentReference === null) {
      setError(t("missingReferenceError"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/payments/checkout/gift/${paymentReference}/confirm`, {
        method: "POST",
        body: JSON.stringify({ paymentMethod }),
      });
      setStep(paymentMethod === "CASH" ? "cashPending" : "success");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("payFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl rounded-[32px] border border-white/80 bg-white/95 p-6 text-center shadow-[0_24px_70px_-38px_rgba(45,40,35,0.42)] sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sage-500">
        {t("eyebrow")}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-sage-950">
        {step === "success"
          ? t("successTitle")
          : step === "cashPending"
            ? t("cashPendingTitle")
            : t("title")}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-sage-600">
        {step === "success"
          ? t("successLead")
          : step === "cashPending"
            ? t("cashPendingLead")
            : t("lead")}
      </p>

      <PaymentSummary amountLabel={amountLabel} paymentReference={paymentReference} />

      {step === "method" ? (
        <PaymentMethodPicker
          value={paymentMethod}
          onChange={setPaymentMethod}
          disabled={busy}
        />
      ) : null}

      {error !== null ? (
        <p className="mt-4 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {step === "summary" ? (
          <OmmButton type="button" onClick={() => setStep("method")}>
            {t("payButton")}
          </OmmButton>
        ) : null}
        {step === "method" ? (
          <OmmButton type="button" onClick={() => void confirmPayment()} disabled={busy}>
            {busy ? t("payingButton") : t("payButton")}
          </OmmButton>
        ) : null}
        <Link href="/user/gift-cards" className="ommm-cta-ghost inline-flex justify-center">
          {step === "success" || step === "cashPending" ? t("doneButton") : t("backButton")}
        </Link>
      </div>
    </section>
  );
}

function PaymentSummary({
  amountLabel,
  paymentReference,
}: FakeGiftPaymentFormProps) {
  const t = useTranslations("userPages.giftCards.fakePayment");
  return (
    <div className="mt-8 rounded-[24px] border border-sage-100 bg-paper/70 p-5 text-left">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-sage-500">{t("amountLabel")}</span>
        <strong className="text-2xl text-sage-950">{amountLabel}</strong>
      </div>
      <div className="mt-4 flex items-center justify-between gap-4 border-t border-sage-100 pt-4">
        <span className="text-sm text-sage-500">{t("referenceLabel")}</span>
        <span className="font-mono text-sm text-sage-800">
          {paymentReference ?? t("missingReference")}
        </span>
      </div>
    </div>
  );
}

type PaymentMethodPickerProps = {
  value: GiftPaymentMethod;
  onChange: (value: GiftPaymentMethod) => void;
  disabled: boolean;
};

function PaymentMethodPicker({
  value,
  onChange,
  disabled,
}: PaymentMethodPickerProps) {
  const t = useTranslations("userPages.giftCards.fakePayment");
  return (
    <fieldset className="mt-6 text-left" disabled={disabled}>
      <legend className="text-sm font-medium text-sage-700">{t("methodLabel")}</legend>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {GIFT_PAYMENT_METHODS.map((method) => (
          <label
            key={method}
            className="flex cursor-pointer items-center gap-3 rounded-2xl border border-sage-100 bg-white/80 px-4 py-3 text-sm text-sage-800 transition-[background-color,border-color,box-shadow] hover:border-sage-200 hover:bg-white hover:shadow-sm focus-within:ring-2 focus-within:ring-sage-500/20 has-[:checked]:border-sage-700 has-[:checked]:bg-sage-50 has-[:disabled]:pointer-events-none has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50"
          >
            <input
              type="radio"
              name="giftPaymentMethod"
              value={method}
              checked={value === method}
              onChange={() => onChange(method)}
              className="h-4 w-4 accent-sage-800"
            />
            <span>{t(`methods.${method}`)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
