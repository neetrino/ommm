"use client";

import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import {
  DetailsCard,
  DetailsField,
  DetailsFieldRow,
  DetailsStat,
  DetailsStatStrip,
} from "@/components/shared/details/details-card";
import {
  CalendarGlyph,
  CheckCircleGlyph,
  TicketGlyph,
  UserGlyph,
  WalletGlyph,
} from "@/components/shared/details/details-glyphs";
import {
  ADMIN_CLIENT_PACKAGE_PAYMENT_METHODS,
  type AdminClientPackagePaymentMethod,
} from "@/lib/manual-payment-method";
import { AdminClientPackagePromoField } from "@/components/admin/admin-client-package-promo-field";
import { formatAmdFromCents } from "@/lib/price-amd";
import type { PromoPreview } from "@/lib/preview-promo-code";
import type { PublicPackagePlan } from "@/lib/public-package-plan";

const PAYMENT_CHOICE_CLASS = [
  "flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border border-sage-500/15 bg-white px-4 py-3",
  "transition-colors hover:border-sand-500/40",
  "has-[:checked]:border-sand-500 has-[:checked]:bg-sand-100/40",
  "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60",
].join(" ");

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
      <p className="text-sm text-sage-500">{view.lead}</p>
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

      <div className="rounded-2xl border border-mint-200/80 bg-mint-100/70 px-4 py-3 text-sm text-sage-800">
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
    <DetailsCard title={legend} icon={<WalletGlyph />} iconTone="sand">
      <fieldset>
        <legend className="sr-only">{legend}</legend>
        <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2">
          {ADMIN_CLIENT_PACKAGE_PAYMENT_METHODS.map((method) => (
            <label key={method} className={PAYMENT_CHOICE_CLASS}>
              <input
                type="radio"
                name="admin-client-package-payment-method"
                value={method}
                checked={paymentMethod === method}
                disabled={disabled}
                onChange={() => onChange(method)}
                className="h-4 w-4 accent-sand-700"
              />
              <span className="text-sm font-medium text-sage-900">{labelFor(method)}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </DetailsCard>
  );
}

type PackagePurchaseSummaryProps = ReturnType<typeof usePackageConfirmView>["summary"];

function PackagePurchaseSummary(props: PackagePurchaseSummaryProps) {
  return (
    <DetailsCard title={props.planName} icon={<TicketGlyph />}>
      <DetailsFieldRow>
        <DetailsField label={props.clientNameLabel} icon={<UserGlyph />} title={props.clientName}>
          {props.clientName}
        </DetailsField>
        <DetailsField label={props.categoryLabel} title={props.categoryName}>
          {props.categoryName}
        </DetailsField>
      </DetailsFieldRow>
      <DetailsStatStrip>
        <DetailsStat label={props.priceCaption} icon={<WalletGlyph />} tone="mint">
          <span className="block font-serif text-lg">{props.priceLabel}</span>
          {props.catalogLabel !== null ? (
            <span className="block text-xs font-medium text-sage-500 line-through">
              {props.catalogLabel}
            </span>
          ) : null}
          {props.clientPaysLabel !== null ? (
            <span className="block text-xs font-medium text-sage-500">{props.clientPaysLabel}</span>
          ) : null}
        </DetailsStat>
        <DetailsStat label={props.durationLabel} icon={<CalendarGlyph />} tone="blue">
          {props.durationValue}
        </DetailsStat>
        <DetailsStat label={props.sessionsLabel} icon={<CheckCircleGlyph />} tone="peach">
          {props.sessionsValue}
        </DetailsStat>
      </DetailsStatStrip>
    </DetailsCard>
  );
}
