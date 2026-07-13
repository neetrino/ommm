"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import type { ClientDetail } from "@/components/admin/admin-clients-types";
import { AdminClientPackageSelectCards } from "@/components/admin/admin-client-package-select-cards";
import {
  ADMIN_DETAILS_SHEET_DETAIL_BLOCK_CLASS,
  ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS,
  ADMIN_DETAILS_SHEET_DETAIL_VALUE_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_ELEVATED_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
  ADMIN_NESTED_DETAILS_SHEET_BODY_CLASS,
  ADMIN_NESTED_WIDE_DRAWER_PANEL_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmDrawerPortal, OMM_DRAWER_NESTED_BACKDROP_CLASS } from "@/components/ui/omm-modal";
import { ApiError, apiFetch } from "@/lib/api";
import {
  ADMIN_CLIENT_PACKAGE_PAYMENT_METHODS,
  type AdminClientPackagePaymentMethod,
} from "@/lib/manual-payment-method";
import { formatAmdFromCents } from "@/lib/price-amd";
import {
  normalizePublicPackagePlan,
  type PublicPackagePlan,
} from "@/lib/public-package-plan";

type AdminClientPackagePurchaseSheetProps = {
  client: ClientDetail;
  locale: string;
  onClose: () => void;
  onSuccess: () => void;
};

type PurchaseStep = "select" | "confirm";

function clientDisplayName(client: ClientDetail): string {
  const value = [client.name, client.lastName].filter(Boolean).join(" ").trim();
  return value.length > 0 ? value : client.email;
}

