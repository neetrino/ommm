"use client";

import { useId, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PackageSubscribePlanPicker } from "@/components/account/package-subscribe-plan-picker";
import {
  MEMBER_ACCOUNT_HUB_SHEET_BODY_CLASS,
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
  PACKAGE_SUBSCRIBE_FORM_CLASS,
  PACKAGE_SUBSCRIBE_FORM_GRID_CLASS,
  PACKAGE_SUBSCRIBE_PAYMENT_COLUMN_CLASS,
  PACKAGE_SUBSCRIBE_PLANS_COLUMN_CLASS,
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
import { isApiError, isArcaCheckoutEnabled, startArcaCardCheckout } from "@/lib/arca-checkout";
import { apiFetch } from "@/lib/api";
import { dismissMobileKeyboard } from "@/lib/dismiss-mobile-keyboard";
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
  /** Optional highlighted note shown above the form (e.g. booking purchase prompt). */
  notice?: string;
  onClose: () => void;
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

function PurchaseNoticeIcon() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-sand-700"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01M11 12h1v4h1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PackageSubscribePaymentModal({
  isOpen,
  locale,
  plans,
  initialPlanId,
  notice,
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
      notice={notice}
      onClose={onClose}
    />
  );
}

function PackageSubscribePaymentModalSession({
  isOpen,
  locale,
  plans,
  initialPlanId,
  notice,
  onClose,
}: PackageSubscribePaymentModalProps) {
  const t = useTranslations("forms.manualPackagePayment");
  const router = useRouter();
  const titleId = useId();
  const [shouldRefreshAfterClose, setShouldRefreshAfterClose] = useState(false);
  const [step, setStep] = useState<ModalStep>("form");
  const isPhone = useMemberHubSheetPhone();
  const { motionState: desktopMotionState, closeMotion: closeDesktopMotion } =
    useDesktopSheetEnterMotion(!isPhone && isOpen);
  const [selectedPlanId, setSelectedPlanId] = useState(() =>
    resolveDefaultPlanId(plans, initialPlanId),
  );
  const [paymentMethod, setPaymentMethod] = useState<ManualPaymentMethod>("CARD");
  const [busy, setBusy] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? plans[0];
  const sheetTitle = step === "success" ? t("successTitle") : t("title");

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

  function renderSheetBody(onClose: () => void) {
    return step === "success" ? (
      <SuccessPanel onDone={onClose} />
    ) : (
      <form onSubmit={(event) => void onConfirm(event)} className={PACKAGE_SUBSCRIBE_FORM_CLASS}>
        {notice !== undefined && notice.length > 0 ? (
          <div className="shrink-0 rounded-2xl border border-sand-200/70 bg-sand-50/80 px-4 py-3">
            <p className="flex items-start gap-2 text-sm text-sand-900">
              <PurchaseNoticeIcon />
              <span>{notice}</span>
            </p>
          </div>
        ) : null}
        <p className="shrink-0 text-sm text-sage-600">{t("lead")}</p>
        <div className={PACKAGE_SUBSCRIBE_FORM_GRID_CLASS}>
          <div className={PACKAGE_SUBSCRIBE_PLANS_COLUMN_CLASS}>
            <PackageSubscribePlanPicker
              plans={plans}
              selectedPlanId={selectedPlan.id}
              locale={locale}
              onSelect={handlePlanSelect}
            />
          </div>
          <div className={PACKAGE_SUBSCRIBE_PAYMENT_COLUMN_CLASS}>
            <PaymentMethodPicker
              value={paymentMethod}
              onChange={setPaymentMethod}
              disabled={busy}
            />
          </div>
        </div>
        {error !== null ? (
          <p className="shrink-0 text-sm text-red-800" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex shrink-0 flex-wrap justify-end gap-3 pt-1">
          <OmmButton
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={busy}
          >
            {t("cancel")}
          </OmmButton>
          <OmmButton type="submit" variant="primary" size="md" disabled={busy}>
            {busy ? t("submitting") : t("confirm")}
          </OmmButton>
        </div>
      </form>
    );
  }

  function renderSheetHeader(onClose: () => void) {
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
          onClick={onClose}
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
      <div className={PACKAGE_SUBSCRIBE_DESKTOP_BODY_CLASS}>{renderSheetBody(handleDesktopClose)}</div>
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
      <div className={MEMBER_ACCOUNT_HUB_SHEET_BODY_CLASS}>{renderBody(requestClose)}</div>
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
      {MANUAL_PAYMENT_METHODS.map((method) => (
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
