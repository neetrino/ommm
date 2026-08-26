"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MembershipPeriodHighlight } from "@/components/account/membership-period-highlight";
import { PackageUsageBar } from "@/components/account/package-usage-bar";
import {
  formatMembershipStatusLabel,
  memberStatusClassName,
  normalizeUserPackageStatus,
} from "@/components/account/user-membership-display";
import type { ClientSheetPackageItem } from "@/components/admin/admin-clients-types";
import { AdminClientPackageTypeBalances } from "@/components/admin/admin-client-package-type-balances";
import { AdminClientPackageFreezeControls } from "@/components/admin/admin-client-package-freeze-controls";
import { AdminClientPackageValidityEditor } from "@/components/admin/admin-client-package-validity-editor";
import { formatPackagePlanName } from "@/components/admin/admin-packages-display";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { EditActionButton } from "@/components/ui/edit-action-button";
import { formatDateForUi } from "@/lib/date-display";
import { USER_PACKAGE_VALIDITY_DAY_MS } from "@/lib/user-package-validity";

const BOARD_CARD_CLASS = [
  "flex h-full flex-col rounded-[28px] border border-white/80 bg-white/95 p-5",
  "shadow-[0_22px_54px_-34px_rgba(45,40,35,0.34)]",
  "sm:p-6",
].join(" ");

type AdminClientPackageCardProps = {
  item: ClientSheetPackageItem;
  locale: string;
  paymentMethodLabel: string;
  allowEditValidity?: boolean;
  onValidityUpdated?: () => void;
};

function resolveValidityLabel(
  item: ClientSheetPackageItem,
  status: ReturnType<typeof normalizeUserPackageStatus>,
  t: (key: string, values?: Record<string, string | number | Date>) => string,
): string {
  if (item.awaitingFirstVisit === true) {
    return t("validityActivatesOnFirstVisit", {
      date: formatDateForUi(item.activationDeadline ?? item.activationDate),
    });
  }
  if (status === "EXPIRED") {
    return t("validityExpired");
  }
  const endMs = Date.parse(item.expirationDate);
  if (Number.isNaN(endMs)) {
    return "—";
  }
  const remainingMs = endMs - Date.now();
  if (remainingMs <= 0) {
    return t("validityExpired");
  }
  const days = Math.ceil(remainingMs / USER_PACKAGE_VALIDITY_DAY_MS);
  return t("validityDaysRemaining", { count: days });
}

export function AdminClientPackageCard({
  item,
  locale,
  paymentMethodLabel,
  allowEditValidity = false,
  onValidityUpdated,
}: AdminClientPackageCardProps) {
  const t = useTranslations("userPages.packages");
  const tMarketing = useTranslations("marketing");
  const tAdmin = useTranslations("adminPages.clients");
  const status = normalizeUserPackageStatus(item.status);
  const sessionName = formatPackagePlanName(item.packageName, item.totalSessions);
  const statusLabel = formatMembershipStatusLabel(status, t);
  const validityLabel = resolveValidityLabel(item, status, t);
  const [editing, setEditing] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const remainingSessions = item.remainingSessions;
  const sessionsSummary = item.isUnlimited
    ? tMarketing("packagesSessionsUnlimited")
    : t("sessionsUsedOfTotal", {
        used: item.usedSessions ?? 0,
        total: item.totalSessions ?? 0,
      });
  const remainingSummary =
    !item.isUnlimited && remainingSessions !== null
      ? t("sessionsRemaining", { count: remainingSessions })
      : null;

  const showUsageBar =
    !item.isUnlimited &&
    item.totalSessions !== null &&
    item.totalSessions > 0 &&
    item.usedSessions !== null;
  const typeBalances = item.typeBalances ?? [];

  return (
    <article className={BOARD_CARD_CLASS}>
      {successToast !== null ? (
        <AdminCenterToast
          message={successToast}
          tone="ok"
          onDismiss={() => setSuccessToast(null)}
        />
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-sand-600">
            {item.categoryName}
          </p>
          <h3 className="font-serif text-xl font-normal text-sage-900 sm:text-2xl">
            {sessionName}
          </h3>
        </div>
        <span className={memberStatusClassName(status)}>{statusLabel}</span>
      </div>

      <div className="mt-5 space-y-3 rounded-2xl border border-white/70 bg-white/60 p-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-sage-900">{sessionsSummary}</p>
          {remainingSummary !== null ? (
            <p className="text-sm text-sage-600">{remainingSummary}</p>
          ) : null}
        </div>
        {showUsageBar ? (
          <PackageUsageBar
            used={item.usedSessions ?? 0}
            total={item.totalSessions ?? 0}
            ariaLabel={sessionsSummary}
          />
        ) : null}
        <AdminClientPackageTypeBalances balances={typeBalances} />
      </div>

      <div className="mt-5 flex items-end justify-between gap-4 border-b border-white/70 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
            {tAdmin("packages.paymentMethod")}
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-sage-950">
            {paymentMethodLabel}
          </p>
        </div>
        <p className="text-sm text-sage-600">{validityLabel}</p>
      </div>

      <div className="mt-5 space-y-3">
        <AdminClientPackageFreezeControls
          item={item}
          onSuccess={(message) => {
            setSuccessToast(message);
            onValidityUpdated?.();
          }}
        />
        {!editing ? (
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              {item.awaitingFirstVisit === true ? null : (
                <MembershipPeriodHighlight
                  locale={locale}
                  periodStart={item.activationDate}
                  periodEnd={item.expirationDate}
                  variant="board"
                />
              )}
            </div>
            {allowEditValidity ? (
              <EditActionButton
                className="mt-1 shrink-0"
                ariaLabel={tAdmin("packages.editValidity")}
                title={tAdmin("packages.editValidity")}
                onClick={() => setEditing(true)}
              />
            ) : null}
          </div>
        ) : (
          <AdminClientPackageValidityEditor
            item={item}
            onCancel={() => setEditing(false)}
            onSuccess={() => {
              setEditing(false);
              setSuccessToast(tAdmin("packages.validityUpdated"));
              onValidityUpdated?.();
            }}
          />
        )}
      </div>
    </article>
  );
}
