"use client";

import { useEffect, useState } from "react";
import { GiftOptionSelect } from "@/components/account/custom-gift-option-fields";
import {
  plansForClassType,
  type CartPlanOption,
} from "@/components/account/studio-cart-class-plans";
import type { OmmSelectOption } from "@/components/ui/omm-select-dropdown";
import { apiFetch } from "@/lib/api";
import { formatSessionRange } from "@/lib/format-session-time";
import { formatAmdFromCents } from "@/lib/price-amd";

type GiftPlan = CartPlanOption & {
  priceCents?: number;
  finalPriceCents?: number;
  typeSessionAllocations?: ReadonlyArray<{ classTypeId: string; sessionCount?: number }>;
};

type GiftSession = {
  id: string;
  startsAt: string;
  endsAt: string;
  priceCents: number;
  classType: { id: string; name: string };
};

type NamedRow = { id: string; name: string };

type CustomGiftClassChoicesProps = {
  classTypeId: string;
  classTypes: readonly NamedRow[];
  disabled: boolean;
  classPlaceholder: string;
  classTypeLabel: string;
  packageLabel: string;
  sessionLabel: string;
  skipLabel: string;
  priceCaption: string;
  onClassTypeChange: (classTypeId: string) => void;
  onClassSessionsChange: (classSessions: string) => void;
  onQuotedPriceChange: (amountAmd: number | null) => void;
};

/** Class type, then that type's packages, then a scheduled class with its time. */
export function CustomGiftClassChoices(props: CustomGiftClassChoicesProps) {
  return (
    <div className="grid gap-4">
      <GiftOptionSelect
        label={props.classTypeLabel}
        value={props.classTypeId}
        disabled={props.disabled}
        options={namedOptions(props.classPlaceholder, props.classTypes)}
        onChange={(value) => {
          props.onClassTypeChange(value);
          props.onClassSessionsChange("");
          props.onQuotedPriceChange(null);
        }}
      />
      {props.classTypeId.length > 0 ? (
        <GiftPackageAndClass
          key={props.classTypeId}
          classTypeId={props.classTypeId}
          disabled={props.disabled}
          packageLabel={props.packageLabel}
          sessionLabel={props.sessionLabel}
          skipLabel={props.skipLabel}
          priceCaption={props.priceCaption}
          onClassSessionsChange={props.onClassSessionsChange}
          onQuotedPriceChange={props.onQuotedPriceChange}
        />
      ) : null}
    </div>
  );
}

type GiftPackageAndClassProps = {
  classTypeId: string;
  disabled: boolean;
  packageLabel: string;
  sessionLabel: string;
  skipLabel: string;
  priceCaption: string;
  onClassSessionsChange: (classSessions: string) => void;
  onQuotedPriceChange: (amountAmd: number | null) => void;
};

function GiftPackageAndClass(props: GiftPackageAndClassProps) {
  const catalog = useGiftClassCatalog(props.classTypeId);
  const pick = useGiftClassPick(catalog.plans, props.classTypeId, props.onClassSessionsChange);
  const packages = plansForClassType(catalog.plans, props.classTypeId);
  const quotedAmd = quoteClassGiftAmd({
    sessions: catalog.sessions,
    plans: catalog.plans,
    packageId: pick.packageId,
    classTypeId: props.classTypeId,
  });
  useClassGiftQuote({
    sessions: catalog.sessions,
    plans: catalog.plans,
    packageId: pick.packageId,
    classTypeId: props.classTypeId,
    onQuotedPriceChange: props.onQuotedPriceChange,
  });
  return (
    <>
      <GiftOptionSelect
        label={props.packageLabel}
        value={pick.packageId}
        disabled={props.disabled}
        options={packageGiftOptions(props.skipLabel, packages)}
        onChange={pick.choosePackage}
      />
      <GiftOptionSelect
        label={props.sessionLabel}
        value={pick.sessionId}
        disabled={props.disabled}
        options={sessionOptions(props.skipLabel, catalog.sessions)}
        onChange={pick.chooseSession}
      />
      <ClassGiftPrice caption={props.priceCaption} amountAmd={quotedAmd} />
    </>
  );
}

function useGiftClassPick(
  plans: readonly GiftPlan[],
  classTypeId: string,
  onClassSessionsChange: (classSessions: string) => void,
) {
  const [packageId, setPackageId] = useState("");
  const [sessionId, setSessionId] = useState("");
  function choosePackage(nextPackageId: string): void {
    setPackageId(nextPackageId);
    onClassSessionsChange(publishedSessions(plans, classTypeId, nextPackageId, sessionId));
  }
  function chooseSession(nextSessionId: string): void {
    setSessionId(nextSessionId);
    onClassSessionsChange(publishedSessions(plans, classTypeId, packageId, nextSessionId));
  }
  return { packageId, sessionId, choosePackage, chooseSession };
}

