"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { UserMembershipBoardCard } from "@/components/account/user-membership-board-card";
import { UserMembershipCompactRow } from "@/components/account/user-membership-compact-row";
import { UserMembershipDetailsSheet } from "@/components/account/user-membership-details-sheet";
import { normalizeUserPackageStatus } from "@/components/account/user-membership-display";
import {
  buildUserPackagesFilterFields,
  DEFAULT_USER_PACKAGE_FILTER_VALUES,
  hasActiveUserPackageFilters,
  matchesUserPackageFilters,
  userPackagesIntegratedFilterValues,
  type UserPackageFilterValues,
  type UserPackageStatusFilter,
} from "@/components/account/user-packages-filter-fields";
import { UserPackagesViewSwitcher } from "@/components/account/user-packages-view-switcher";
import {
  USER_PACKAGES_LIST_ACTIONS_HEADER_CELL,
  USER_PACKAGES_LIST_HEADER_CLASS,
  USER_PACKAGES_LIST_TABLE_CLASS,
} from "@/components/account/user-packages-list-layout";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useUserListBoardView } from "@/hooks/use-user-list-board-view";
import type { UserMembershipRow } from "@/lib/user-package-types";
import {
  parseUserPackagesPackageId,
  USER_PACKAGES_PACKAGE_ID_QUERY_KEY,
} from "@/lib/user-packages-query";

type UserPackagesSectionProps = {
  locale: string;
  description: string;
  memberships: readonly UserMembershipRow[];
  apiOk: boolean;
};

export function UserPackagesSection({
  locale,
  description,
  memberships,
  apiOk,
}: UserPackagesSectionProps) {
  const t = useTranslations("userPages.packages");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [viewMode, setView] = useUserListBoardView("packages");
  const [filters, setFilters] = useState<UserPackageFilterValues>(DEFAULT_USER_PACKAGE_FILTER_VALUES);

  const selectedId = useMemo(
    () => parseUserPackagesPackageId(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  const selectedMembership = useMemo(() => {
    if (selectedId === null) {
      return null;
    }
    return memberships.find((membership) => membership.id === selectedId) ?? null;
  }, [memberships, selectedId]);

  const openPackageDetails = useCallback(
    (packageId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(USER_PACKAGES_PACKAGE_ID_QUERY_KEY, packageId);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const closePackageDetails = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(USER_PACKAGES_PACKAGE_ID_QUERY_KEY);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const selectedStatus = selectedMembership
    ? normalizeUserPackageStatus(selectedMembership.status)
    : "ACTIVE";

  const filterFields = useMemo(
    () =>
      buildUserPackagesFilterFields({
        labels: {
          status: t("filters.status"),
          statusAll: t("filters.statusAll"),
          statusValues: {
            ACTIVE: t("membershipStatus.ACTIVE"),
            PAUSED: t("membershipStatus.PAUSED"),
            CANCELLED: t("membershipStatus.CANCELLED"),
            EXPIRED: t("membershipStatus.EXPIRED"),
            PENDING: t("membershipStatus.PENDING"),
          },
          searchPlaceholder: t("filters.searchPlaceholder"),
          resetFilters: t("filters.resetFilters"),
        },
      }),
    [t],
  );

  const integratedFilterValues = useMemo(
    () => userPackagesIntegratedFilterValues(filters),
    [filters],
  );

  const filteredMemberships = useMemo(
    () => memberships.filter((row) => matchesUserPackageFilters(row, filters)),
    [filters, memberships],
  );

  const filtersActive = hasActiveUserPackageFilters(filters);

  function handleIntegratedFilterChange(key: string, value: string): void {
    if (key === "status") {
      setFilters((current) => ({ ...current, status: value as UserPackageStatusFilter }));
    }
  }

  function resetFilters(): void {
    setFilters(DEFAULT_USER_PACKAGE_FILTER_VALUES);
  }

  const heroSearch = (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <ListPageSearchFilters
        search={filters.search}
        onSearchChange={(value) => setFilters((current) => ({ ...current, search: value }))}
        searchPlaceholder={t("filters.searchPlaceholder")}
        fields={filterFields}
        filterValues={integratedFilterValues}
        onFilterChange={handleIntegratedFilterChange}
        onClearAll={resetFilters}
        resetLabel={t("filters.resetFilters")}
      />
      <UserPackagesViewSwitcher value={viewMode} onChange={setView} />
    </div>
  );

  return (
    <div id="your-packages" className="space-y-4">
      <AdminPageHero title={t("title")} description={description} search={heroSearch} />

      {!apiOk ? (
        <div className="rounded-[20px] border border-white/60 bg-white/75 p-5 sm:p-6">
          <p className="ommm-body-muted text-sm">{t("signInToView")}</p>
        </div>
      ) : memberships.length === 0 ? (
        <div className="max-w-xl rounded-[20px] border border-white/60 bg-white/75 p-5 sm:p-6">
          <p className="font-medium text-sage-900">{t("noPackagesYet")}</p>
          <p className="ommm-body-muted mt-2 text-sm">{t("emptyPackagesHint")}</p>
          <Link href="/packages" className="ommm-cta-primary mt-5 inline-flex">
            {t("browsePackagesCta")}
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-sage-600">
            {t("packagesCount", {
              count: filtersActive ? filteredMemberships.length : memberships.length,
            })}
          </p>

          {filteredMemberships.length === 0 ? (
            <div className="rounded-2xl border border-sage-100 bg-white/80 p-5 text-sm">
              <p className="font-medium text-sage-900">{t("filteredEmptyTitle")}</p>
              <p className="mt-1 text-sage-600">{t("filteredEmptyDescription")}</p>
            </div>
          ) : viewMode === "board" ? (
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredMemberships.map((membership) => {
                const status = normalizeUserPackageStatus(membership.status);
                return (
                  <li key={membership.id} className="min-w-0 list-none">
                    <UserMembershipBoardCard
                      membership={membership}
                      locale={locale}
                      status={status}
                      onOpenDetails={() => openPackageDetails(membership.id)}
                    />
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className={USER_PACKAGES_LIST_TABLE_CLASS}>
              <div className={USER_PACKAGES_LIST_HEADER_CLASS}>
                <span>{t("listHeaderPackage")}</span>
                <span>{t("listHeaderPrice")}</span>
                <span>{t("listHeaderSessions")}</span>
                <span>{t("listHeaderPeriod")}</span>
                <span>{t("listHeaderStatus")}</span>
                <span aria-hidden="true" />
                <span className={USER_PACKAGES_LIST_ACTIONS_HEADER_CELL}>{t("listHeaderActions")}</span>
              </div>
              {filteredMemberships.map((membership) => {
                const status = normalizeUserPackageStatus(membership.status);
                return (
                  <UserMembershipCompactRow
                    key={membership.id}
                    membership={membership}
                    locale={locale}
                    status={status}
                    onOpenDetails={() => openPackageDetails(membership.id)}
                  />
                );
              })}
            </div>
          )}
        </>
      )}

      <UserMembershipDetailsSheet
        membership={selectedMembership}
        locale={locale}
        status={selectedStatus}
        isOpen={selectedMembership !== null}
        onClose={closePackageDetails}
      />
    </div>
  );
}
