"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { OmmButton } from "@/components/ui/omm-button";
import { CancelGlyph, CheckCircleGlyph } from "@/components/ui/admin-action-glyphs";
import {
  paymentCheckoutReturnPath,
  type PaymentCheckoutSource,
} from "@/lib/payment-checkout-source";

type PaymentResultPanelProps = {
  outcome: "success" | "failed";
  source: PaymentCheckoutSource;
  reference: string | null;
};

export function PaymentResultPanel({
  outcome,
  source,
  reference,
}: PaymentResultPanelProps) {
  const t = useTranslations("userPages.payments.result");
  const tCheckout = useTranslations("userPages.payments.checkout");
  const isSuccess = outcome === "success";
  const returnPath = paymentCheckoutReturnPath(source);
  const retryHref =
    reference !== null
      ? `/user/payments/checkout?${new URLSearchParams({ source, reference }).toString()}`
      : returnPath;

  return (
    <section className="mx-auto max-w-xl rounded-[32px] border border-white/80 bg-white/95 p-6 text-center shadow-[0_24px_70px_-38px_rgba(45,40,35,0.42)] sm:p-8">
      <div
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full border ${
          isSuccess
            ? "border-emerald-200/80 bg-emerald-50/90 text-emerald-800"
            : "border-red-200/80 bg-red-50/90 text-red-800"
        }`}
      >
        {isSuccess ? (
          <CheckCircleGlyph className="h-8 w-8" />
        ) : (
          <CancelGlyph className="h-8 w-8" />
        )}
      </div>

      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-sage-500">
        {tCheckout(`sources.${source}.eyebrow`)}
      </p>
      <h1 className="mt-3 font-serif text-3xl font-normal tracking-tight text-sage-950">
        {isSuccess ? t(`sources.${source}.successTitle`) : t(`sources.${source}.failedTitle`)}
      </h1>
      <p
        className={`mx-auto mt-3 inline-flex rounded-full px-3 py-1 text-xs font-medium ${
          isSuccess ? "bg-emerald-100/80 text-emerald-900" : "bg-red-100/80 text-red-900"
        }`}
      >
        {isSuccess ? t("statusSuccess") : t("statusFailed")}
      </p>
      <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-sage-600">
        {isSuccess ? t(`sources.${source}.successLead`) : t(`sources.${source}.failedLead`)}
      </p>

      {reference !== null ? (
        <div className="mt-8 rounded-[24px] border border-sage-100 bg-paper/70 p-5 text-left">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-sage-500">{t("referenceLabel")}</span>
            <span className="font-mono text-sm text-sage-800">{reference}</span>
          </div>
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href={returnPath}>
          <OmmButton type="button">{t("doneButton")}</OmmButton>
        </Link>
        {!isSuccess ? (
          <Link href={retryHref} className="ommm-cta-ghost inline-flex justify-center">
            {t("retryButton")}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
