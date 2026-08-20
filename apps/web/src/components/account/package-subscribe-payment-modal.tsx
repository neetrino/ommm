"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PackageSubscribePlanPicker } from "@/components/account/package-subscribe-plan-picker";
import { PackageSubscribeGiftCreditsToggle } from "@/components/account/package-subscribe-gift-credits-toggle";
import {
  MEMBER_ACCOUNT_HUB_SHEET_GRABBER_CLASS,
  memberAccountHubSheetPanelStyle,
} from "@/components/account/member-account-hub-sheet-layout";
import {
  MemberHubMobileSheet,
  useMemberHubMobileSheetClose,
} from "@/components/account/member-hub-mobile-sheet";
import {
  PACKAGE_SUBSCRIBE_DESKTOP_BACKDROP_CLASS,
  PACKAGE_SUBSCRIBE_DESKTOP_BODY_CLASS,
  PACKAGE_SUBSCRIBE_DESKTOP_MOTION_MS,
  PACKAGE_SUBSCRIBE_DESKTOP_OVERLAY_CLASS,
  PACKAGE_SUBSCRIBE_DESKTOP_PANEL_CLASS,
  PACKAGE_SUBSCRIBE_FORM_ACTIONS_CLASS,
  PACKAGE_SUBSCRIBE_FORM_CLASS,
  PACKAGE_SUBSCRIBE_FORM_SCROLL_CLASS,
  PACKAGE_SUBSCRIBE_MOBILE_BODY_CLASS,
  PACKAGE_SUBSCRIBE_SHEET_HEADER_CLASS,
  PACKAGE_SUBSCRIBE_SHEET_TITLE_CLASS,
} from "@/components/account/package-subscribe-payment-sheet-layout";
import sheetStyles from "@/components/account/package-subscribe-payment-sheet.module.css";
import formStyles from "@/components/account/package-subscribe-payment-form.module.css";
import { ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS } from "@/components/admin/admin-details-sheet-layout";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmDrawerPortal } from "@/components/ui/omm-modal";
import { useMemberHubSheetPhone } from "@/hooks/use-member-hub-sheet-phone";
import { useDesktopSheetEnterMotion } from "@/hooks/use-desktop-sheet-enter-motion";
import { isApiError, isArcaCheckoutEnabled } from "@/lib/arca-checkout";
import { apiFetch } from "@/lib/api";
import { dismissMobileKeyboard } from "@/lib/dismiss-mobile-keyboard";
import {
  PACKAGE_SUBSCRIBE_PAYMENT_METHODS,
  type ManualPaymentMethod,
} from "@/lib/manual-payment-method";
import type { PackageSubscribePlanOption } from "@/lib/package-subscribe-plan-option";

type PackageSubscribePaymentModalProps = {
  isOpen: boolean;
  locale: string;
  plans: readonly PackageSubscribePlanOption[];
  initialPlanId?: string;
  onClose: () => void;
};

type ModalStep = "form" | "success";

type SubscribePackageResponse = {
  id: string;
  paymentReference?: string | null;
  requiresArcaCheckout?: boolean;
  redirectUrl?: string | null;
  giftCreditsAppliedCents?: number;
  amountDueCents?: number;
};