function publishedSessions(
  plans: readonly GiftPlan[],
  classTypeId: string,
  packageId: string,
  sessionId: string,
): string {
  if (sessionId.length === 0) {
    return "";
  }
  return String(packageSessionCount(plans, packageId, classTypeId));
}

function useGiftClassCatalog(classTypeId: string): {
  plans: readonly GiftPlan[];
  sessions: readonly GiftSession[];
} {
  const [plans, setPlans] = useState<readonly GiftPlan[]>([]);
  const [sessions, setSessions] = useState<readonly GiftSession[]>([]);
  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      apiFetch<GiftPlan[]>("/packages/plans").catch(() => []),
      apiFetch<GiftSession[]>(`/classes/sessions?typeId=${encodeURIComponent(classTypeId)}`).catch(() => []),
    ]).then(([nextPlans, nextSessions]) => {
      if (!cancelled) {
        setPlans(nextPlans);
        setSessions(nextSessions);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [classTypeId]);
  return { plans, sessions };
}

/** Drop-in price of the latest priced class, times the package session count. */
function useClassGiftQuote(input: {
  sessions: readonly GiftSession[];
  plans: readonly GiftPlan[];
  packageId: string;
  classTypeId: string;
  onQuotedPriceChange: (amountAmd: number | null) => void;
}): void {
  const { sessions, plans, packageId, classTypeId, onQuotedPriceChange } = input;
  useEffect(() => {
    onQuotedPriceChange(quoteClassGiftAmd({ sessions, plans, packageId, classTypeId }));
  }, [sessions, plans, packageId, classTypeId, onQuotedPriceChange]);
}

function quoteClassGiftAmd(input: {
  sessions: readonly GiftSession[];
  plans: readonly GiftPlan[];
  packageId: string;
  classTypeId: string;
}): number | null {
  const packagePrice = planPriceAmd(input.plans.find((plan) => plan.id === input.packageId));
  if (packagePrice !== null) {
    return packagePrice;
  }
  const unit = latestSessionPriceAmd(input.sessions);
  if (unit === null) {
    return null;
  }
  const quantity =
    input.packageId.length > 0
      ? packageSessionCount(input.plans, input.packageId, input.classTypeId)
      : 1;
  return unit * quantity;
}

function planPriceAmd(plan: GiftPlan | undefined): number | null {
  if (!plan) {
    return null;
  }
  const amount = plan.finalPriceCents ?? plan.priceCents ?? 0;
  return amount > 0 ? amount : null;
}

function ClassGiftPrice({ caption, amountAmd }: { caption: string; amountAmd: number | null }) {
  if (amountAmd === null) {
    return null;
  }
  return (
    <p className="flex items-center justify-between gap-4 rounded-[20px] border border-sand-500/40 bg-sand-100 px-5 py-4">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sand-700">{caption}</span>
      <span className="font-serif text-[2rem] leading-none tracking-tight text-sage-950">
        {formatAmdFromCents(amountAmd)}
      </span>
    </p>
  );
}

function latestSessionPriceAmd(sessions: readonly GiftSession[]): number | null {
  let latest: GiftSession | null = null;
  for (const session of sessions) {
    if (session.priceCents <= 0) {
      continue;
    }
    if (latest === null || session.startsAt > latest.startsAt) {
      latest = session;
    }
  }
  return latest?.priceCents ?? null;
}

function packageSessionCount(
  plans: readonly GiftPlan[],
  packageId: string,
  classTypeId: string,
): number {
  const plan = plans.find((item) => item.id === packageId);
  const allocation = plan?.typeSessionAllocations?.find((item) => item.classTypeId === classTypeId);
  if (allocation?.sessionCount !== undefined && allocation.sessionCount > 0) {
    return allocation.sessionCount;
  }
  return 1;
}

function namedOptions(emptyLabel: string, rows: readonly NamedRow[]): OmmSelectOption<string>[] {
  return [{ value: "", label: emptyLabel }, ...rows.map((row) => ({ value: row.id, label: row.name }))];
}

function packageGiftOptions(
  emptyLabel: string,
  plans: readonly GiftPlan[],
): OmmSelectOption<string>[] {
  return [
    { value: "", label: emptyLabel },
    ...plans.map((plan) => ({
      value: plan.id,
      label: packageOptionLabel(plan),
    })),
  ];
}

function packageOptionLabel(plan: GiftPlan): string {
  const price = planPriceAmd(plan);
  if (price === null) {
    return plan.name;
  }
  return `${plan.name} · ${formatAmdFromCents(price)}`;
}

function sessionOptions(emptyLabel: string, sessions: readonly GiftSession[]): OmmSelectOption<string>[] {
  return [
    { value: "", label: emptyLabel },
    ...sessions.map((session) => ({
      value: session.id,
      label: sessionOptionLabel(session),
    })),
  ];
}

function sessionOptionLabel(session: GiftSession): string {
  const when = `${session.classType.name} · ${formatSessionRange(session.startsAt, session.endsAt)}`;
  return session.priceCents > 0 ? `${when} · ${formatAmdFromCents(session.priceCents)}` : when;
}
