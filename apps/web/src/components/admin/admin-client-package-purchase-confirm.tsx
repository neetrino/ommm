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
import { AdminClientPackagePromoField } from "@/components/admin/admin-client-package-promo-field";
import { formatAmdFromCents } from "@/lib/price-amd";
import type { PromoPreview } from "@/lib/preview-promo-code";
import type { PublicPackagePlan } from "@/lib/public-package-plan";

type AdminClientPackagePurchaseConfirmProps = {
  formId: string;
  clientId: string;
  clientName: string;
  locale: string;
  paymentMethod: AdminClientPackagePaymentMethod;
  disabled?: boolean;
  plan: PublicPackagePlan;
  promo: PromoPreview | null;
  onPromoChange: (preview: PromoPreview | null) => void;
  onPaymentMethodChange: (method: AdminClientPackagePaymentMethod) => void;
  onConfirm: (event: FormEvent<HTMLFormElement>) => void;
};

export function AdminClientPackagePurchaseConfirm({
  formId,
  clientId,
  clientName,
  locale,
  paymentMethod,
  disabled = false,
  plan,
  promo,
  onPromoChange,
  onPaymentMethodChange,
  onConfirm,
}: AdminClientPackagePurchaseConfirmProps) {
  const view = usePackageConfirmView({ clientName, locale, paymentMethod, plan, promo });

  return (
    <form id={formId} className="space-y-5" onSubmit={onConfirm}>
      <p className="text-sm text-sage-600">{view.lead}</p>
      <PackagePurchaseSummary {...view.summary} />
      <PaymentMethodChoices
        legend={view.paymentLegend}
        paymentMethod={paymentMethod}
        disabled={disabled}
        labelFor={view.paymentLabel}
        onChange={onPaymentMethodChange}
      />

      {paymentMethod === "INFLUENCER" ? null : (
        <AdminClientPackagePromoField
          clientId={clientId}
          planId={plan.id}
          locale={locale}
          disabled={disabled}
          applied={promo}
          onChange={onPromoChange}
        />
      )}

      <div className="rounded-2xl border border-mint-200/80 bg-mint-50/90 px-4 py-3 text-sm text-sage-800 shadow-[0_12px_28px_-18px_rgba(45,40,35,0.18)]">
        {view.hint}
      </div>
    </form>
  );
}

function usePackageConfirmView({
  clientName,
  locale,
  paymentMethod,
  plan,
  promo,
}: {
  clientName: string;
  locale: string;
  paymentMethod: AdminClientPackagePaymentMethod;
  plan: PublicPackagePlan;
  promo: PromoPreview | null;
}) {
  const t = useTranslations("adminPages.clients");
  const tFinance = useTranslations("adminPages.finance");
  const catalogCents = plan.finalPriceCents ?? plan.priceCents;
  const charge = promo !== null ? promo.amountAfterCouponCents : catalogCents;
  const influencer = paymentMethod === "INFLUENCER";
  return {
    lead: t("packages.confirmLead"),
    hint: influencer
      ? t("packages.confirmInfluencerHint")
      : paymentMethod === "CASH"
        ? t("packages.confirmCashHint")
        : t("packages.confirmTerminalHint"),
    paymentLegend: t("packages.paymentMethodLegend"),
    paymentLabel: (method: AdminClientPackagePaymentMethod) =>
      tFinance(`paymentMethods.${method}`),
    summary: {
      clientNameLabel: t("packages.clientName"),
      clientName,
      planName: plan.name,
      categoryName: plan.categoryName,
      priceCaption: influencer ? t("packages.studioCost") : t("packages.finalPrice"),
      priceLabel: formatAmdFromCents(charge, locale),
      catalogLabel: promo !== null ? formatAmdFromCents(catalogCents, locale) : null,
      clientPaysLabel: influencer
        ? `${t("packages.clientPays")}: ${formatAmdFromCents(0, locale)}`
        : null,
      durationLabel: t("packages.duration"),
      durationValue: t("packages.periodDays", { days: plan.periodDays }),
      sessionsLabel: t("packages.includedSessions"),
      sessionsValue: plan.isUnlimited ? t("packages.unlimited") : String(plan.sessionsPerMonth ?? "—"),
      categoryLabel: t("packages.category"),
    },
  };
}

