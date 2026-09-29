"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { GiftOptionSelect } from "@/components/account/custom-gift-option-fields";
import { GIFT_SOFT_FIELD_CARD_CLASS } from "@/components/account/gift-recipient-picker";
import {
  packageMatchesClassType,
  plansForClassType,
  type CartPlanOption,
} from "@/components/account/studio-cart-class-plans";
import { OmmButton } from "@/components/ui/omm-button";
import type { OmmSelectOption } from "@/components/ui/omm-select-dropdown";
import { ApiError, apiFetch } from "@/lib/api";
import { formatSessionRange } from "@/lib/format-session-time";

type PlanOption = CartPlanOption & { priceCents: number };
type ClassTypeOption = { id: string; name: string };
type SessionOption = {
  id: string;
  priceCents: number;
  startsAt: string;
  endsAt: string;
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
        classTypeLabel={t("cartClassType")}
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
  const [classTypes, setClassTypes] = useState<ClassTypeOption[]>([]);
  const [sessions, setSessions] = useState<SessionOption[]>([]);
  const [bar, setBar] = useState<BarOption[]>([]);
  const [classTypeId, setClassTypeId] = useState("");
  const [packagePlanId, setPackagePlanId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [barProductId, setBarProductId] = useState("");
  const [useGiftCredits, setUseGiftCredits] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    void loadCartOptions(setPlans, setClassTypes, setSessions, setBar);
  }, []);
  function chooseClassType(next: string) {
    setClassTypeId(next);
    setPackagePlanId((current) => (packageMatchesClassType(plans, current, next) ? current : ""));
  }
  return {
    plans,
    classTypes,
    sessions,
    bar,
    classTypeId,
    packagePlanId,
    sessionId,
    barProductId,
    useGiftCredits,
    notice,
    error,
    chooseClassType,
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
  classTypeLabel,
  packageLabel,
  sessionLabel,
  barLabel,
  giftLabel,
}: {
  cart: StudioCartState;
  title: string;
  hint: string;
  skipLabel: string;
  classTypeLabel: string;
  packageLabel: string;
  sessionLabel: string;
  barLabel: string;
  giftLabel: string;
}) {
  return (
    <div className="space-y-4 px-5 py-7 sm:px-8 sm:py-8">
      <header>
        <h2 className="font-serif text-2xl font-normal leading-tight tracking-tight text-sage-900">{title}</h2>
        <p className="mt-1.5 max-w-lg text-sm leading-6 text-sage-500">{hint}</p>
      </header>
      <div className={`${GIFT_SOFT_FIELD_CARD_CLASS} grid gap-4`}>
        <CartChoices
          cart={cart}
          skipLabel={skipLabel}
          classTypeLabel={classTypeLabel}
          packageLabel={packageLabel}
          sessionLabel={sessionLabel}
          barLabel={barLabel}
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
  cart: StudioCartState;
  skipLabel: string;
  classTypeLabel: string;
  packageLabel: string;
  sessionLabel: string;
  barLabel: string;
}) {
  const packages = plansForClassType(props.cart.plans, props.cart.classTypeId);
  return (
    <>
      <GiftOptionSelect label={props.classTypeLabel} value={props.cart.classTypeId} disabled={false} options={namedOptions(props.skipLabel, props.cart.classTypes)} onChange={props.cart.chooseClassType} />
      <GiftOptionSelect label={props.packageLabel} value={props.cart.packagePlanId} disabled={props.cart.classTypeId === ""} options={namedOptions(props.skipLabel, packages)} onChange={props.cart.setPackagePlanId} />
      <GiftOptionSelect label={props.sessionLabel} value={props.cart.sessionId} disabled={false} options={sessionOptions(props.skipLabel, props.cart.sessions)} onChange={props.cart.setSessionId} />
      <GiftOptionSelect label={props.barLabel} value={props.cart.barProductId} disabled={false} options={namedOptions(props.skipLabel, props.cart.bar)} onChange={props.cart.setBarProductId} />
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
      label: `${session.classType.name} · ${formatSessionRange(session.startsAt, session.endsAt)}`,
    })),
  ];
}

async function loadCartOptions(
  setPlans: (rows: PlanOption[]) => void,
  setClassTypes: (rows: ClassTypeOption[]) => void,
  setSessions: (rows: SessionOption[]) => void,
  setBar: (rows: BarOption[]) => void,
): Promise<void> {
  const [plans, classTypes, sessions, bar] = await Promise.all([
    apiFetch<PlanOption[]>("/packages/plans").catch(() => []),
    apiFetch<ClassTypeOption[]>("/classes/types").catch(() => []),
    apiFetch<SessionOption[]>("/classes/sessions").catch(() => []),
    apiFetch<BarOption[]>("/bar/products").catch(() => []),
  ]);
  setPlans(plans);
  setClassTypes(classTypes);
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
