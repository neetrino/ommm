"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import {
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
import { useAdminAnimatedSheetClose } from "@/components/admin/use-admin-animated-sheet-close";
import {
  DETAILS_DIVIDER_CLASS,
  DetailsCard,
  DetailsField,
  DetailsFieldRow,
  DetailsStack,
  DetailsStat,
  DetailsStatStrip,
} from "@/components/shared/details/details-card";
import {
  CalendarGlyph,
  CheckCircleGlyph,
  ClockGlyph,
  PauseGlyph,
  SparkGlyph,
  TicketGlyph,
  UsersGlyph,
  WalletGlyph,
} from "@/components/shared/details/details-glyphs";
import { GUEST_PASSES_ENABLED } from "@/lib/guest-passes";
import type { PublicPackagePlan } from "@/lib/public-package-plan";

type AdminClientPackagePlanDetailsModalProps = {
  locale: string;
  plan: PublicPackagePlan;
  onClose: () => void;
};

const EMPTY_VALUE = "—";

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

function usePlanDetailsView(plan: PublicPackagePlan, locale: string) {
  const tPackages = useTranslations("adminPages.packages");
  const hasDiscount =
    typeof plan.discountedPriceCents === "number" &&
    plan.discountedPriceCents > 0 &&
    plan.discountedPriceCents < plan.priceCents;
  const totalSessions = resolvePlanTotalSessions(plan);
  return {
    packageName: formatPackagePlanName(plan.name, plan.sessionsPerMonth),
    originalPrice: hasDiscount
      ? formatPackagePriceLabel({ ...plan, discountedPriceCents: null }, locale)
      : null,
    finalPrice: formatPackagePriceLabel(plan, locale),
    totalSessions: totalSessions !== null ? String(totalSessions) : EMPTY_VALUE,
    validity: formatPackageValidityLabel(plan, {
      days: (count) => tPackages("validityDays", { count }),
      months: (count) => tPackages("validityMonths", { count }),
    }),
    guests: formatPackageGuestCount(plan),
    freeze: formatPackageFreezeLabel(plan, {
      timesDays: (times, days) => tPackages("freezeTimesDays", { times, days }),
    }),
    stock: formatPackageStockCount(plan),
    startDate: formatPackageStartDateLabel(plan),
    features: plan.features.filter((feature) => feature.trim().length > 0),
  };
}

type PlanDetailsView = ReturnType<typeof usePlanDetailsView>;

export function AdminClientPackagePlanDetailsModal({
  locale,
  plan,
  onClose,
}: AdminClientPackagePlanDetailsModalProps) {
  const t = useTranslations("adminPages.clients");
  const titleId = useId();
  const { isOpen: sheetOpen, requestClose, onAfterClose } = useAdminAnimatedSheetClose(onClose);
  const view = usePlanDetailsView(plan, locale);

  return (
    <AdminSheetPortal
      presentation="modal"
      isOpen={sheetOpen}
      onClose={requestClose}
      onAfterClose={onAfterClose}
      backdropAriaLabel={t("modalBackdropClose")}
      ariaLabelledBy={titleId}
      useOverlayPortalRoot
      modalOverlayClassName="ommm-modal-overlay z-[120]"
      modalPanelClassName="w-full max-w-2xl rounded-[28px] border border-white/70 bg-paper p-0 shadow-[0_30px_70px_-30px_rgba(45,40,35,0.45)]"
    >
      <div className="flex max-h-[min(88dvh,44rem)] flex-col">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-sage-500/10 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className={ADMIN_DETAILS_SHEET_TITLE_CLASS}>
              {t("packages.planDetailsTitle")}
            </h2>
            <p className="mt-1 text-sm text-sage-500">{plan.categoryName}</p>
          </div>
          <button
            type="button"
            className={ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS}
            aria-label={t("modalCloseAria")}
            onClick={requestClose}
          >
            ×
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-5 sm:px-6">
          <DetailsStack>
            <PlanSummaryCard plan={plan} view={view} />
            <PlanFeaturesCard features={view.features} title={t("packages.features")} />
          </DetailsStack>
        </div>

        <footer className="flex shrink-0 justify-end border-t border-sage-500/10 px-5 py-4 sm:px-6">
          <OmmButton type="button" variant="secondary" onClick={requestClose}>
            {t("cancelButton")}
          </OmmButton>
        </footer>
      </div>
    </AdminSheetPortal>
  );
}

function PlanSummaryCard({ plan, view }: { plan: PublicPackagePlan; view: PlanDetailsView }) {
  const tPackages = useTranslations("adminPages.packages");
  const mixSessionRows = resolvePublicPackageTypeSessionRows(plan.typeSessionAllocations);

  return (
    <DetailsCard title={view.packageName} icon={<TicketGlyph />}>
      <DetailsStatStrip>
        <DetailsStat label={tPackages("tablePrice")} icon={<WalletGlyph />} tone="mint">
          <span className="block font-serif text-lg">{view.finalPrice}</span>
          {view.originalPrice !== null ? (
            <span className="block text-xs font-medium text-sage-500 line-through">
              {view.originalPrice}
            </span>
          ) : null}
        </DetailsStat>
        <DetailsStat label={tPackages("tableTotalSessions")} icon={<CheckCircleGlyph />} tone="peach">
          {view.totalSessions}
        </DetailsStat>
        <DetailsStat label={tPackages("tableValidity")} icon={<CalendarGlyph />} tone="blue">
          {view.validity}
        </DetailsStat>
      </DetailsStatStrip>
      <DetailsFieldRow>
        {GUEST_PASSES_ENABLED ? (
          <DetailsField label={tPackages("tableGuests")} icon={<UsersGlyph />}>
            {view.guests ?? EMPTY_VALUE}
          </DetailsField>
        ) : null}
        <DetailsField label={tPackages("tableFreeze")} icon={<PauseGlyph />} title={view.freeze ?? undefined}>
          {view.freeze ?? EMPTY_VALUE}
        </DetailsField>
        <DetailsField label={tPackages("tableStockCount")} icon={<TicketGlyph />}>
          {view.stock ?? EMPTY_VALUE}
        </DetailsField>
        <DetailsField label={tPackages("tableStartDate")} icon={<ClockGlyph />}>
          {view.startDate ?? EMPTY_VALUE}
        </DetailsField>
      </DetailsFieldRow>
      {hasPublicPackageTypeSessions(plan.typeSessionAllocations) ? (
        <div className={`${DETAILS_DIVIDER_CLASS} pt-4`}>
          <PublicPackageTypeSessionsBreakdown rows={mixSessionRows} />
        </div>
      ) : null}
    </DetailsCard>
  );
}

function PlanFeaturesCard({ features, title }: { features: readonly string[]; title: string }) {
  if (features.length === 0) {
    return null;
  }
  return (
    <DetailsCard title={title} icon={<SparkGlyph />} iconTone="sand">
      <ul className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2.5 rounded-2xl border border-sage-500/15 bg-white px-3.5 py-3 text-sm font-medium text-sage-900"
          >
            <span className="shrink-0 text-sage-700">
              <CheckCircleGlyph />
            </span>
            <span className="min-w-0 break-words">{feature}</span>
          </li>
        ))}
      </ul>
    </DetailsCard>
  );
}