type SpendableGiftBalanceResponse = {
  spendableCents: number;
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

function SheetCloseIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

export function PackageSubscribePaymentModal({
  isOpen,
  locale,
  plans,
  initialPlanId,
  onClose,
}: PackageSubscribePaymentModalProps) {
  if (!isOpen || plans.length === 0) {
    return null;
  }

  const sessionKey = plans.map((plan) => plan.id).join(",");

  return (
    <PackageSubscribePaymentModalSession
      key={sessionKey}
      isOpen={isOpen}
      locale={locale}
      plans={plans}
      initialPlanId={initialPlanId}
      onClose={onClose}
    />
  );
}

function PackageSubscribePaymentModalSession({
  isOpen,
  locale,
  plans,
  initialPlanId,
  onClose,
}: PackageSubscribePaymentModalProps) {
  const t = useTranslations("forms.manualPackagePayment");
  const router = useRouter();
  const titleId = useId();
  const giftCreditsFieldId = useId();
  const [shouldRefreshAfterClose, setShouldRefreshAfterClose] = useState(false);
  const [step, setStep] = useState<ModalStep>("form");
  const isPhone = useMemberHubSheetPhone();
  const { motionState: desktopMotionState, closeMotion: closeDesktopMotion } =
    useDesktopSheetEnterMotion(!isPhone && isOpen);
  const [selectedPlanId, setSelectedPlanId] = useState(() =>
    resolveDefaultPlanId(plans, initialPlanId),
  );
  const [paymentMethod, setPaymentMethod] = useState<ManualPaymentMethod>(
    () => PACKAGE_SUBSCRIBE_PAYMENT_METHODS[0] ?? "CARD",
  );
  const [busy, setBusy] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spendableGiftCents, setSpendableGiftCents] = useState(0);
  const [useGiftCredits, setUseGiftCredits] = useState(false);

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? plans[0];
  const sheetTitle = step === "success" ? t("successTitle") : t("title");
  const appliedGiftCents =
    useGiftCredits && selectedPlan
      ? Math.min(spendableGiftCents, selectedPlan.finalPriceCents)
      : 0;
  const amountDueCents = selectedPlan
    ? selectedPlan.finalPriceCents - appliedGiftCents
    : 0;

  useEffect(() => {
    let cancelled = false;
    async function loadSpendable() {
      try {
        const result = await apiFetch<SpendableGiftBalanceResponse>(
          "/gift-cards/me/spendable-balance",
        );
        if (cancelled) {
          return;
        }
        const cents = Math.max(0, result.spendableCents);
        setSpendableGiftCents(cents);
        if (cents <= 0) {
          setUseGiftCredits(false);
        }
      } catch {
        if (!cancelled) {
          setSpendableGiftCents(0);
          setUseGiftCredits(false);
        }
      }
    }
    void loadSpendable();
    return () => {
      cancelled = true;
    };
  }, []);

  function handlePlanSelect(planId: string) {
    setSelectedPlanId(planId);
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
          locale,
          useGiftCredits: useGiftCredits && spendableGiftCents > 0,
        }),
      });
      const dueCents =
        typeof result.amountDueCents === "number"
          ? result.amountDueCents
          : amountDueCents;
      if (paymentMethod === "CARD" && dueCents > 0 && isArcaCheckoutEnabled()) {
        if (
          typeof result.redirectUrl === "string" &&
          result.redirectUrl.length > 0
        ) {
          window.location.href = result.redirectUrl;
          return;
        }
        setError(t("submitFailed"));
        return;
      }
      setStep("success");
      setShouldRefreshAfterClose(true);
    } catch (err) {
      setError(isApiError(err) ? err.message : t("submitFailed"));
    } finally {
      setBusy(false);
    }
  }

  function finishClose() {
    const shouldRefresh = shouldRefreshAfterClose;
    setShouldRefreshAfterClose(false);
    onClose();
    if (shouldRefresh) {
      router.refresh();
    }
  }

  function handleDesktopClose() {
    if (busy || isClosing) {
      return;
    }

    dismissMobileKeyboard();
    setIsClosing(true);
    closeDesktopMotion();
    window.setTimeout(finishClose, PACKAGE_SUBSCRIBE_DESKTOP_MOTION_MS);
  }

  function renderSheetBody(onCloseSheet: () => void) {
    return step === "success" ? (
      <SuccessPanel onDone={onCloseSheet} />
    ) : (
      <form onSubmit={(event) => void onConfirm(event)} className={PACKAGE_SUBSCRIBE_FORM_CLASS}>
        <div className={PACKAGE_SUBSCRIBE_FORM_SCROLL_CLASS}>
          <PackageSubscribePlanPicker
            plans={plans}
            selectedPlanId={selectedPlan.id}
            locale={locale}
            onSelect={handlePlanSelect}
          />
          <PackageSubscribeGiftCreditsToggle
            fieldId={giftCreditsFieldId}
            checked={useGiftCredits}
            disabled={busy || spendableGiftCents <= 0}
            spendableCents={spendableGiftCents}
            appliedCents={appliedGiftCents}
            amountDueCents={amountDueCents}
            locale={locale}
            onChange={setUseGiftCredits}
          />
          {error !== null ? (
            <p className="shrink-0 text-sm text-red-800" role="alert">
              {error}
            </p>
          ) : null}
          <div className={formStyles.formFooter}>
            {amountDueCents > 0 ? (
              <PaymentMethodPicker
                value={paymentMethod}
                onChange={setPaymentMethod}
                disabled={busy}
              />
            ) : (
              <p className="text-sm text-sage-600">{t("giftCreditsCoversAll")}</p>
            )}
          </div>
        </div>
        <div className={PACKAGE_SUBSCRIBE_FORM_ACTIONS_CLASS}>
          <div className="flex shrink-0 flex-wrap justify-end gap-3">
            <OmmButton
              type="button"
              variant="secondary"
              size="md"
              onClick={onCloseSheet}
              disabled={busy}
            >
              {t("cancel")}
            </OmmButton>
            <OmmButton type="submit" variant="primary" size="md" disabled={busy}>
              {busy
                ? t("submitting")
                : amountDueCents === 0
                  ? t("confirmWithGiftOnly")
                  : t("confirm")}
            </OmmButton>
          </div>
        </div>
      </form>
    );
  }

  function renderSheetHeader(onCloseSheet: () => void) {
    return (
      <header className={PACKAGE_SUBSCRIBE_SHEET_HEADER_CLASS}>
        <h2
          id={titleId}
          className={`${sheetStyles.sheetTitle} ${PACKAGE_SUBSCRIBE_SHEET_TITLE_CLASS}`}
        >
          {sheetTitle}
        </h2>
        <button
          type="button"
          className={ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS}
          aria-label={t("closeModal")}
          onClick={onCloseSheet}
          disabled={busy}
        >
          <SheetCloseIcon />
        </button>
      </header>
    );
  }

  if (isPhone) {
    return (
      <MemberHubMobileSheet
        bare
        titleId={titleId}
        closeLabel={t("closeModal")}
        backdropCloseLabel={t("closeModal")}
        onClose={finishClose}
        closeDisabled={busy}
        panelStyle={memberAccountHubSheetPanelStyle()}
      >
        <PackageSubscribeMobileSheetLayout
          renderHeader={renderSheetHeader}
          renderBody={renderSheetBody}
        />
      </MemberHubMobileSheet>
    );
  }

  return (
    <OmmDrawerPortal
      isOpen={isOpen}
      onClose={handleDesktopClose}
      backdropAriaLabel={t("closeModal")}
      ariaLabelledBy={titleId}
      closeDisabled={busy}
      overlayClassName={PACKAGE_SUBSCRIBE_DESKTOP_OVERLAY_CLASS}
      backdropClassName={PACKAGE_SUBSCRIBE_DESKTOP_BACKDROP_CLASS}
      panelClassName={PACKAGE_SUBSCRIBE_DESKTOP_PANEL_CLASS}
      motionState={desktopMotionState}
    >
      {renderSheetHeader(handleDesktopClose)}
      <div className={PACKAGE_SUBSCRIBE_DESKTOP_BODY_CLASS}>
        {renderSheetBody(handleDesktopClose)}
      </div>
    </OmmDrawerPortal>
  );
}

