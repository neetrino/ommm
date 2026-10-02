"use client";

import { useEffect, useState } from "react";
import { GiftOptionSelect } from "@/components/account/custom-gift-option-fields";
import {
  plansForClassType,
  type CartPlanOption,
} from "@/components/account/studio-cart-class-plans";
import type { OmmSelectOption } from "@/components/ui/omm-select-dropdown";
import { apiFetch } from "@/lib/api";
import { formatAmdFromCents } from "@/lib/price-amd";

type GiftPlan = CartPlanOption & {
  priceCents?: number;
  finalPriceCents?: number;
};

type NamedRow = { id: string; name: string };

type CustomGiftClassChoicesProps = {
  classTypeId: string;
  classTypes: readonly NamedRow[];
  disabled: boolean;
  classPlaceholder: string;
  classTypeLabel: string;
  packageLabel: string;
  skipLabel: string;
  priceCaption: string;
  onClassTypeChange: (classTypeId: string) => void;
  onClassSessionsChange: (classSessions: string) => void;
  onPackagePlanChange?: (packagePlanId: string) => void;
  onQuotedPriceChange: (amountAmd: number | null) => void;
};

/** Class type, then a package. The recipient picks the day later. */
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
          props.onPackagePlanChange?.("");
          props.onQuotedPriceChange(null);
        }}
      />
      {props.classTypeId.length > 0 ? (
        <GiftPackageChoice
          key={props.classTypeId}
          classTypeId={props.classTypeId}
          disabled={props.disabled}
          packageLabel={props.packageLabel}
          skipLabel={props.skipLabel}
          priceCaption={props.priceCaption}
          onClassSessionsChange={props.onClassSessionsChange}
          onPackagePlanChange={props.onPackagePlanChange}
          onQuotedPriceChange={props.onQuotedPriceChange}
        />
      ) : null}
    </div>
  );
}

type GiftPackageChoiceProps = {
  classTypeId: string;
  disabled: boolean;
  packageLabel: string;
  skipLabel: string;
  priceCaption: string;
  onClassSessionsChange: (classSessions: string) => void;
  onPackagePlanChange?: (packagePlanId: string) => void;
  onQuotedPriceChange: (amountAmd: number | null) => void;
};

function GiftPackageChoice(props: GiftPackageChoiceProps) {
  const plans = useClassGiftPlans(props.classTypeId);
  const [packageId, setPackageId] = useState("");
  const chosen = plans.find((plan) => plan.id === packageId) ?? null;
  const quotedAmd = planPriceAmd(chosen ?? undefined);
  useEffect(() => {
    props.onQuotedPriceChange(quotedAmd);
  }, [quotedAmd, props.onQuotedPriceChange]);
  return (
    <>
      <GiftOptionSelect
        label={props.packageLabel}
        value={packageId}
        disabled={props.disabled}
        options={packageGiftOptions(props.skipLabel, plansForClassType(plans, props.classTypeId))}
        onChange={(nextPackageId) => {
          setPackageId(nextPackageId);
          publishPackageGift(plans, props.classTypeId, nextPackageId, props);
        }}
      />
      <ClassGiftPrice caption={props.priceCaption} amountAmd={quotedAmd} />
    </>
  );
}

function publishPackageGift(
  plans: readonly GiftPlan[],
  classTypeId: string,
  packageId: string,
  props: Pick<GiftPackageChoiceProps, "onClassSessionsChange" | "onPackagePlanChange">,
): void {
  const plan = plans.find((item) => item.id === packageId);
  if (!plan) {
    props.onClassSessionsChange("");
    props.onPackagePlanChange?.("");
    return;
  }
  props.onClassSessionsChange(String(packageSessionCount(plan, classTypeId)));
  props.onPackagePlanChange?.(plan.id);
}

function useClassGiftPlans(classTypeId: string): readonly GiftPlan[] {
  const [plans, setPlans] = useState<readonly GiftPlan[]>([]);
  useEffect(() => {
    let cancelled = false;
    void apiFetch<GiftPlan[]>("/packages/plans")
      .catch(() => [])
      .then((nextPlans) => {
        if (!cancelled) {
          setPlans(nextPlans);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [classTypeId]);
  return plans;
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

function packageSessionCount(plan: GiftPlan, classTypeId: string): number {
  const allocation = plan.typeSessionAllocations?.find((item) => item.classTypeId === classTypeId);
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
