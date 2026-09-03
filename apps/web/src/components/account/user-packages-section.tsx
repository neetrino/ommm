"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { UserMembershipBoardCard } from "@/components/account/user-membership-board-card";
import { UserMembershipCompactRow } from "@/components/account/user-membership-compact-row";
import { UserMembershipDetailsSheet } from "@/components/account/user-membership-details-sheet";
import { normalizeUserPackageStatus } from "@/components/account/user-membership-display";
import { useRealtimeRefetch } from "@/hooks/use-realtime-refetch";
import { REALTIME_REFETCH_KEYS } from "@/lib/realtime/realtime-refetch-keys";
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
import { UserSheetPageFiltersBar } from "@/components/account/user-sheet-page-filters-bar";
import { UserViewContentEnter } from "@/components/account/user-view-content-enter";
import {
  USER_PACKAGES_LIST_ACTIONS_HEADER_CELL,
  USER_PACKAGES_LIST_CENTER_HEADER_CELL,
  USER_PACKAGES_LIST_HEADER_CLASS,
  USER_PACKAGES_LIST_TABLE_CLASS,
} from "@/components/account/user-packages-list-layout";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { PACKAGES_REFRESH_EVENT } from "@/lib/packages-refresh-event";
import { useUserListBoardView } from "@/hooks/use-user-list-board-view";
import type { UserMembershipRow } from "@/lib/user-package-types";
import {
  parseUserPackagesPackageId,
  USER_PACKAGES_PACKAGE_ID_QUERY_KEY,
} from "@/lib/user-packages-query";
import {
  parseUserPackageSortOrder,
  sortUserPackages,
} from "@/lib/list-sort";
import {
  readUserListOrderFromSearch,
  syncUserListOrderQuery,
} from "@/lib/user-list-order-url";

type UserPackagesSectionProps = {
  locale: string;
  memberships: readonly UserMembershipRow[];
  apiOk: boolean;
  embeddedInSheet?: boolean;
};

