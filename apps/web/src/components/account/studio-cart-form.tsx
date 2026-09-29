"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { GiftOptionSelect } from "@/components/account/custom-gift-option-fields";
import { GIFT_SOFT_FIELD_CARD_CLASS } from "@/components/account/gift-recipient-picker";
import { OmmButton } from "@/components/ui/omm-button";
import type { OmmSelectOption } from "@/components/ui/omm-select-dropdown";
import { ApiError, apiFetch } from "@/lib/api";

type PlanOption = { id: string; name: string; priceCents: number };
type SessionOption = {
  id: string;
  title: string | null;
  priceCents: number;
  startsAt: string;
  classType: { name: string };
};
type BarOption = { id: string; name: string; priceAmd: number };
type CartPayment = { status: string; amountCents: number; paymentReference: string | null };

const CART_SHELL_CLASS =
  "rounded-[28px] border border-white/80 bg-white/95 shadow-[0_28px_64px_-36px_rgba(45,40,35,0.38)]";

export function StudioCartForm() {
  const t = useTranslations("userPages.giftCards");
  const cart = useStudioCartState();
  const labels = cartLabels(t);
  return (
    <section className={CART_SHELL_CLASS}>
      <StudioCartBody
        cart={cart}
        title={t("cartTitle")}
        hint={t("cartHint")}
        skipLabel={t("cartSkip")}
        packageLabel={t("cartPackage")}
        sessionLabel={t("cartSession")}
        barLabel={t("cartBar")}
        giftLabel={labels.giftLabel}
      />
      <StudioCartSubmit cart={cart} labels={labels} />
    </section>
  );
}

function useStudioCartState() {
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [sessions, setSessions] = useState<SessionOption[]>([]);
  const [bar, setBar] = useState<BarOption[]>([]);
  const [packagePlanId, setPackagePlanId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [barProductId, setBarProductId] = useState("");
  const [useGiftCredits, setUseGiftCredits] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    void loadCartOptions(setPlans, setSessions, setBar);
  }, []);
  return {
    plans,
    sessions,
    bar,
    packagePlanId,
    sessionId,
    barProductId,
    useGiftCredits,
    notice,
    error,
    setPackagePlanId,
    setSessionId,
    setBarProductId,
    setUseGiftCredits,
    setNotice,
    setError,
  };
}

type StudioCartState = ReturnType<typeof useStudioCartState>;

const CART_SESSION_LIMIT = 40;

function StudioCartBody({
  cart,
  title,
  hint,
  skipLabel,
  packageLabel,
  sessionLabel,
  barLabel,
  giftLabel,
}: {
  cart: StudioCartState;
  title: string;
  hint: string;
  skipLabel: string;
  packageLabel: string;
  sessionLabel: string;
  barLabel: string;
  giftLabel: string;
}) {
  return (
    <div className="space-y-4 px-5 py-7 sm:px-8 sm:py-8">
      <header>
        <h2 className="font-serif text-2xl font-normal leading-tight tracking-tight text-sage-900">
          {title}
        </h2>
        <p className="mt-1.5 max-w-lg text-sm leading-6 text-sage-500">{hint}</p>
      </header>
      <div className={`${GIFT_SOFT_FIELD_CARD_CLASS} grid gap-4`}>
        <CartChoices
          plans={cart.plans}
          sessions={cart.sessions}
          bar={cart.bar}
          packagePlanId={cart.packagePlanId}
          sessionId={cart.sessionId}
          barProductId={cart.barProductId}
          skipLabel={skipLabel}
          packageLabel={packageLabel}
          sessionLabel={sessionLabel}
          barLabel={barLabel}
          onPackage={cart.setPackagePlanId}
          onSession={cart.setSessionId}
          onBar={cart.setBarProductId}
        />
        <GiftCreditToggle checked={cart.useGiftCredits} label={giftLabel} onChange={cart.setUseGiftCredits} />
      </div>
      <CartNotices error={cart.error} notice={cart.notice} />
    </div>
  );
}

function cartLabels(t: (key: string) => string) {
  return {
    giftLabel: t("cartUseGift"),
    noneLabel: t("cartNone"),
    pendingLabel: t("cartPending"),
    paidLabel: t("cartPaid"),
    failedLabel: t("cartFailed"),
    submitLabel: t("cartSubmit"),
  };
}

