"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import type { ClientDetail } from "@/components/admin/admin-clients-types";
import { AdminClientPackagePurchaseConfirm } from "@/components/admin/admin-client-package-purchase-confirm";
import { AdminClientPackageSelectCards } from "@/components/admin/admin-client-package-select-cards";
import {
  ADMIN_DETAILS_SHEET_FOOTER_CLASS,
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
import type { AdminClientPackagePaymentMethod } from "@/lib/manual-payment-method";
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
  const titleId = useId();
  const confirmFormId = useId();
  const [step, setStep] = useState<PurchaseStep>("select");
  const [plans, setPlans] = useState<PublicPackagePlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] =
    useState<AdminClientPackagePaymentMethod>("CASH");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "ok" | "err" } | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    void apiFetch<PublicPackagePlan[]>("/packages/plans")
      .then((payload) => {
        if (cancelled) {
          return;
        }
        setPlans(payload.map(normalizePublicPackagePlan));
        setPlansError(null);
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

  function handleSelectPlan(planId: string | null): void {
    if (submitting) {
      return;
    }
    setSelectedPlanId(planId);
    if (planId !== null) {
      setPaymentMethod("CASH");
    }
  }

  function handleContinueToConfirm(): void {
    if (selectedPlan === null || submitting) {
      return;
    }
    // Defer step change so this click cannot submit the confirm form after React
    // reuses the footer primary button as type="submit".
    queueMicrotask(() => {
      setStep("confirm");
    });
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
                onSelectPlan={handleSelectPlan}
              />
            ) : null}
          </div>
        ) : selectedPlan !== null ? (
          <AdminClientPackagePurchaseConfirm
            formId={confirmFormId}
            clientName={clientDisplayName(client)}
            locale={locale}
            paymentMethod={paymentMethod}
            disabled={submitting}
            plan={selectedPlan}
            onPaymentMethodChange={setPaymentMethod}
            onConfirm={(event) => void handleConfirmPurchase(event)}
          />
        ) : null}
      </div>

      <footer
        className={`${ADMIN_DETAILS_SHEET_FOOTER_CLASS} flex flex-wrap items-center justify-end gap-2`}
      >
        {step === "select" ? (
          <>
            <OmmButton
              key="purchase-cancel"
              type="button"
              variant="secondary"
              disabled={submitting}
              onClick={handleClose}
            >
              {t("cancelButton")}
            </OmmButton>
            <OmmButton
              key="purchase-continue"
              type="button"
              variant="primary"
              disabled={selectedPlan === null || submitting}
              onClick={handleContinueToConfirm}
            >
              {t("packages.continue")}
            </OmmButton>
          </>
        ) : (
          <>
            <OmmButton
              key="purchase-back"
              type="button"
              variant="secondary"
              disabled={submitting}
              onClick={() => setStep("select")}
            >
              {t("packages.back")}
            </OmmButton>
            <OmmButton
              key="purchase-confirm"
              type="submit"
              form={confirmFormId}
              variant="primary"
              disabled={submitting || selectedPlan === null}
            >
              {submitting
                ? t("packages.submitting")
                : paymentMethod === "INFLUENCER"
                  ? t("packages.confirmInfluencer")
                  : paymentMethod === "CASH"
                    ? t("packages.confirmCash")
                    : t("packages.confirmTerminal")}
            </OmmButton>
          </>
        )}
      </footer>
    </OmmDrawerPortal>
  );
}
