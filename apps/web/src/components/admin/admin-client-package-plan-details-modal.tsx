"use client";

import { useId, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import {
  formatPackageGuestCount,
  formatPackagePlanName,
  formatPackagePriceLabel,
  formatPackageStartDateLabel,
  formatPackageValidityLabel,
} from "@/components/admin/admin-packages-display";
import {
  hasPublicPackageTypeSessions,
  resolvePublicPackageTypeSessionRows,
} from "@/components/marketing/packages/public-package-type-session-rows";
import { PublicPackageTypeSessionsBreakdown } from "@/components/marketing/packages/public-package-type-sessions-breakdown";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmModalPortal } from "@/components/ui/omm-modal";
import type { PublicPackagePlan } from "@/lib/public-package-plan";

type AdminClientPackagePlanDetailsModalProps = {
  locale: string;
  plan: PublicPackagePlan;
  onClose: () => void;
};

function EmptyCell() {
  return <span className="text-[rgba(80,69,59,0.4)]">—</span>;
}

function TableCell({
  children,
  emphasis = false,
  lead = false,
}: {
  children: ReactNode;
  emphasis?: boolean;
  lead?: boolean;
}) {
  const classes = [
    "ommm-admin-packages-table-cell",
    emphasis ? "ommm-admin-packages-table-cell--emphasis" : "",
    lead ? "ommm-admin-packages-table-cell--lead" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
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
  const startDateLabel = formatPackageStartDateLabel(plan);
  const features = plan.features.filter((feature) => feature.trim().length > 0);
  const hasMixSessions = hasPublicPackageTypeSessions(plan.typeSessionAllocations);
  const mixSessionRows = resolvePublicPackageTypeSessionRows(plan.typeSessionAllocations);

  return (
    <OmmModalPortal
      isOpen
      onClose={onClose}
      backdropAriaLabel={t("modalBackdropClose")}
      ariaLabelledBy={titleId}
      useOverlayPortalRoot
      overlayClassName="ommm-modal-overlay z-[120]"
      panelClassName="w-full max-w-5xl rounded-[28px] border border-white/70 bg-white p-0 shadow-[0_30px_70px_-30px_rgba(45,40,35,0.45)]"
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

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          {plan.description !== null && plan.description.trim().length > 0 ? (
            <p className="text-sm leading-relaxed text-sage-600">{plan.description}</p>
          ) : null}

          <div className="ommm-admin-packages-table overflow-hidden rounded-[24px] border border-[rgba(212,196,183,0.2)] bg-white/70 px-3 py-4 sm:px-5">
            <div className="ommm-admin-packages-table-scroll">
              <div className="ommm-admin-packages-table-grid ommm-admin-packages-table-header ommm-admin-packages-table-grid--plan-details">
                <div>{tPackages("tablePageName")}</div>
                <div>{tPackages("tableTotalSessions")}</div>
                <div>{tPackages("tablePrice")}</div>
                <div>{tPackages("tableValidity")}</div>
                <div>{tPackages("tableGuests")}</div>
                <div>{tPackages("tableStockCount")}</div>
                <div>{tPackages("tableStartDate")}</div>
              </div>
              <div className="ommm-admin-packages-table-row">
                <div className="ommm-admin-packages-table-row-layout ommm-admin-packages-table-grid--plan-details">
                  <TableCell emphasis lead>
                    <span>{packageName}</span>
                  </TableCell>
                  <TableCell>
                    {totalSessions !== null ? totalSessions : <EmptyCell />}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>{validityLabel}</TableCell>
                  <TableCell>{guestCount !== null ? guestCount : <EmptyCell />}</TableCell>
                  <TableCell>
                    <EmptyCell />
                  </TableCell>
                  <TableCell>
                    {startDateLabel !== null ? startDateLabel : <EmptyCell />}
                  </TableCell>
                </div>
              </div>
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
    </OmmModalPortal>
  );
}