function PaymentMethodChoices({
  legend,
  paymentMethod,
  disabled,
  labelFor,
  onChange,
}: {
  legend: string;
  paymentMethod: AdminClientPackagePaymentMethod;
  disabled: boolean;
  labelFor: (method: AdminClientPackagePaymentMethod) => string;
  onChange: (method: AdminClientPackagePaymentMethod) => void;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-sage-800">{legend}</legend>
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
              onChange={() => onChange(method)}
              className="h-4 w-4 accent-sand-600"
            />
            <span className="text-sm text-sage-800">{labelFor(method)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function PackagePurchaseSummary({
  clientNameLabel,
  clientName,
  planName,
  categoryName,
  priceCaption,
  priceLabel,
  catalogLabel,
  clientPaysLabel,
  durationLabel,
  durationValue,
  sessionsLabel,
  sessionsValue,
  categoryLabel,
}: {
  clientNameLabel: string;
  clientName: string;
  planName: string;
  categoryName: string;
  priceCaption: string;
  priceLabel: string;
  catalogLabel: string | null;
  clientPaysLabel: string | null;
  durationLabel: string;
  durationValue: string;
  sessionsLabel: string;
  sessionsValue: string;
  categoryLabel: string;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-b from-white/95 to-sand-50/50 shadow-[0_16px_40px_-28px_rgba(45,40,35,0.35)]">
      <div className="border-b border-white/70 bg-white/55 px-5 py-4">
        <p className={ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS}>{clientNameLabel}</p>
        <p className={`mt-1 ${ADMIN_DETAILS_SHEET_DETAIL_VALUE_CLASS}`}>{clientName}</p>
      </div>
      <PackagePurchaseBody
        planName={planName}
        categoryName={categoryName}
        priceCaption={priceCaption}
        priceLabel={priceLabel}
        catalogLabel={catalogLabel}
        clientPaysLabel={clientPaysLabel}
        durationLabel={durationLabel}
        durationValue={durationValue}
        sessionsLabel={sessionsLabel}
        sessionsValue={sessionsValue}
        categoryLabel={categoryLabel}
      />
    </article>
  );
}

function PackagePurchaseBody(props: {
  planName: string;
  categoryName: string;
  priceCaption: string;
  priceLabel: string;
  catalogLabel: string | null;
  clientPaysLabel: string | null;
  durationLabel: string;
  durationValue: string;
  sessionsLabel: string;
  sessionsValue: string;
  categoryLabel: string;
}) {
  return (
    <div className="space-y-5 px-5 py-5">
      <div className="min-w-0">
        <h3 className="font-serif text-2xl font-normal leading-snug text-sage-900">{props.planName}</h3>
        <p className="mt-1 text-sm text-sage-600">{props.categoryName}</p>
      </div>
      <div>
        <p className={ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS}>{props.priceCaption}</p>
        <p className="mt-1 font-serif text-3xl font-normal tracking-tight text-sage-900">{props.priceLabel}</p>
        {props.catalogLabel !== null ? (
          <p className="mt-1 text-sm text-sage-500 line-through">{props.catalogLabel}</p>
        ) : null}
        {props.clientPaysLabel !== null ? (
          <p className="mt-2 text-sm text-sage-600">{props.clientPaysLabel}</p>
        ) : null}
      </div>
      <dl className="grid gap-4 sm:grid-cols-2">
        <ConfirmField label={props.durationLabel} value={props.durationValue} />
        <ConfirmField label={props.sessionsLabel} value={props.sessionsValue} />
        <ConfirmField label={props.categoryLabel} value={props.categoryName} />
      </dl>
    </div>
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
