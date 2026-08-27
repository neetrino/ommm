"use client";

import { useId, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import {
  formatPackageFreezeLabel,
  formatPackageGuestCount,
  formatPackagePlanName,
  formatPackagePriceLabel,
  formatPackageStartDateLabel,
  formatPackageStockCount,
  formatPackageValidityLabel,
} from "@/components/admin/admin-packages-display";
import {
  hasPublicPackageTypeSessions,
  resolvePublicPackageTypeSessionRows,
} from "@/components/marketing/packages/public-package-type-session-rows";
import { PublicPackageTypeSessionsBreakdown } from "@/components/marketing/packages/public-package-type-sessions-breakdown";
import { OmmButton } from "@/components/ui/omm-button";
import { AdminSheetPortal } from "@/components/admin/admin-sheet-portal";
import type { PublicPackagePlan } from "@/lib/public-package-plan";

type AdminClientPackagePlanDetailsModalProps = {
  locale: string;
  plan: PublicPackagePlan;
  onClose: () => void;
};

const DETAILS_GRID_CLASS =
  "grid w-full min-w-0 max-w-full grid-cols-[minmax(0,1.3fr)_minmax(0,0.65fr)_minmax(0,0.8fr)_minmax(0,0.65fr)_minmax(0,0.45fr)_minmax(0,0.7fr)_minmax(0,0.45fr)_minmax(0,0.8fr)] items-center gap-x-2";

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
          ? "min-w-0 py-2 text-left text-sm font-semibold leading-snug text-[#1b1c1a] sm:text-base"
          : "flex min-w-0 items-center justify-center py-2 text-center text-sm font-medium leading-snug text-[#1b1c1a] sm:text-base"
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

export function AdminClientPackagePlanDetailsModal({
  locale,
  plan,
  onClose,
}: AdminClientPackagePlanDetailsModalProps) {
  const t = useTranslations("adminPages.clients");
  const tPackages = useTranslations("adminPages.packages");
  const titleId = useId();
  const packageName = formatPackagePlanName(plan.name, plan.sessionsPerMonth);
  const hasDiscount =
    typeof plan.discountedPriceCents === "number" &&
    plan.discountedPriceCents > 0 &&
    plan.discountedPriceCents < plan.priceCents;
  const originalPriceLabel = hasDiscount
    ? formatPackagePriceLabel({ ...plan, discountedPriceCents: null }, locale)
    : null;
  const finalPriceLabel = formatPackagePriceLabel(plan, locale);
  const totalSessions = resolvePlanTotalSessions(plan);
  const validityLabel = formatPackageValidityLabel(plan, {
    days: (count) => tPackages("validityDays", { count }),
    months: (count) => tPackages("validityMonths", { count }),
  });
  const guestCount = formatPackageGuestCount(plan);
  const freezeLabel = formatPackageFreezeLabel(plan, {
    timesDays: (times, days) => tPackages("freezeTimesDays", { times, days }),
  });
  const stockCount = formatPackageStockCount(plan);
  const startDateLabel = formatPackageStartDateLabel(plan);
  const features = plan.features.filter((feature) => feature.trim().length > 0);
  const hasMixSessions = hasPublicPackageTypeSessions(plan.typeSessionAllocations);
  const mixSessionRows = resolvePublicPackageTypeSessionRows(plan.typeSessionAllocations);

  return (
    <AdminSheetPortal presentation="modal"
      isOpen
      onClose={onClose}
      backdropAriaLabel={t("modalBackdropClose")}
      ariaLabelledBy={titleId}
      useOverlayPortalRoot
      modalOverlayClassName="ommm-modal-overlay z-[120]"
      modalPanelClassName="w-full max-w-5xl rounded-[28px] border border-white/70 bg-white p-0 shadow-[0_30px_70px_-30px_rgba(45,40,35,0.45)]"
    >
      <div className="flex max-h-[min(88dvh,44rem)] flex-col">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-white/60 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className={ADMIN_DETAILS_SHEET_TITLE_CLASS}>
              {t("packages.planDetailsTitle")}
            </h2>
            <p className="mt-1 text-sm text-sage-600">{plan.categoryName}</p>
          </div>
          <button
            type="button"
            className={ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS}
            aria-label={t("modalCloseAria")}
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-5 py-5 sm:px-6">
          {plan.description !== null && plan.description.trim().length > 0 ? (
            <p className="text-sm leading-relaxed text-sage-600">{plan.description}</p>
          ) : null}

          <div className="w-full min-w-0 max-w-full overflow-x-hidden rounded-[24px] border border-[rgba(212,196,183,0.2)] bg-white/70 px-3 py-4 sm:px-5">
            <div
              className={`${DETAILS_GRID_CLASS} border-b border-[rgba(212,196,183,0.2)] pb-4 pt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(80,69,59,0.6)] sm:text-xs sm:tracking-[0.12em]`}
            >
              <div className="min-w-0 text-left leading-snug">{tPackages("tablePageName")}</div>
              <div className="min-w-0 text-center leading-snug">
                {tPackages("tableTotalSessions")}
              </div>
              <div className="min-w-0 text-center leading-snug">{tPackages("tablePrice")}</div>
              <div className="min-w-0 text-center leading-snug">{tPackages("tableValidity")}</div>
              <div className="min-w-0 text-center leading-snug">{tPackages("tableGuests")}</div>
              <div className="min-w-0 text-center leading-snug">{tPackages("tableFreeze")}</div>
              <div className="min-w-0 text-center leading-snug">{tPackages("tableStockCount")}</div>
              <div className="min-w-0 text-center leading-snug">{tPackages("tableStartDate")}</div>
            </div>

            <div className={`${DETAILS_GRID_CLASS} rounded-[20px] px-0.5 py-2`}>
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
                  <span className="break-words">{finalPriceLabel}</span>
                )}
              </Cell>
              <Cell>
                <span className="break-words">{validityLabel}</span>
              </Cell>
              <Cell>{guestCount !== null ? guestCount : <EmptyCell />}</Cell>
              <Cell>
                {freezeLabel !== null ? (
                  <span className="break-words">{freezeLabel}</span>
                ) : (
                  <EmptyCell />
                )}
              </Cell>
              <Cell>{stockCount !== null ? stockCount : <EmptyCell />}</Cell>
              <Cell>
                {startDateLabel !== null ? (
                  <span className="break-words">{startDateLabel}</span>
                ) : (
                  <EmptyCell />
                )}
              </Cell>
            </div>

            {hasMixSessions ? (
              <div className="mt-4 border-t border-[rgba(212,196,183,0.15)] pt-4">
                <PublicPackageTypeSessionsBreakdown rows={mixSessionRows} />
              </div>
            ) : null}
          </div>

          {features.length > 0 ? (
            <div className="space-y-2">
              <p className={ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS}>
                {t("packages.features")}
              </p>
              <ul className="space-y-2">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="rounded-xl border border-white/70 bg-white/60 px-3.5 py-3 text-sm text-sage-800"
                  >
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <footer className="flex shrink-0 justify-end border-t border-white/60 px-5 py-4 sm:px-6">
          <OmmButton type="button" variant="secondary" onClick={onClose}>
            {t("cancelButton")}
          </OmmButton>
        </footer>
      </div>
    </AdminSheetPortal>
  );
}
