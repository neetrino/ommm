"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { OmmButton } from "@/components/ui/omm-button";
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

const FIELD_CLASS = "h-10 w-full rounded-xl border border-sand-500/30 bg-white px-3 text-sm";

export function StudioCartForm() {
  const t = useTranslations("userPages.giftCards");
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

  return (
    <section className="space-y-3 rounded-[24px] border border-white/70 bg-white/80 p-4">
      <h2 className="text-sm font-semibold text-sage-900">{t("cartTitle")}</h2>
      <p className="text-sm text-sage-700">{t("cartHint")}</p>
      <CartChoices
        plans={plans}
        sessions={sessions}
        bar={bar}
        packagePlanId={packagePlanId}
        sessionId={sessionId}
        barProductId={barProductId}
        packageLabel={t("cartPackage")}
        sessionLabel={t("cartSession")}
        barLabel={t("cartBar")}
        onPackage={setPackagePlanId}
        onSession={setSessionId}
        onBar={setBarProductId}
      />
      <CartPay
        packagePlanId={packagePlanId}
        sessionId={sessionId}
        barProductId={barProductId}
        useGiftCredits={useGiftCredits}
        onGift={setUseGiftCredits}
        notice={notice}
        error={error}
        setNotice={setNotice}
        setError={setError}
        {...cartLabels(t)}
      />
    </section>
  );
}

const CART_SESSION_LIMIT = 40;

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
  packageLabel: string;
  sessionLabel: string;
  barLabel: string;
  onPackage: (value: string) => void;
  onSession: (value: string) => void;
  onBar: (value: string) => void;
}) {
  return (
    <>
      <select className={FIELD_CLASS} value={props.packagePlanId} onChange={(event) => props.onPackage(event.target.value)}>
        <option value="">{props.packageLabel}</option>
        {props.plans.map((plan) => (
          <option key={plan.id} value={plan.id}>{plan.name}</option>
        ))}
      </select>
      <select className={FIELD_CLASS} value={props.sessionId} onChange={(event) => props.onSession(event.target.value)}>
        <option value="">{props.sessionLabel}</option>
        {props.sessions.slice(0, CART_SESSION_LIMIT).map((session) => (
          <option key={session.id} value={session.id}>
            {session.classType.name} · {session.startsAt.slice(0, 16).replace("T", " ")}
          </option>
        ))}
      </select>
      <select className={FIELD_CLASS} value={props.barProductId} onChange={(event) => props.onBar(event.target.value)}>
        <option value="">{props.barLabel}</option>
        {props.bar.map((item) => (
          <option key={item.id} value={item.id}>{item.name}</option>
        ))}
      </select>
    </>
  );
}

function CartPay(props: {
  packagePlanId: string;
  sessionId: string;
  barProductId: string;
  useGiftCredits: boolean;
  onGift: (value: boolean) => void;
  notice: string | null;
  error: string | null;
  setNotice: (value: string | null) => void;
  setError: (value: string | null) => void;
  giftLabel: string;
  noneLabel: string;
  pendingLabel: string;
  paidLabel: string;
  failedLabel: string;
  submitLabel: string;
}) {
  return (
    <>
      <label className="flex items-center gap-2 text-sm text-sage-800">
        <input type="checkbox" checked={props.useGiftCredits} onChange={(event) => props.onGift(event.target.checked)} />
        {props.giftLabel}
      </label>
      {props.error !== null ? <p className="text-sm text-red-800">{props.error}</p> : null}
      {props.notice !== null ? <p className="text-sm text-sage-700">{props.notice}</p> : null}
      <OmmButton
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => void submitCart(props)}
      >
        {props.submitLabel}
      </OmmButton>
    </>
  );
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
