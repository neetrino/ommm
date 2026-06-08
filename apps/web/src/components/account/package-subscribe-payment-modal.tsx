"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PackageSubscribePlanPicker } from "@/components/account/package-subscribe-plan-picker";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmModalPortal } from "@/components/ui/omm-modal";
import { isApiError, isArcaCheckoutEnabled, startArcaCardCheckout } from "@/lib/arca-checkout";
import { apiFetch } from "@/lib/api";
import {
  MANUAL_PAYMENT_METHODS,
  type ManualPaymentMethod,
} from "@/lib/manual-payment-method";
import type { PackageSubscribePlanOption } from "@/lib/package-subscribe-plan-option";

type PackageSubscribePaymentModalProps = {
  isOpen: boolean;
  locale: string;
  plans: readonly PackageSubscribePlanOption[];
  initialPlanId?: string;
  onClose: () => void;
  onSelectedPlanIdChange?: (planId: string) => void;
};

type ModalStep = "form" | "success";

type SubscribePackageResponse = {
  id: string;
  paymentReference?: string | null;
  requiresArcaCheckout?: boolean;
};

function resolveDefaultPlanId(
  plans: readonly PackageSubscribePlanOption[],
  initialPlanId?: string,
): string {
  if (initialPlanId !== undefined && plans.some((plan) => plan.id === initialPlanId)) {
    return initialPlanId;
  }
  return plans[0]?.id ?? "";
}

export function PackageSubscribePaymentModal({
  isOpen,
  locale,
  plans,
  initialPlanId,
  onClose,
  onSelectedPlanIdChange,
}: PackageSubscribePaymentModalProps) {
  if (!isOpen || plans.length === 0) {
    return null;
  }

  const sessionKey = `${initialPlanId ?? ""}:${plans.map((plan) => plan.id).join(",")}`;

  return (
    <PackageSubscribePaymentModalSession
      key={sessionKey}
      isOpen={isOpen}
      locale={locale}
      plans={plans}
      initialPlanId={initialPlanId}
      onClose={onClose}
      onSelectedPlanIdChange={onSelectedPlanIdChange}
    />
  );
}

function PackageSubscribePaymentModalSession({
  isOpen,
  locale,
  plans,
  initialPlanId,
  onClose,
  onSelectedPlanIdChange,
}: PackageSubscribePaymentModalProps) {
  const t = useTranslations("forms.manualPackagePayment");
  const router = useRouter();
  const titleId = useId();
  const [step, setStep] = useState<ModalStep>("form");
  const [selectedPlanId, setSelectedPlanId] = useState(() =>
    resolveDefaultPlanId(plans, initialPlanId),
  );
  const [paymentMethod, setPaymentMethod] = useState<ManualPaymentMethod>("CARD");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? plans[0];

  function handlePlanSelect(planId: string) {
    setSelectedPlanId(planId);
    onSelectedPlanIdChange?.(planId);
  }

  async function onConfirm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPlan) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await apiFetch<SubscribePackageResponse>("/packages/me/subscribe", {
        method: "POST",
        body: JSON.stringify({
          planId: selectedPlan.id,
          paymentMethod,
        }),
      });
      if (
        paymentMethod === "CARD" &&
        isArcaCheckoutEnabled() &&
        result.requiresArcaCheckout === true &&
        result.paymentReference
      ) {
        await startArcaCardCheckout(result.paymentReference, locale);
        return;
      }
      setStep("success");
      router.refresh();
    } catch (err) {
      setError(isApiError(err) ? err.message : t("submitFailed"));
    } finally {
      setBusy(false);
    }
  }

  function handleClose() {
    if (busy) {
      return;
    }
    onClose();
  }

  function handleDone() {
    onClose();
  }

  return (
    <OmmModalPortal
      isOpen={isOpen}
      onClose={handleClose}
      backdropAriaLabel={t("closeModal")}
      closeDisabled={busy}
      overlayClassName="ommm-modal-overlay z-[110]"
      panelClassName="w-full max-w-lg rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-[0_30px_70px_-30px_rgba(45,40,35,0.45)] backdrop-blur-md"
    >
      {step === "success" ? (
        <SuccessPanel
          titleId={titleId}
          paymentMethod={paymentMethod}
          onDone={handleDone}
        />
      ) : (
        <form onSubmit={(event) => void onConfirm(event)} className="flex flex-col gap-4">
          <h2 id={titleId} className="font-serif text-2xl font-normal text-sage-900">
            {t("title")}
          </h2>
          <p className="text-sm text-sage-600">{t("lead")}</p>
          <PackageSubscribePlanPicker
            plans={plans}
            selectedPlanId={selectedPlan.id}
            locale={locale}
            onSelect={handlePlanSelect}
          />
          <PaymentMethodPicker
            value={paymentMethod}
            onChange={setPaymentMethod}
            disabled={busy}
          />
          {error !== null ? (
            <p className="text-sm text-red-800" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap justify-end gap-3">
            <OmmButton
              type="button"
              variant="secondary"
              size="md"
              onClick={handleClose}
              disabled={busy}
            >
              {t("cancel")}
            </OmmButton>
            <OmmButton type="submit" variant="primary" size="md" disabled={busy}>
              {busy ? t("submitting") : t("confirm")}
            </OmmButton>
          </div>
        </form>
      )}
    </OmmModalPortal>
  );
}

type PaymentMethodPickerProps = {
  value: ManualPaymentMethod;
  onChange: (method: ManualPaymentMethod) => void;
  disabled: boolean;
};

function PaymentMethodPicker({ value, onChange, disabled }: PaymentMethodPickerProps) {
  const t = useTranslations("forms.manualPackagePayment");

  return (
    <fieldset className="space-y-2">
      <legend className="ommm-label text-xs uppercase tracking-wide">{t("methodLegend")}</legend>
      {MANUAL_PAYMENT_METHODS.map((method) => (
        <label
          key={method}
          className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/60 bg-white/50 px-3 py-2.5 transition-[background-color,border-color,box-shadow] hover:border-white/80 hover:bg-white/70 hover:shadow-sm focus-within:border-sand-500/40 focus-within:bg-sand-50/40 focus-within:ring-2 focus-within:ring-sand-500/20 has-[:disabled]:pointer-events-none has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50"
        >
          <input
            type="radio"
            name="payment-method"
            value={method}
            checked={value === method}
            onChange={() => onChange(method)}
            disabled={disabled}
          />
          <span className="text-sm text-sage-700">{t(`methods.${method}`)}</span>
        </label>
      ))}
    </fieldset>
  );
}

type SuccessPanelProps = {
  titleId: string;
  paymentMethod: ManualPaymentMethod;
  onDone: () => void;
};

function SuccessPanel({ titleId, paymentMethod, onDone }: SuccessPanelProps) {
  const t = useTranslations("forms.manualPackagePayment");

  return (
    <div className="flex flex-col gap-4">
      <h2 id={titleId} className="font-serif text-2xl font-normal text-sage-900">
        {t("successTitle")}
      </h2>
      <p className="text-sm text-sage-600">{t("successLead")}</p>
      <p className="text-sm text-sage-600">
        {t("successMethod", { method: t(`methods.${paymentMethod}`) })}
      </p>
      <div className="flex justify-end">
        <OmmButton type="button" variant="primary" size="md" onClick={onDone}>
          {t("done")}
        </OmmButton>
      </div>
    </div>
  );
}
