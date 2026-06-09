"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PackageSubscribePlanPicker } from "@/components/account/package-subscribe-plan-picker";
import {
  MEMBER_ACCOUNT_HUB_SHEET_GRABBER_CLASS,
  MEMBER_ACCOUNT_HUB_SHEET_HEADER_CLASS,
  memberAccountHubSheetPanelStyle,
} from "@/components/account/member-account-hub-sheet-layout";
import {
  PACKAGE_SUBSCRIBE_DESKTOP_BACKDROP_CLASS,
  PACKAGE_SUBSCRIBE_DESKTOP_BODY_CLASS,
  PACKAGE_SUBSCRIBE_DESKTOP_HEADER_CLASS,
  PACKAGE_SUBSCRIBE_DESKTOP_MOTION_MS,
  PACKAGE_SUBSCRIBE_DESKTOP_OVERLAY_CLASS,
  PACKAGE_SUBSCRIBE_DESKTOP_PANEL_CLASS,
  PACKAGE_SUBSCRIBE_FORM_CLASS,
  PACKAGE_SUBSCRIBE_FORM_GRID_CLASS,
  PACKAGE_SUBSCRIBE_MOBILE_MOTION_MS,
  PACKAGE_SUBSCRIBE_MOBILE_OVERLAY_CLASS,
  PACKAGE_SUBSCRIBE_MOBILE_PANEL_CLASS,
  PACKAGE_SUBSCRIBE_MOBILE_BODY_CLASS,
  PACKAGE_SUBSCRIBE_PAYMENT_COLUMN_CLASS,
  PACKAGE_SUBSCRIBE_PLANS_COLUMN_CLASS,
  PACKAGE_SUBSCRIBE_SHEET_TITLE_CLASS,
} from "@/components/account/package-subscribe-payment-sheet-layout";
import formStyles from "@/components/account/package-subscribe-payment-form.module.css";
import { ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS } from "@/components/admin/admin-details-sheet-layout";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmDrawerPortal, OmmModalPortal } from "@/components/ui/omm-modal";
import {
  readMemberHubSheetPhoneViewport,
  useMemberHubSheetPhone,
} from "@/hooks/use-member-hub-sheet-phone";
import { ApiError, apiFetch } from "@/lib/api";
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
  onClose: () => void;
};

type ModalStep = "form" | "success";

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
  const closingRef = useRef(false);
  const [motionState, setMotionState] = useState<"open" | "closed">("closed");
  const [step, setStep] = useState<ModalStep>("form");
  const [selectedPlanId, setSelectedPlanId] = useState(() =>
    resolveDefaultPlanId(plans, initialPlanId),
  );
  const [paymentMethod, setPaymentMethod] = useState<ManualPaymentMethod>("CARD");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPhone = useMemberHubSheetPhone();
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? plans[0];
  const sheetTitle = step === "success" ? t("successTitle") : t("title");

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMotionState("open");
    });

    return () => {
      cancelAnimationFrame(frame);
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
      await apiFetch("/packages/me/subscribe", {
        method: "POST",
        body: JSON.stringify({
          planId: selectedPlan.id,
          paymentMethod,
        }),
      });
      setStep("success");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("submitFailed"));
    } finally {
      setBusy(false);
    }
  }

  function finishClose() {
    onClose();
  }

  function handleClose() {
    if (busy || closingRef.current) {
      return;
    }

    dismissMobileKeyboard();
    closingRef.current = true;
    setMotionState("closed");

    const motionMs = readMemberHubSheetPhoneViewport()
      ? PACKAGE_SUBSCRIBE_MOBILE_MOTION_MS
      : PACKAGE_SUBSCRIBE_DESKTOP_MOTION_MS;

    window.setTimeout(finishClose, motionMs);
  }

  function handleDone() {
    handleClose();
  }

  const sheetBody =
    step === "success" ? (
      <SuccessPanel onDone={handleDone} />
    ) : (
      <form onSubmit={(event) => void onConfirm(event)} className={PACKAGE_SUBSCRIBE_FORM_CLASS}>
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
    );

  const sheetHeader = (headerClassName: string) => (
    <header className={headerClassName}>
      <h2 id={titleId} className={PACKAGE_SUBSCRIBE_SHEET_TITLE_CLASS}>
        {sheetTitle}
      </h2>
      <button
        type="button"
        className={ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS}
        aria-label={t("closeModal")}
        onClick={handleClose}
        disabled={busy}
      >
        <SheetCloseIcon />
      </button>
    </header>
  );

  return (
    <>
      <OmmModalPortal
        isOpen={isOpen}
        onClose={handleClose}
        bottomAnchored
        backdropAriaLabel={t("closeModal")}
        ariaLabelledBy={titleId}
        closeDisabled={busy}
        overlayClassName={PACKAGE_SUBSCRIBE_MOBILE_OVERLAY_CLASS}
        panelClassName={PACKAGE_SUBSCRIBE_MOBILE_PANEL_CLASS}
        panelStyle={memberAccountHubSheetPanelStyle()}
        motionState={motionState}
      >
        <div className={MEMBER_ACCOUNT_HUB_SHEET_GRABBER_CLASS} aria-hidden />
        {sheetHeader(MEMBER_ACCOUNT_HUB_SHEET_HEADER_CLASS)}
        <div className={PACKAGE_SUBSCRIBE_MOBILE_BODY_CLASS}>{sheetBody}</div>
      </OmmModalPortal>

      <OmmDrawerPortal
        isOpen={isOpen && !isPhone}
        onClose={handleClose}
        backdropAriaLabel={t("closeModal")}
        ariaLabelledBy={titleId}
        closeDisabled={busy}
        overlayClassName={PACKAGE_SUBSCRIBE_DESKTOP_OVERLAY_CLASS}
        backdropClassName={PACKAGE_SUBSCRIBE_DESKTOP_BACKDROP_CLASS}
        panelClassName={PACKAGE_SUBSCRIBE_DESKTOP_PANEL_CLASS}
        motionState={motionState}
      >
        {sheetHeader(PACKAGE_SUBSCRIBE_DESKTOP_HEADER_CLASS)}
        <div className={PACKAGE_SUBSCRIBE_DESKTOP_BODY_CLASS}>{sheetBody}</div>
      </OmmDrawerPortal>
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
