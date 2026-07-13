"use client";

import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import {
  ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS,
  ADMIN_DETAILS_SHEET_DETAIL_VALUE_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import {
  ADMIN_CLIENT_PACKAGE_PAYMENT_METHODS,
  type AdminClientPackagePaymentMethod,
} from "@/lib/manual-payment-method";
import { formatAmdFromCents } from "@/lib/price-amd";
import type { PublicPackagePlan } from "@/lib/public-package-plan";

type AdminClientPackagePurchaseConfirmProps = {
  formId: string;
  clientName: string;
  locale: string;
  paymentMethod: AdminClientPackagePaymentMethod;
  disabled?: boolean;
  plan: PublicPackagePlan;
  onPaymentMethodChange: (method: AdminClientPackagePaymentMethod) => void;
  onConfirm: (event: FormEvent<HTMLFormElement>) => void;
};

export function AdminClientPackagePurchaseConfirm({
  formId,
  clientName,
  locale,
  paymentMethod,
  disabled = false,
  plan,
  onPaymentMethodChange,
  onConfirm,
}: AdminClientPackagePurchaseConfirmProps) {
  const t = useTranslations("adminPages.clients");
  const tFinance = useTranslations("adminPages.finance");
  const confirmHint =
    paymentMethod === "CASH"
      ? t("packages.confirmCashHint")
      : t("packages.confirmTerminalHint");
  const sessionsValue = plan.isUnlimited
    ? t("packages.unlimited")
    : String(plan.sessionsPerMonth ?? "—");
  const priceLabel = formatAmdFromCents(
    plan.finalPriceCents ?? plan.priceCents,
    locale,
  );

  return (
    <form id={formId} className="space-y-5" onSubmit={onConfirm}>
      <p className="text-sm text-sage-600">{t("packages.confirmLead")}</p>

      <article className="overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-b from-white/95 to-sand-50/50 shadow-[0_16px_40px_-28px_rgba(45,40,35,0.35)]">
        <div className="border-b border-white/70 bg-white/55 px-5 py-4">
          <p className={ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS}>
            {t("packages.clientName")}
          </p>
          <p className={`mt-1 ${ADMIN_DETAILS_SHEET_DETAIL_VALUE_CLASS}`}>
            {clientName}
          </p>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div className="min-w-0">
            <h3 className="font-serif text-2xl font-normal leading-snug text-sage-900">
              {plan.name}
            </h3>
            <p className="mt-1 text-sm text-sage-600">{plan.categoryName}</p>
          </div>

          <div>
            <p className={ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS}>
              {t("packages.finalPrice")}
            </p>
            <p className="mt-1 font-serif text-3xl font-normal tracking-tight text-sage-900">
              {priceLabel}
            </p>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <ConfirmField
              label={t("packages.duration")}
              value={t("packages.periodDays", { days: plan.periodDays })}
            />
            <ConfirmField
              label={t("packages.includedSessions")}
              value={sessionsValue}
            />
            <ConfirmField
              label={t("packages.category")}
              value={plan.categoryName}
            />
          </dl>
        </div>
      </article>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-sage-800">
          {t("packages.paymentMethodLegend")}
        </legend>
        <div className="space-y-2">
          {ADMIN_CLIENT_PACKAGE_PAYMENT_METHODS.map((method) => (
            <label
              key={method}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/60 bg-white/70 px-4 py-3"
            >
              <input
                type="radio"
                name="admin-client-package-payment-method"
                value={method}
                checked={paymentMethod === method}
                disabled={disabled}
                onChange={() => onPaymentMethodChange(method)}
                className="h-4 w-4 accent-sand-600"
              />
              <span className="text-sm text-sage-800">
                {tFinance(`paymentMethods.${method}`)}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="rounded-2xl border border-mint-200/80 bg-mint-50/90 px-4 py-3 text-sm text-sage-800 shadow-[0_12px_28px_-18px_rgba(45,40,35,0.18)]">
        {confirmHint}
      </div>
    </form>
  );
}

function ConfirmField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/70 bg-white/60 px-3.5 py-3">
      <dt className={ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS}>{label}</dt>
      <dd className={`mt-1 ${ADMIN_DETAILS_SHEET_DETAIL_VALUE_CLASS}`}>{value}</dd>
    </div>
  );
}