export function AdminClientPackagePurchaseSheet({
  client,
  locale,
  onClose,
  onSuccess,
}: AdminClientPackagePurchaseSheetProps) {
  const t = useTranslations("adminPages.clients");
  const tFinance = useTranslations("adminPages.finance");
  const titleId = useId();
  const [step, setStep] = useState<PurchaseStep>("select");
  const [plans, setPlans] = useState<PublicPackagePlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [paymentMethodsOpen, setPaymentMethodsOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] =
    useState<AdminClientPackagePaymentMethod>("CASH");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "ok" | "err" } | null>(
    null,
  );
  const paymentMethodsRef = useRef<HTMLFieldSetElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    setPlansLoading(true);
    setPlansError(null);
    void apiFetch<PublicPackagePlan[]>("/packages/plans")
      .then((payload) => {
        if (cancelled) {
          return;
        }
        const normalized = payload.map(normalizePublicPackagePlan);
        setPlans(normalized);
      })
      .catch((err) => {
        if (!cancelled) {
          setPlans([]);
          setPlansError(
            err instanceof ApiError ? err.message : t("packages.plansLoadError"),
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setPlansLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [t]);

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? null;

  function handleClose(): void {
    if (submitting) {
      return;
    }
    onClose();
  }

  function handleSubscribePlan(planId: string): void {
    if (submitting) {
      return;
    }
    setSelectedPlanId(planId);
    setPaymentMethod("CASH");
    setPaymentMethodsOpen(true);
  }

  useEffect(() => {
    if (!paymentMethodsOpen || selectedPlan === null) {
      return;
    }
    paymentMethodsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [paymentMethodsOpen, selectedPlan]);

  function handleContinueToConfirm(): void {
    if (selectedPlan === null || !paymentMethodsOpen || submitting) {
      return;
    }
    setStep("confirm");
  }

  async function handleConfirmPurchase(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (selectedPlan === null || submitting) {
      return;
    }
    setSubmitting(true);
    setToast(null);
    try {
      await apiFetch(`/clients/${client.id}/packages/purchase`, {
        method: "POST",
        body: JSON.stringify({
          planId: selectedPlan.id,
          paymentMethod,
        }),
      });
      onSuccess();
    } catch (err) {
      setToast({
        message: err instanceof ApiError ? err.message : t("packages.purchaseError"),
        tone: "err",
      });
      setSubmitting(false);
    }
  }

  const confirmLabel =
    paymentMethod === "CASH"
      ? t("packages.confirmCash")
      : t("packages.confirmTerminal");
  const confirmHint =
    paymentMethod === "CASH"
      ? t("packages.confirmCashHint")
      : t("packages.confirmTerminalHint");

  return (
    <OmmDrawerPortal
      isOpen
      onClose={handleClose}
      closeDisabled={submitting}
      backdropAriaLabel={t("modalBackdropClose")}
      ariaLabelledBy={titleId}
      overlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_ELEVATED_CLASS}
      panelClassName={ADMIN_NESTED_WIDE_DRAWER_PANEL_CLASS}
      backdropClassName={OMM_DRAWER_NESTED_BACKDROP_CLASS}
      lockBodyScroll={false}
      useOverlayPortalRoot
    >
      <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className={`min-w-0 ${ADMIN_DETAILS_SHEET_TITLE_CLASS}`}>
            {t("packages.addPackage")}
          </h2>
          <button
            type="button"
            className={ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS}
            aria-label={t("modalCloseAria")}
            disabled={submitting}
            onClick={handleClose}
          >
            ×
          </button>
        </div>
      </header>

      <div className={`${ADMIN_NESTED_DETAILS_SHEET_BODY_CLASS} min-h-0 flex-1`}>
        {toast ? (
          <AdminCenterToast
            message={toast.message}
            tone={toast.tone}
            onDismiss={() => setToast(null)}
          />
        ) : null}

        {step === "select" ? (
          <div className="space-y-5">
            <p className="text-sm text-sage-600">{t("packages.selectLead")}</p>

            {plansLoading ? (
              <p className="text-sm text-sage-600">{t("packages.plansLoading")}</p>
            ) : null}
            {!plansLoading && plansError !== null ? (
              <p className="text-sm text-rose-700">{plansError}</p>
            ) : null}
            {!plansLoading && plansError === null && plans.length === 0 ? (
              <p className="text-sm text-sage-600">{t("packages.plansEmpty")}</p>
            ) : null}

            {!plansLoading && plans.length > 0 ? (
              <AdminClientPackageSelectCards
                locale={locale}
                plans={plans}
                selectedPlanId={selectedPlanId}
                disabled={submitting}
                onSelectPlan={setSelectedPlanId}
                onSubscribe={handleSubscribePlan}
              />
            ) : null}

            {paymentMethodsOpen && selectedPlan !== null ? (
              <fieldset ref={paymentMethodsRef} className="space-y-3">
                <legend className="text-sm font-semibold text-sage-800">
                  {t("packages.paymentMethodLegend")}
                </legend>
                <p className="text-sm text-sage-600">
                  {t("packages.selectedPlanHint", { name: selectedPlan.name })}
                </p>
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
                        disabled={submitting}
                        onChange={() => setPaymentMethod(method)}
                        className="h-4 w-4 accent-sand-600"
                      />
                      <span className="text-sm text-sage-800">
                        {tFinance(`paymentMethods.${method}`)}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}

            <div className="flex flex-wrap justify-end gap-2">
              <OmmButton type="button" variant="secondary" disabled={submitting} onClick={handleClose}>
                {t("cancelButton")}
              </OmmButton>
              {paymentMethodsOpen ? (
                <OmmButton
                  type="button"
                  variant="primary"
                  disabled={selectedPlan === null || submitting}
                  onClick={handleContinueToConfirm}
                >
                  {t("packages.continue")}
                </OmmButton>
              ) : null}
            </div>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={(event) => void handleConfirmPurchase(event)}>
            <dl className={ADMIN_DETAILS_SHEET_DETAIL_BLOCK_CLASS}>
              <SummaryRow label={t("packages.clientName")} value={clientDisplayName(client)} />
              <SummaryRow
                label={t("packages.packageName")}
                value={selectedPlan?.name ?? "—"}
              />
              <SummaryRow
                label={t("packages.category")}
                value={selectedPlan?.categoryName ?? "—"}
              />
              <SummaryRow
                label={t("packages.duration")}
                value={
                  selectedPlan
                    ? t("packages.periodDays", { days: selectedPlan.periodDays })
                    : "—"
                }
              />
              <SummaryRow
                label={t("packages.includedSessions")}
                value={
                  selectedPlan?.isUnlimited
                    ? t("packages.unlimited")
                    : String(selectedPlan?.sessionsPerMonth ?? "—")
                }
              />
              <SummaryRow
                label={t("packages.finalPrice")}
                value={
                  selectedPlan
                    ? formatAmdFromCents(
                        selectedPlan.finalPriceCents ?? selectedPlan.priceCents,
                        locale,
                      )
                    : "—"
                }
              />
              <SummaryRow
                label={t("packages.paymentMethod")}
                value={tFinance(`paymentMethods.${paymentMethod}`)}
              />
            </dl>

            <p className="text-sm text-sage-600">{confirmHint}</p>

            <div className="flex flex-wrap justify-end gap-2">
              <OmmButton
                type="button"
                variant="secondary"
                disabled={submitting}
                onClick={() => setStep("select")}
              >
                {t("packages.back")}
              </OmmButton>
              <OmmButton type="submit" variant="primary" disabled={submitting}>
                {submitting ? t("packages.submitting") : confirmLabel}
              </OmmButton>
            </div>
          </form>
        )}
      </div>
    </OmmDrawerPortal>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/60 py-2 last:border-b-0">
      <dt className={ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS}>{label}</dt>
      <dd className={ADMIN_DETAILS_SHEET_DETAIL_VALUE_CLASS}>{value}</dd>
    </div>
  );
}
