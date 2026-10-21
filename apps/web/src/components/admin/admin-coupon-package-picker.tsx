"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { capCouponPackagePlanIds } from "@/components/admin/admin-coupon-form.util";
import {
  couponPackagePlanOptions,
  type CouponPackagePlanOption,
} from "@/components/admin/admin-coupon-package-options";
import type { CouponProductKind } from "@/components/admin/admin-coupons-types";
import {
  normalizeAdminPackageRow,
  type AdminPackageRow,
} from "@/components/admin/admin-packages-types";
import { OmmFilterMultiSelect } from "@/components/ui/omm-filter-multi-select";
import { apiFetch } from "@/lib/api";

type LoadPhase = "loading" | "ready" | "error";

export function CouponPackagePlanPicker({
  kinds,
  selectedIds,
  onChange,
}: {
  kinds: readonly CouponProductKind[];
  selectedIds: readonly string[];
  onChange: (ids: string[]) => void;
}) {
  const { phase, options, t } = useCouponPackagePlanMenu(selectedIds);

  function applySelection(next: readonly string[]): void {
    onChange(capCouponPackagePlanIds(kinds, next));
  }

  const selectedOptions = options.filter((option) => selectedIds.includes(option.value));
  return (
    <div className="flex flex-col gap-1.5">
      <span className="ommm-label text-xs uppercase tracking-wide">{t("packagePlansLabel")}</span>
      <OmmFilterMultiSelect
        className="w-full"
        ariaLabel={t("packagePlansLabel")}
        allLabel={t(phase === "loading" ? "packagePlansLoading" : "packagePlansAll")}
        options={options}
        selectedValues={selectedIds}
        disabled={phase !== "ready"}
        wrapLabel
        menuPlacement="top"
        formatSelectedCount={(count) => t("packagePlansSelected", { count })}
        onChange={applySelection}
      />
      {phase === "ready" ? (
        <SelectedPackageChips
          options={selectedOptions}
          removeLabel={(name) => t("packagePlansRemove", { name })}
          onRemove={(id) => applySelection(selectedIds.filter((selected) => selected !== id))}
        />
      ) : null}
      <p className="text-xs text-sage-500">
        {t(phase === "error" ? "packagePlansLoadFailed" : "packagePlansHint")}
      </p>
    </div>
  );
}

function useCouponPackagePlanMenu(selectedIds: readonly string[]) {
  const t = useTranslations("adminPages.coupons");
  const { plans, phase } = useCouponPackagePlans();
  const labels = useMemo(
    () => ({
      sessions: (count: number) => t("packagePlansSessions", { count }),
      unlimited: t("packagePlansUnlimited"),
      inactive: t("packagePlansInactive"),
      missing: t("packagePlansMissing"),
    }),
    [t],
  );
  const options = useMemo(() => {
    if (phase !== "ready") {
      return selectedIds.map((id) => ({ value: id, label: t("packagePlansLoading") }));
    }
    return couponPackagePlanOptions(plans, selectedIds, labels);
  }, [labels, phase, plans, selectedIds, t]);
  return { phase, options, t };
}

function useCouponPackagePlans(): {
  plans: readonly AdminPackageRow[];
  phase: LoadPhase;
} {
  const [plans, setPlans] = useState<readonly AdminPackageRow[]>([]);
  const [phase, setPhase] = useState<LoadPhase>("loading");

  useEffect(() => {
    let cancelled = false;
    void apiFetch<AdminPackageRow[]>("/packages/admin/plans")
      .then((rows) => {
        if (cancelled) {
          return;
        }
        setPlans(rows.map(normalizeAdminPackageRow));
        setPhase("ready");
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setPlans([]);
        setPhase("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { plans, phase };
}

function SelectedPackageChips({
  options,
  removeLabel,
  onRemove,
}: {
  options: readonly CouponPackagePlanOption[];
  removeLabel: (name: string) => string;
  onRemove: (id: string) => void;
}) {
  if (options.length === 0) {
    return null;
  }
  return (
    <ul className="flex flex-wrap gap-1.5">
      {options.map((option) => (
        <li key={option.value}>
          <button
            type="button"
            className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-sand-300 bg-white px-2.5 py-1 text-left text-xs text-sage-800"
            aria-label={removeLabel(option.label)}
            onClick={() => onRemove(option.value)}
          >
            <span className="min-w-0 break-words">{option.label}</span>
            <span aria-hidden className="text-sage-500">×</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
