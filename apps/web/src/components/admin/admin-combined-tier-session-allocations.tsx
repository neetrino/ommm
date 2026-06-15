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

  const breakdown = components
    .map((component) => {
      const count = allocations[component.id] ?? String(MIN_PACKAGE_SESSIONS);
      return `${component.sourceCategoryNameSnapshot}: ${count}`;
    })
    .join(" · ");

  return (
    <div className="overflow-hidden rounded-[20px] border border-[rgba(151,144,124,0.32)] bg-white/75 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)]">
      <div className="border-b border-[rgba(151,144,124,0.22)] bg-[rgba(151,144,124,0.12)] px-4 py-3.5 sm:px-5">
        <p className="text-sm font-semibold text-sage-900">{t("sourceAllocationHeading")}</p>
        <p className="mt-1 text-xs leading-relaxed text-sage-600">
          {t("sourceAllocationDescription")}
        </p>
      </div>

      <ul className="divide-y divide-[rgba(151,144,124,0.22)]">
        {components.map((component, index) => (
          <li
            key={component.id}
            className="grid gap-4 bg-white/50 px-4 py-4 sm:grid-cols-[auto_minmax(0,1fr)_9rem] sm:items-center sm:px-5"
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sand-100 text-xs font-semibold text-sand-800"
              aria-hidden
            >
              {index + 1}
            </span>
            <div className="min-w-0 sm:col-start-2">
              <p className="truncate text-sm font-semibold text-sage-900">
                {component.sourceCategoryNameSnapshot}
              </p>
              <p className="truncate text-xs text-sage-500">
                {component.sourcePackageNameSnapshot}
              </p>
            </div>
            <label className="flex flex-col gap-1.5 sm:col-start-3">
              <span className="ommm-label text-xs uppercase tracking-wide text-sage-600">
                {t("sourceAllocationCountLabel")}
              </span>
              <input
                type="number"
                className={`${OMMM_INPUT_NUMBER_CLASS} bg-white`}
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

      <div className="border-t border-[rgba(151,144,124,0.28)] bg-sand-50/95 px-4 py-3.5 sm:px-5">
        <p className="text-sm font-semibold text-sage-900">
          {t("sourceAllocationTotal", { count: totalSessions })}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-sage-600">
          {t("sourceAllocationBreakdown", { breakdown })}
        </p>
      </div>
    </div>
  );
}
