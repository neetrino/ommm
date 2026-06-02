"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  OMM_MODAL_OVERLAY_CLASS,
  OmmModalPortal,
} from "@/components/ui/omm-modal";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";
import {
  MANUAL_PAYMENT_METHODS,
  type ManualPaymentMethod,
} from "@/lib/manual-payment-methods";
import { formatAmdFromCents } from "@/lib/price-amd";

export type PackageManualPaymentPlan = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  billingPeriod: string;
  isUnlimited: boolean;
  sessionsPerMonth: number | null;
  periodDays: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  plan: PackageManualPaymentPlan;
  locale: string;
};

type ManualPaymentResponse = {
  id: string;
  paymentMethod: ManualPaymentMethod;
  status: string;
};

export function PackageManualPaymentModal({
  isOpen,
  onClose,
  plan,
  locale,
}: Props) {
  const t = useTranslations("forms.manualPackagePayment");
  const router = useRouter();
  const [method, setMethod] = useState<ManualPaymentMethod | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<ManualPaymentResponse | null>(null);

  function handleClose() {
    if (busy) {
      return;
    }
    setMethod(null);
    setError(null);
    setSuccess(null);
    onClose();
  }

  async function confirm() {
    if (!method || busy) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const payment = await apiFetch<ManualPaymentResponse>(
        "/payments/manual/package",
        {
          method: "POST",
          body: JSON.stringify({ planId: plan.id, paymentMethod: method }),
        },
      );
      setSuccess(payment);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t("submitFailed"));
    } finally {
      setBusy(false);
    }
  }

  const periodLabel = plan.isUnlimited
    ? t("unlimitedClasses")
    : t("sessionsPerPeriod", { count: plan.sessionsPerMonth ?? 0 });

  return (
    <OmmModalPortal
      isOpen={isOpen}
      onClose={handleClose}
      backdropAriaLabel={t("closeModal")}
      closeDisabled={busy}
      overlayClassName={`${OMM_MODAL_OVERLAY_CLASS} [&_.ommm-modal-backdrop]:bg-sage-900/65 [&_.ommm-modal-backdrop]:backdrop-blur-sm`}
      panelClassName="max-w-lg rounded-2xl border border-sage-200 bg-white p-6 shadow-[0_24px_64px_-12px_rgba(45,40,35,0.35)] ring-1 ring-sage-900/10"
    >
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-sage-900">{t("title")}</h2>
            <p className="mt-1 text-sm text-sage-600">{t("lead")}</p>
          </div>
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-2xl leading-none text-sage-500 hover:bg-sage-100 disabled:opacity-50"
            onClick={handleClose}
            disabled={busy}
            aria-label={t("closeModal")}
          >
            ×
          </button>
        </div>

        <div className="space-y-2 rounded-2xl border border-sage-200 bg-sand-50 p-4 text-sm">
          <p className="font-semibold text-sage-800">{plan.name}</p>
          {plan.description ? (
            <p className="text-sage-600">{plan.description}</p>
          ) : null}
          <p className="text-sage-700">
            <span className="text-black">֏</span>{" "}
            {formatAmdFromCents(plan.priceCents, locale).replace(/^֏\s*/, "")}
          </p>
          <p className="text-sage-500">
            {plan.billingPeriod} · {periodLabel} ·{" "}
            {t("periodDays", { days: plan.periodDays })}
          </p>
        </div>

        {success ? (
          <div className="rounded-xl border border-mint-200 bg-mint-50 p-4 text-sm text-mint-900">
            <p className="font-medium">{t("successTitle")}</p>
            <p className="mt-2">{t("successLead")}</p>
            <p className="mt-1">
              {t("successMethod", {
                method: t(`methods.${success.paymentMethod}`),
              })}
            </p>
            <OmmButton
              type="button"
              variant="primary"
              className="mt-4 w-full"
              onClick={handleClose}
            >
              {t("done")}
            </OmmButton>
          </div>
        ) : (
          <>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-sage-800">
                {t("methodLegend")}
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {MANUAL_PAYMENT_METHODS.map((value) => {
                  const selected = method === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={busy}
                      aria-pressed={selected}
                      className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 disabled:opacity-50 ${
                        selected
                          ? "border-sage-700 bg-sage-800 text-white shadow-sm"
                          : "border-sage-300 bg-white text-sage-900 shadow-sm hover:border-sage-500 hover:bg-sand-50"
                      }`}
                      onClick={() => setMethod(value)}
                    >
                      {t(`methods.${value}`)}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {error ? (
              <p className="text-sm text-amber-900" role="alert">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <OmmButton
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={handleClose}
              >
                {t("cancel")}
              </OmmButton>
              <OmmButton
                type="button"
                variant="primary"
                disabled={busy || method === null}
                onClick={() => void confirm()}
              >
                {busy ? t("submitting") : t("confirm")}
              </OmmButton>
            </div>
          </>
        )}
      </div>
    </OmmModalPortal>
  );
}
