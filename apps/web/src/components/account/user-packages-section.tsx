"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { UserMembershipBoardCard } from "@/components/account/user-membership-board-card";
import { UserMembershipCompactRow } from "@/components/account/user-membership-compact-row";
import { UserMembershipDetailsModal } from "@/components/account/user-membership-details-modal";
import { normalizeUserPackageStatus } from "@/components/account/user-membership-display";
import { UserPackagesViewSwitcher } from "@/components/account/user-packages-view-switcher";
import { Link } from "@/i18n/navigation";
import type { UserMembershipRow } from "@/lib/user-package-types";
import {
  DEFAULT_USER_PACKAGES_VIEW_MODE,
  readUserPackagesViewModeFromStorage,
  writeUserPackagesViewModeToStorage,
  type UserPackagesViewMode,
} from "@/lib/user-packages-view-preference";

type UserPackagesSectionProps = {
  locale: string;
  memberships: readonly UserMembershipRow[];
  apiOk: boolean;
};

export function UserPackagesSection({
  locale,
  memberships,
  apiOk,
}: UserPackagesSectionProps) {
  const t = useTranslations("userPages.packages");
  const [viewMode, setViewMode] = useState<UserPackagesViewMode>(DEFAULT_USER_PACKAGES_VIEW_MODE);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setViewMode(readUserPackagesViewModeFromStorage());
  }, []);

  const setView = useCallback((mode: UserPackagesViewMode) => {
    setViewMode(mode);
    writeUserPackagesViewModeToStorage(mode);
  }, []);

  const selectedMembership = useMemo(() => {
    if (selectedId === null) {
      return null;
    }
    return memberships.find((membership) => membership.id === selectedId) ?? null;
  }, [memberships, selectedId]);

  const selectedStatus = selectedMembership
    ? normalizeUserPackageStatus(selectedMembership.status)
    : "ACTIVE";

  if (!apiOk) {
    return (
      <div className="rounded-[20px] border border-white/60 bg-white/75 p-5 sm:p-6">
        <p className="ommm-body-muted text-sm">{t("signInToView")}</p>
      </div>
    );
  }

  if (memberships.length === 0) {
    return (
      <div className="max-w-xl rounded-[20px] border border-white/60 bg-white/75 p-5 sm:p-6">
        <p className="font-medium text-sage-900">{t("noPackagesYet")}</p>
        <p className="ommm-body-muted mt-2 text-sm">{t("emptyPackagesHint")}</p>
        <Link href="/packages" className="ommm-cta-primary mt-5 inline-flex">
          {t("browsePackagesCta")}
        </Link>
      </div>
    );
  }

  return (
    <div id="your-packages" className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-sage-600">
          {t("packagesCount", { count: memberships.length })}
        </p>
        <UserPackagesViewSwitcher value={viewMode} onChange={setView} />
      </div>

      {viewMode === "board" ? (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {memberships.map((membership) => {
            const status = normalizeUserPackageStatus(membership.status);
            return (
              <li key={membership.id} className="min-w-0 list-none">
                <UserMembershipBoardCard
                  membership={membership}
                  locale={locale}
                  status={status}
                  onOpenDetails={() => setSelectedId(membership.id)}
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="overflow-hidden rounded-[20px] border border-white/60 bg-white/75">
          <div className="hidden border-b border-white/70 px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-sage-500 md:grid md:grid-cols-[minmax(0,1.6fr)_minmax(0,0.8fr)_minmax(0,0.7fr)_minmax(0,0.9fr)_minmax(0,1.1fr)_auto] md:gap-4">
            <span>{t("listHeaderPackage")}</span>
            <span>{t("listHeaderPrice")}</span>
            <span>{t("listHeaderSessions")}</span>
            <span>{t("listHeaderPeriod")}</span>
            <span>{t("listHeaderStatus")}</span>
            <span className="sr-only">{t("viewDetails")}</span>
          </div>
          <ul className="divide-y divide-white/70">
            {memberships.map((membership) => {
              const status = normalizeUserPackageStatus(membership.status);
              return (
                <li key={membership.id}>
                  <UserMembershipCompactRow
                    membership={membership}
                    locale={locale}
                    status={status}
                    onOpenDetails={() => setSelectedId(membership.id)}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <UserMembershipDetailsModal
        membership={selectedMembership}
        locale={locale}
        status={selectedStatus}
        isOpen={selectedId !== null}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
