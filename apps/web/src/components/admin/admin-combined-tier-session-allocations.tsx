"use client";

import { useTranslations } from "next-intl";
import {
  MAX_PACKAGE_SESSIONS,
  MIN_PACKAGE_SESSIONS,
  OMMM_INPUT_NUMBER_CLASS,
  preventNumberArrowStep,
} from "@/components/admin/admin-package-form-utils";
import type { AdminCombinedPlanComponent } from "@/components/admin/admin-packages-types";

type AdminCombinedTierSessionAllocationsProps = {
  components: readonly AdminCombinedPlanComponent[];
  allocations: Readonly<Record<string, string>>;
  totalSessions: number;
  onAllocationChange: (componentId: string, value: string) => void;
  disabled?: boolean;
};

export function AdminCombinedTierSessionAllocations({
  components,
  allocations,
  totalSessions,
  onAllocationChange,
  disabled = false,
}: AdminCombinedTierSessionAllocationsProps) {
  const t = useTranslations("adminPages.packages.combinedForm");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-medium text-sage-800">{t("sourceAllocationHeading")}</p>
        <p className="mt-1 text-xs text-sage-500">{t("sourceAllocationDescription")}</p>
      </div>
      <ul className="flex flex-col gap-3">
        {components.map((component) => (
          <li
            key={component.id}
            className="grid gap-3 rounded-2xl border border-white/70 bg-white/80 p-4 sm:grid-cols-[minmax(0,1fr)_8rem]"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-sage-900">
                {component.sourceCategoryNameSnapshot}
              </p>
              <p className="truncate text-xs text-sage-500">
                {component.sourcePackageNameSnapshot}
              </p>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="ommm-label text-xs uppercase tracking-wide">
                {t("sourceAllocationCountLabel")}
              </span>
              <input
                type="number"
                className={OMMM_INPUT_NUMBER_CLASS}
                min={MIN_PACKAGE_SESSIONS}
                max={MAX_PACKAGE_SESSIONS}
                value={allocations[component.id] ?? String(MIN_PACKAGE_SESSIONS)}
                onChange={(event) => onAllocationChange(component.id, event.target.value)}
                onKeyDown={preventNumberArrowStep}
                disabled={disabled}
                required
              />
            </label>
          </li>
        ))}
      </ul>
      <div className="rounded-2xl border border-sand-200/80 bg-sand-50/80 px-4 py-3">
        <p className="text-sm font-semibold text-sage-900">
          {t("sourceAllocationTotal", { count: totalSessions })}
        </p>
        <p className="mt-1 text-xs text-sage-600">
          {t("sourceAllocationBreakdown", {
            breakdown: components
              .map((component) => {
                const count = allocations[component.id] ?? String(MIN_PACKAGE_SESSIONS);
                return `${component.sourceCategoryNameSnapshot}: ${count}`;
              })
              .join(" · "),
          })}
        </p>
      </div>
    </div>
  );
}