export function UserPackagesSection({
  locale,
  memberships,
  apiOk,
  embeddedInSheet = false,
}: UserPackagesSectionProps) {
  const t = useTranslations("userPages.packages");
  const tSort = useTranslations("listSort");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [viewMode, setView] = useUserListBoardView("packages");
  const [embeddedDetailsId, setEmbeddedDetailsId] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserPackageFilterValues>(() => ({
    ...DEFAULT_USER_PACKAGE_FILTER_VALUES,
    order: readUserListOrderFromSearch(
      Object.fromEntries(searchParams.entries()),
      "package",
      "upcoming",
    ),
  }));

  const replaceSearchParams = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutator(params);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useRealtimeRefetch(REALTIME_REFETCH_KEYS.PACKAGES_ME, () => {
    router.refresh();
  });

  useEffect(() => {
    const handlePackagesRefresh = (): void => {
      router.refresh();
    };
    window.addEventListener(PACKAGES_REFRESH_EVENT, handlePackagesRefresh);
    return () => {
      window.removeEventListener(PACKAGES_REFRESH_EVENT, handlePackagesRefresh);
    };
  }, [router]);

  const selectedId = useMemo(() => {
    if (embeddedInSheet) {
      return embeddedDetailsId;
    }
    return parseUserPackagesPackageId(Object.fromEntries(searchParams.entries()));
  }, [embeddedDetailsId, embeddedInSheet, searchParams]);

  const selectedMembership = useMemo(() => {
    if (selectedId === null) {
      return null;
    }
    return memberships.find((membership) => membership.id === selectedId) ?? null;
  }, [memberships, selectedId]);

  const openPackageDetails = useCallback(
    (packageId: string) => {
      if (embeddedInSheet) {
        setEmbeddedDetailsId(packageId);
        return;
      }
      const params = new URLSearchParams(searchParams.toString());
      params.set(USER_PACKAGES_PACKAGE_ID_QUERY_KEY, packageId);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [embeddedInSheet, pathname, router, searchParams],
  );

  const closePackageDetails = useCallback(() => {
    if (embeddedInSheet) {
      setEmbeddedDetailsId(null);
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.delete(USER_PACKAGES_PACKAGE_ID_QUERY_KEY);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [embeddedInSheet, pathname, router, searchParams]);

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
          sort: tSort("sort"),
          sortUpcoming: tSort("upcoming"),
          sortNewest: tSort("newest"),
          sortOldest: tSort("oldest"),
        },
      }),
    [t, tSort],
  );

  const integratedFilterValues = useMemo(
    () => userPackagesIntegratedFilterValues(filters),
    [filters],
  );

  const filteredMemberships = useMemo(
    () =>
      sortUserPackages(
        memberships.filter((row) => matchesUserPackageFilters(row, filters)),
        filters.order,
      ),
    [filters, memberships],
  );

  const filtersActive = hasActiveUserPackageFilters(filters);

  function handleIntegratedFilterChange(key: string, value: string): void {
    if (key === "status") {
      setFilters((current) => ({ ...current, status: value as UserPackageStatusFilter }));
      return;
    }
    if (key === "order") {
      setFilters((current) => ({
        ...current,
        order: parseUserPackageSortOrder(value),
      }));
      replaceSearchParams((params) => {
        syncUserListOrderQuery(params, value, "upcoming");
      });
    }
  }

  function resetFilters(): void {
    setFilters(DEFAULT_USER_PACKAGE_FILTER_VALUES);
    replaceSearchParams((params) => {
      params.delete("order");
    });
  }

  const heroSearch = (
    <UserSheetPageFiltersBar
      embeddedInSheet={embeddedInSheet}
      search={
        <ListPageSearchFilters
          className="w-full min-w-0"
          search={filters.search}
          onSearchChange={(value) => setFilters((current) => ({ ...current, search: value }))}
          searchPlaceholder={t("filters.searchPlaceholder")}
          fields={filterFields}
          filterValues={integratedFilterValues}
          onFilterChange={handleIntegratedFilterChange}
          onClearAll={resetFilters}
          resetLabel={t("filters.resetFilters")}
        />
      }
      trailing={<UserPackagesViewSwitcher value={viewMode} onChange={setView} />}
    />
  );

  const listBody = !apiOk ? (
    <div className="rounded-[20px] border border-white/60 bg-white/75 p-5 sm:p-6">
      <p className="ommm-body-muted text-sm">{t("signInToView")}</p>
    </div>
  ) : memberships.length === 0 ? (
    <div className="max-w-xl rounded-[20px] border border-white/60 bg-white/75 p-5 sm:p-6">
      <p className="font-medium text-sage-900">{t("noPackagesYet")}</p>
      <p className="ommm-body-muted mt-2 text-sm">{t("emptyPackagesHint")}</p>
      <Link href="/package" className="ommm-cta-primary mt-5 inline-flex">
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
      ) : (
        <UserViewContentEnter viewKey={viewMode}>
          {viewMode === "board" ? (
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
                <span className={USER_PACKAGES_LIST_CENTER_HEADER_CELL}>{t("listHeaderPeriod")}</span>
                <span className={USER_PACKAGES_LIST_CENTER_HEADER_CELL}>{t("listHeaderPrice")}</span>
                <span className={USER_PACKAGES_LIST_CENTER_HEADER_CELL}>{t("listHeaderSessions")}</span>
                <span className={USER_PACKAGES_LIST_CENTER_HEADER_CELL}>{t("listHeaderValidity")}</span>
                <span className={USER_PACKAGES_LIST_CENTER_HEADER_CELL}>{t("listHeaderStatus")}</span>
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
        </UserViewContentEnter>
      )}
    </>
  );

  if (embeddedInSheet) {
    return (
      <>
        <div className="space-y-4">
          {heroSearch}
          {listBody}
        </div>
        <UserMembershipDetailsSheet
          membership={selectedMembership}
          locale={locale}
          status={selectedStatus}
          isOpen={selectedMembership !== null}
          onClose={closePackageDetails}
        />
      </>
    );
  }

  return (
    <div id="your-packages" className="space-y-4">
      <AdminPageHero title={t("title")} search={heroSearch} />
      {listBody}
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
