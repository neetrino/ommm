"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { AdminClientPackagePlanDetailsModal } from "@/components/admin/admin-client-package-plan-details-modal";
import {
  formatPackagePlanName,
  formatPackagePriceLabel,
} from "@/components/admin/admin-packages-display";
import {
  ADMIN_ACTION_ICON_CLASS,
  EyeGlyph,
} from "@/components/ui/admin-action-glyphs";
import type { PublicPackagePlan } from "@/lib/public-package-plan";

type AdminClientPackageSelectTableProps = {
  locale: string;
  plans: readonly PublicPackagePlan[];
  selectedPlanId: string | null;
  disabled?: boolean;
  onSelectPlan: (planId: string | null) => void;
};

const ROW_CLASS =
  "grid w-full min-w-0 max-w-full grid-cols-[minmax(0,1.5fr)_minmax(0,0.75fr)_minmax(0,0.8fr)_2rem_1.25rem] items-center gap-x-2 sm:gap-x-3";

function EmptyCell() {
  return <span className="text-[rgba(80,69,59,0.4)]">—</span>;
}

function Cell({
  children,
  lead = false,
}: {
  children: ReactNode;
  lead?: boolean;
}) {
  return (
    <div
      className={
        lead
          ? "min-w-0 py-2 text-left text-sm font-semibold text-[#1b1c1a] sm:text-base"
          : "flex min-w-0 items-center justify-center py-2 text-center text-sm font-medium text-[#1b1c1a] sm:text-base"
      }
    >
      {children}
    </div>
  );
}

function resolvePlanTotalSessions(plan: PublicPackagePlan): number | null {
  if (plan.isUnlimited) {
    return null;
  }
  const allocations = plan.typeSessionAllocations;
  if (allocations !== undefined && allocations.length > 0) {
    return allocations.reduce((total, allocation) => total + allocation.sessionCount, 0);
  }
  if (typeof plan.sessionsPerMonth === "number" && plan.sessionsPerMonth > 0) {
    return plan.sessionsPerMonth;
  }
  return null;
}

function SelectionGlyph({ selected }: { selected: boolean }) {
  return (
    <span
      className={[
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
        selected
          ? "border-sage-700 bg-sage-700 text-white"
          : "border-sand-400 bg-white text-transparent",
      ].join(" ")}
      aria-hidden
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3 w-3"
      >
        <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
      </svg>
    </span>
  );
}

export function AdminClientPackageSelectTable({
  locale,
  plans,
  selectedPlanId,
  disabled = false,
  onSelectPlan,
}: AdminClientPackageSelectTableProps) {
  const tPackages = useTranslations("adminPages.packages");
  const tClients = useTranslations("adminPages.clients");
  const [detailsPlanId, setDetailsPlanId] = useState<string | null>(null);
  const detailsPlan = plans.find((plan) => plan.id === detailsPlanId) ?? null;

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden">
      <div
        className={`${ROW_CLASS} border-b border-[rgba(212,196,183,0.2)] pb-4 pt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(80,69,59,0.6)]`}
      >
        <div className="min-w-0 text-left leading-snug">{tPackages("tablePageName")}</div>
        <div className="flex min-w-0 items-center justify-center text-center leading-snug">
          {tPackages("tableTotalSessions")}
        </div>
        <div className="flex min-w-0 items-center justify-center text-center leading-snug">
          {tPackages("tablePrice")}
        </div>
        <div className="h-8 w-8 shrink-0" aria-hidden />
        <div className="h-5 w-5 shrink-0" aria-hidden />
      </div>

      <div className="min-w-0">
        {plans.map((plan) => {
          const packageName = formatPackagePlanName(plan.name, plan.sessionsPerMonth);
          const hasDiscount =
            typeof plan.discountedPriceCents === "number" &&
            plan.discountedPriceCents > 0 &&
            plan.discountedPriceCents < plan.priceCents;
          const originalPriceLabel = hasDiscount
            ? formatPackagePriceLabel(
                { ...plan, discountedPriceCents: null },
                locale,
              )
            : null;
          const finalPriceLabel = formatPackagePriceLabel(plan, locale);
          const totalSessions = resolvePlanTotalSessions(plan);
          const selected = selectedPlanId === plan.id;

          function activateRow(): void {
            if (disabled) {
              return;
            }
            onSelectPlan(selected ? null : plan.id);
          }

          function handleRowKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
            if (event.key !== "Enter" && event.key !== " ") {
              return;
            }
            event.preventDefault();
            activateRow();
          }

          return (
            <div
              key={plan.id}
              className="border-t border-[rgba(212,196,183,0.1)] py-1 first:border-t-0"
            >
              <div
                className={[
                  ROW_CLASS,
                  "cursor-pointer rounded-[25px] px-1 py-2 transition-colors",
                  selected ? "bg-[rgba(151,144,124,0.34)]" : "hover:bg-[rgba(151,144,124,0.26)]",
                  disabled ? "opacity-60" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                role="radio"
                tabIndex={disabled ? -1 : 0}
                aria-checked={selected}
                aria-disabled={disabled}
                aria-label={tClients("packages.selectPlanAria", { name: packageName })}
                onClick={activateRow}
                onKeyDown={handleRowKeyDown}
              >
                <Cell lead>
                  <span className="break-words">{packageName}</span>
                </Cell>
                <Cell>{totalSessions !== null ? totalSessions : <EmptyCell />}</Cell>
                <Cell>
                  {hasDiscount && originalPriceLabel !== null ? (
                    <span className="inline-flex flex-col items-center gap-0.5">
                      <span className="text-xs leading-tight text-sage-500 line-through">
                        {originalPriceLabel}
                      </span>
                      <span className="font-semibold text-sage-900">{finalPriceLabel}</span>
                    </span>
                  ) : (
                    finalPriceLabel
                  )}
                </Cell>
                <div className="flex shrink-0 items-center justify-center">
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-sage-600 transition-colors hover:bg-white/70 hover:text-sage-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45"
                    aria-label={tClients("packages.viewPlanDetailsAria", {
                      name: packageName,
                    })}
                    title={tClients("packages.viewPlanDetails")}
                    disabled={disabled}
                    onClick={(event) => {
                      event.stopPropagation();
                      setDetailsPlanId(plan.id);
                    }}
                  >
                    <EyeGlyph className={ADMIN_ACTION_ICON_CLASS} />
                  </button>
                </div>
                <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                  <SelectionGlyph selected={selected} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {detailsPlan !== null ? (
        <AdminClientPackagePlanDetailsModal
          locale={locale}
          plan={detailsPlan}
          onClose={() => setDetailsPlanId(null)}
        />
      ) : null}
    </div>
  );
}