function CartChoices(props: {
  plans: PlanOption[];
  sessions: SessionOption[];
  bar: BarOption[];
  packagePlanId: string;
  sessionId: string;
  barProductId: string;
  skipLabel: string;
  packageLabel: string;
  sessionLabel: string;
  barLabel: string;
  onPackage: (value: string) => void;
  onSession: (value: string) => void;
  onBar: (value: string) => void;
}) {
  return (
    <>
      <GiftOptionSelect label={props.packageLabel} value={props.packagePlanId} disabled={false} options={namedOptions(props.skipLabel, props.plans)} onChange={props.onPackage} />
      <GiftOptionSelect label={props.sessionLabel} value={props.sessionId} disabled={false} options={sessionOptions(props.skipLabel, props.sessions)} onChange={props.onSession} />
      <GiftOptionSelect label={props.barLabel} value={props.barProductId} disabled={false} options={namedOptions(props.skipLabel, props.bar)} onChange={props.onBar} />
    </>
  );
}

function GiftCreditToggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-2xl border border-sand-100 bg-sand-50/80 px-4 py-3">
      <span className="text-sm font-medium text-sage-800">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        className="h-4 w-4 accent-sage-800"
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

function CartNotices({ error, notice }: { error: string | null; notice: string | null }) {
  if (error === null && notice === null) {
    return null;
  }
  return (
    <>
      {error !== null ? <p className="text-sm text-red-800">{error}</p> : null}
      {notice !== null ? <p className="text-sm text-sage-700">{notice}</p> : null}
    </>
  );
}

function StudioCartSubmit({
  cart,
  labels,
}: {
  cart: StudioCartState;
  labels: ReturnType<typeof cartLabels>;
}) {
  return (
    <div className="flex justify-end rounded-b-[28px] border-t border-sand-500/25 px-5 py-4 sm:px-8">
      <OmmButton
        type="button"
        variant="primary"
        className="w-full sm:w-auto"
        onClick={() =>
          void submitCart({
            packagePlanId: cart.packagePlanId,
            sessionId: cart.sessionId,
            barProductId: cart.barProductId,
            useGiftCredits: cart.useGiftCredits,
            setNotice: cart.setNotice,
            setError: cart.setError,
            ...labels,
          })
        }
      >
        {labels.submitLabel}
      </OmmButton>
    </div>
  );
}

function namedOptions(skipLabel: string, rows: readonly { id: string; name: string }[]): OmmSelectOption<string>[] {
  return [{ value: "", label: skipLabel }, ...rows.map((row) => ({ value: row.id, label: row.name }))];
}

function sessionOptions(skipLabel: string, sessions: readonly SessionOption[]): OmmSelectOption<string>[] {
  return [
    { value: "", label: skipLabel },
    ...sessions.slice(0, CART_SESSION_LIMIT).map((session) => ({
      value: session.id,
      label: `${session.classType.name} · ${session.startsAt.slice(0, 16).replace("T", " ")}`,
    })),
  ];
}

async function loadCartOptions(
  setPlans: (rows: PlanOption[]) => void,
  setSessions: (rows: SessionOption[]) => void,
  setBar: (rows: BarOption[]) => void,
): Promise<void> {
  const [plans, sessions, bar] = await Promise.all([
    apiFetch<PlanOption[]>("/packages/plans").catch(() => []),
    apiFetch<SessionOption[]>("/classes/sessions").catch(() => []),
    apiFetch<BarOption[]>("/bar/products").catch(() => []),
  ]);
  setPlans(plans);
  setSessions(sessions);
  setBar(bar);
}

async function submitCart(input: {
  packagePlanId: string;
  sessionId: string;
  barProductId: string;
  useGiftCredits: boolean;
  noneLabel: string;
  pendingLabel: string;
  paidLabel: string;
  failedLabel: string;
  setNotice: (value: string | null) => void;
  setError: (value: string | null) => void;
}): Promise<void> {
  if (input.packagePlanId === "" && input.sessionId === "" && input.barProductId === "") {
    input.setError(input.noneLabel);
    return;
  }
  input.setError(null);
  try {
    const payment = await apiFetch<CartPayment>("/payments/checkout/cart", {
      method: "POST",
      body: JSON.stringify({
        packagePlanId: input.packagePlanId || undefined,
        sessionId: input.sessionId || undefined,
        barProductId: input.barProductId || undefined,
        useGiftCredits: input.useGiftCredits,
      }),
    });
    const reference = payment.paymentReference ?? "";
    input.setNotice(payment.status === "SUCCEEDED" ? input.paidLabel : `${input.pendingLabel} ${reference}`);
  } catch (caught) {
    input.setError(caught instanceof ApiError ? caught.message : input.failedLabel);
  }
}
