"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { OmmButton } from "@/components/ui/omm-button";
import { isApiError, confirmSimulatedCardCheckout, isArcaCheckoutEnabled, startArcaCardCheckout } from "@/lib/arca-checkout";
import { ApiError, apiFetch } from "@/lib/api";
import type { ManualPaymentMethod } from "@/lib/manual-payment-method";
import type { PaymentCheckoutSource } from "@/lib/payment-checkout-source";
import { MARKETING_SCHEDULE_PATH } from "@/lib/auth-redirect";

type CheckoutPaymentMethod = Extract<ManualPaymentMethod, "CARD" | "CASH">;

const CHECKOUT_PAYMENT_METHODS: readonly CheckoutPaymentMethod[] = ["CARD", "CASH"];

type PendingPaymentCheckoutFormProps = {
  amountLabel: string;
  paymentReference: string | null;
  source: PaymentCheckoutSource;
};

type PaymentStep = "summary" | "method" | "cashPending";

export function PendingPaymentCheckoutForm({
  amountLabel,
  paymentReference,
  source,
}: PendingPaymentCheckoutFormProps) {
  const locale = useLocale();
  const t = useTranslations("userPages.payments.checkout");
  const router = useRouter();
  const [step, setStep] = useState<PaymentStep>("summary");
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>("CARD");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmPayment() {
    if (paymentReference === null) {
      setError(t("missingReferenceError"));
      return;
    }

    if (paymentMethod === "CASH") {
      await confirmCashPayment(paymentReference);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      if (isArcaCheckoutEnabled()) {
        await startArcaCardCheckout(paymentReference, locale);
        return;
      }
      await confirmSimulatedCardCheckout(paymentReference, source);
      const params = new URLSearchParams({ source, reference: paymentReference });
      router.push(`/user/payments/success?${params.toString()}`);
      router.refresh();
    } catch (err) {
      setError(isApiError(err) ? err.message : t("payFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function confirmCashPayment(reference: string) {
    setBusy(true);
    setError(null);
    try {
      const path = resolveCashConfirmPath(source, reference);
      await apiFetch(path, {
        method: "POST",
        body: JSON.stringify({ paymentMethod: "CASH" }),
      });
      setStep("cashPending");
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
        {t(`sources.${source}.eyebrow`)}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-sage-950">
        {step === "cashPending" ? t("cashPendingTitle") : t(`sources.${source}.title`)}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-sage-600">
        {step === "cashPending" ? t("cashPendingLead") : t("lead")}
      </p>

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
        <Link href={resolveBackPath(source)} className="ommm-cta-ghost inline-flex justify-center">
          {step === "cashPending" ? t("doneButton") : t("backButton")}
        </Link>
      </div>
    </section>
  );
}

function resolveCashConfirmPath(source: PaymentCheckoutSource, reference: string): string {
  if (source === "gift") {
    return `/payments/checkout/gift/${reference}/confirm`;
  }
  if (source === "dropin") {
    return `/payments/checkout/dropin/${reference}/confirm`;
  }
  throw new Error(`Cash confirm is not supported for source: ${source}`);
}

function resolveBackPath(source: PaymentCheckoutSource): string {
  if (source === "gift") {
    return "/user/gift-cards";
  }
  if (source === "dropin") {
    return MARKETING_SCHEDULE_PATH;
  }
  return "/user/payments";
}

type PaymentMethodPickerProps = {
  value: CheckoutPaymentMethod;
  onChange: (value: CheckoutPaymentMethod) => void;
  disabled: boolean;
};

function PaymentMethodPicker({ value, onChange, disabled }: PaymentMethodPickerProps) {
  const t = useTranslations("userPages.payments.checkout");
  return (
    <fieldset className="mt-6 text-left" disabled={disabled}>
      <legend className="text-sm font-medium text-sage-700">{t("methodLabel")}</legend>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {CHECKOUT_PAYMENT_METHODS.map((method) => (
          <label
            key={method}
            className="flex cursor-pointer items-center gap-3 rounded-2xl border border-sage-100 bg-white/80 px-4 py-3 text-sm text-sage-800 transition-[background-color,border-color,box-shadow] hover:border-sage-200 hover:bg-white hover:shadow-sm focus-within:ring-2 focus-within:ring-sage-500/20 has-[:checked]:border-sage-700 has-[:checked]:bg-sage-50 has-[:disabled]:pointer-events-none has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50"
          >
            <input
              type="radio"
              name="checkoutPaymentMethod"
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