function PackageSubscribeMobileSheetLayout({
  renderHeader,
  renderBody,
}: {
  renderHeader: (onClose: () => void) => ReactNode;
  renderBody: (onClose: () => void) => ReactNode;
}) {
  const requestClose = useMemberHubMobileSheetClose();

  return (
    <>
      <div className={MEMBER_ACCOUNT_HUB_SHEET_GRABBER_CLASS} aria-hidden />
      {renderHeader(requestClose)}
      <div className={PACKAGE_SUBSCRIBE_MOBILE_BODY_CLASS}>{renderBody(requestClose)}</div>
    </>
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
    <fieldset className={formStyles.sectionFieldset}>
      <legend
        className={`ommm-label text-xs uppercase tracking-wide text-sage-700 ${formStyles.sectionHeading}`}
      >
        {t("methodLegend")}
      </legend>
      <div className={formStyles.sectionCards}>
        {PACKAGE_SUBSCRIBE_PAYMENT_METHODS.map((method) => (
          <label key={method} className={formStyles.paymentMethodOption}>
            <input
              type="radio"
              name="payment-method"
              value={method}
              checked={value === method}
              onChange={() => onChange(method)}
              disabled={disabled}
              className={formStyles.paymentMethodRadio}
            />
            <span className="text-sm text-sage-700">{t(`methods.${method}`)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

type SuccessPanelProps = {
  onDone: () => void;
};

function SuccessPanel({ onDone }: SuccessPanelProps) {
  const t = useTranslations("forms.manualPackagePayment");

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-sage-600">{t("successLead")}</p>
      <p className="text-sm text-sage-600">{t("successFollowUp")}</p>
      <div className="flex justify-end">
        <OmmButton type="button" variant="primary" size="md" onClick={onDone}>
          {t("done")}
        </OmmButton>
      </div>
    </div>
  );
}
