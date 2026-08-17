"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ADD_CLASS_MODAL_QUERY_VALUE,
  ADMIN_SCHEDULE_TOAST_DISMISS_MS,
  LEGACY_CLASS_TYPES_MODAL_QUERY_VALUE,
  LEGACY_EDIT_CLASS_TYPE_QUERY_KEY,
  SCHEDULE_MODAL_QUERY_KEY,
} from "@/components/admin/admin-schedule-management.constants";
import {
  buildSchedulePackageFilterOptions,
  resolveScheduleSelectedClassTypeIds,
} from "@/components/admin/admin-schedule-package-filter-options";
import { parseAdminScheduleListPageParams } from "@/components/admin/admin-schedule-query";
import {
  matchesScheduleQuickFilters,
  type ScheduleQuickFilter,
} from "@/components/admin/admin-schedule-quick-filters";
import { replaceScheduleModalInUrl } from "@/components/admin/admin-schedule-session-form.helpers";
import {
  buildSessionClassTypeOptions,
  coachName,
  matchesAvailability,
  matchesTimeOfDaySelection,
  spotsLeft,
  splitSessionLevels,
} from "@/components/admin/admin-schedule-session.helpers";
import type {
  AdminScheduleFilters,
  AdminScheduleManagementProps,
  AdminScheduleSession,
  ScheduleToast,
} from "@/components/admin/admin-schedule-session.types";
import { useAdminScheduleManagementActions } from "@/components/admin/use-admin-schedule-management-actions";
import { useAdminScheduleManagementFiltersState } from "@/components/admin/use-admin-schedule-management-filters-state";
import { useAdminScheduleListFilterFields } from "@/components/admin/use-admin-schedule-management-filter-fields";
import {
  isScheduleListLikeView,
  resolveScheduleView,
  type ScheduleView,
} from "@/components/admin/admin-schedule-view";
import { resolveScheduleListDateRange } from "@/components/admin/admin-schedule-url";
import {
  addCalendarMonths,
  monthBoundsIso,
  yearMonthFromIsoDay,
} from "@/components/admin/admin-schedule-month-utils";
import { useScheduleViewUrl } from "@/hooks/use-schedule-view-url";
import { useRealtimeRefetch } from "@/hooks/use-realtime-refetch";
import { toggleSessionDateSortOrder } from "@/lib/list-sort";
import { scheduleSessionLocalIsoDay, scheduleTodayIsoDate } from "@/lib/local-iso-date";
import { REALTIME_REFETCH_KEYS } from "@/lib/realtime/realtime-refetch-keys";

export function useAdminScheduleManagement({
  sessions,
  dateStripSessions,
  dateStripTotalCount: dateStripTotalCountProp,
  listPagination,
  classTypes: initialClassTypes,
  packages,
  coaches,
  initialView,
  initialFilterState,
  variant = "full",
}: AdminScheduleManagementProps) {
  const isStaff = variant === "staff";
  const t = useTranslations("adminPages.classes");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startScheduleRefresh] = useTransition();
  const refreshScheduleFromServer = useCallback(() => {
    startScheduleRefresh(() => {
      router.refresh();
    });
  }, [router]);
  useRealtimeRefetch(REALTIME_REFETCH_KEYS.SCHEDULE_ADMIN, refreshScheduleFromServer);
  useRealtimeRefetch(REALTIME_REFETCH_KEYS.BOOKINGS_ADMIN, refreshScheduleFromServer);
  const [rows, setRows] = useState(sessions);
  const [prevSessions, setPrevSessions] = useState(sessions);
  const [classTypes, setClassTypes] = useState(initialClassTypes);
  const [prevInitialClassTypes, setPrevInitialClassTypes] = useState(initialClassTypes);
  const [view, setView] = useScheduleViewUrl(resolveScheduleView(initialView));
  const [filters, setFilters] = useState<AdminScheduleFilters>(() => initialFilterState.filters);
  const [quickFilters, setQuickFilters] = useState<ScheduleQuickFilter[]>(
    () => initialFilterState.quickFilters,
  );
  const [stripDay, setStripDay] = useState<string | null>(() => initialFilterState.stripDay);
  const [searchDraft, setSearchDraft] = useState(() => initialFilterState.filters.q);
  const [prevInitialFilterState, setPrevInitialFilterState] = useState(initialFilterState);
  const [editing, setEditing] = useState<AdminScheduleSession | null>(null);
  const [details, setDetails] = useState<AdminScheduleSession | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<ScheduleToast | null>(null);
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(() => new Set());

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleSelect = useCallback((rowId: string, selected: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (selected) {
        next.add(rowId);
      } else {
        next.delete(rowId);
      }
      return next;
    });
  }, []);

  const scheduleModalParam = searchParams.get(SCHEDULE_MODAL_QUERY_KEY);
  const addClassOpen = scheduleModalParam === ADD_CLASS_MODAL_QUERY_VALUE;

  const openAddClassModal = useCallback(() => {
    replaceScheduleModalInUrl(pathname, searchParams, router, ADD_CLASS_MODAL_QUERY_VALUE);
  }, [pathname, router, searchParams]);

  const closeAddClassModal = useCallback(() => {
    if (searchParams.get(SCHEDULE_MODAL_QUERY_KEY) === ADD_CLASS_MODAL_QUERY_VALUE) {
      replaceScheduleModalInUrl(pathname, searchParams, router, null);
    }
  }, [pathname, router, searchParams]);

  const sessionModalConfig = useMemo(() => {
    if (addClassOpen) {
      return { mode: "create" as const, row: undefined };
    }
    if (editing === null || editing.id !== "") {
      return null;
    }
    return { mode: "duplicate" as const, row: editing };
  }, [addClassOpen, editing]);

  if (prevInitialClassTypes !== initialClassTypes) {
    setPrevInitialClassTypes(initialClassTypes);
    setClassTypes(initialClassTypes);
  }

  if (sessions !== prevSessions) {
    setPrevSessions(sessions);
    // Paginated list: server page is source of truth (do not merge prior pages).
    if (listPagination !== null) {
      setRows(sessions);
    } else {
      setRows((current) => {
        const byId = new Map(sessions.map((row) => [row.id, row]));
        for (const row of current) {
          if (!byId.has(row.id)) {
            byId.set(row.id, row);
          }
        }
        return Array.from(byId.values()).sort((first, second) =>
          first.startsAt.localeCompare(second.startsAt),
        );
      });
    }
  }

  if (initialFilterState !== prevInitialFilterState) {
    setPrevInitialFilterState(initialFilterState);
    setFilters(initialFilterState.filters);
    setQuickFilters(initialFilterState.quickFilters);
    setStripDay(initialFilterState.stripDay);
    setSearchDraft(initialFilterState.filters.q);
  }

  useEffect(() => {
    const modal = searchParams.get(SCHEDULE_MODAL_QUERY_KEY);
    if (
      modal === LEGACY_CLASS_TYPES_MODAL_QUERY_VALUE ||
      searchParams.has(LEGACY_EDIT_CLASS_TYPE_QUERY_KEY)
    ) {
      replaceScheduleModalInUrl(pathname, searchParams, router, null);
    }
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (toast === null) {
      return undefined;
    }
    const handle = window.setTimeout(() => setToast(null), ADMIN_SCHEDULE_TOAST_DISMISS_MS);
    return () => window.clearTimeout(handle);
  }, [toast]);

  const listPage = useMemo(
    () => parseAdminScheduleListPageParams(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  const { patchFilterState, resetFilters, setListPage } = useAdminScheduleManagementFiltersState({
    initialFilterState,
    listPagination,
    pathname,
    router,
    searchParams,
    searchDraft,
    setSearchDraft,
    filters,
    setFilters,
    quickFilters,
    setQuickFilters,
    stripDay,
    setStripDay,
  });

  const didSyncStripDayUrl = useRef(false);
  useEffect(() => {
    if (didSyncStripDayUrl.current) return;
    if (searchParams.has("schedDay") || searchParams.has("schedStrip")) {
      didSyncStripDayUrl.current = true;
      return;
    }
    didSyncStripDayUrl.current = true;
    patchFilterState({ stripDay }, false);
  }, [patchFilterState, searchParams, stripDay]);

  const didSyncMonthlyUrl = useRef(false);
  useEffect(() => {
    if (view !== "monthly" || didSyncMonthlyUrl.current) return;
    didSyncMonthlyUrl.current = true;
    const dayParam = searchParams.get("schedDay");
    if (dayParam === null || dayParam === "all") return;
    patchFilterState(
      {
        stripDay: null,
        filters: {
          from: filters.from,
          to: filters.to,
        },
      },
      false,
    );
  }, [filters.from, filters.to, patchFilterState, searchParams, view]);

  const levels = useMemo(() => {
    return Array.from(
      new Set(rows.flatMap((row) => splitSessionLevels(row.level))),
    ).sort();
  }, [rows]);

  const packageOptions = useMemo(
    () => buildSchedulePackageFilterOptions(packages, classTypes),
    [classTypes, packages],
  );

  const validSelectedPackageIds = useMemo(() => {
    const validPackageIds = new Set(packageOptions.map((option) => option.id));
    return filters.typeIds.filter((id) => validPackageIds.has(id));
  }, [filters.typeIds, packageOptions]);

  const selectedClassTypeIds = useMemo(
    () => resolveScheduleSelectedClassTypeIds(validSelectedPackageIds, packageOptions),
    [packageOptions, validSelectedPackageIds],
  );

  const sessionClassTypeOptions = useMemo(
    () => buildSessionClassTypeOptions(classTypes),
    [classTypes],
  );

  const isListView = isStaff || isScheduleListLikeView(view);

  const filteredRows = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    const { from, to } = resolveScheduleListDateRange(filters, stripDay);
    return rows.filter((row) => {
      if (q && !`${row.title} ${row.classType.name} ${coachName(row.coach)}`.toLowerCase().includes(q)) return false;
      if (from && scheduleSessionLocalIsoDay(row.startsAt) < from) return false;
      if (to && scheduleSessionLocalIsoDay(row.startsAt) > to) return false;
      if (filters.coachIds.length > 0 && !filters.coachIds.includes(row.coach.id)) return false;
      if (validSelectedPackageIds.length > 0 && !selectedClassTypeIds.includes(row.classType.id)) return false;
      if (
        filters.levels.length > 0 &&
        !splitSessionLevels(row.level).some((level) => filters.levels.includes(level))
      ) return false;
      if (filters.statuses.length > 0 && !filters.statuses.includes(row.status)) return false;
      if (!matchesAvailability(row, filters.availability)) return false;
      if (!matchesTimeOfDaySelection(row, filters.timeOfDay)) return false;
      return matchesScheduleQuickFilters(row, quickFilters);
    });
  }, [filters, quickFilters, rows, selectedClassTypeIds, stripDay, validSelectedPackageIds]);

  const displayRows = isListView ? rows : filteredRows;

  const toggleSelectAll = useCallback(
    (checked: boolean) => {
      if (!checked) {
        setSelectedIds(new Set());
        return;
      }
      setSelectedIds(new Set(displayRows.map((row) => row.id)));
    },
    [displayRows],
  );

  const dateStripRows = useMemo(
    () => dateStripSessions ?? displayRows,
    [dateStripSessions, displayRows],
  );

  const dateStripTotalCount =
    dateStripTotalCountProp ??
    (isListView && listPagination !== null ? listPagination.total : dateStripRows.length);

  const selectedStripDay = stripDay;

  const handleSelectStripDay = useCallback(
    (day: string) => {
      if (stripDay === day) return;
      clearSelection();
      patchFilterState({ stripDay: day });
    },
    [clearSelection, patchFilterState, stripDay],
  );

  const handleSelectAllStripDays = useCallback(() => {
    if (stripDay === null) return;
    clearSelection();
    patchFilterState({ stripDay: null });
  }, [clearSelection, patchFilterState, stripDay]);

  const selectedRows = useMemo(
    () => displayRows.filter((row) => selectedIds.has(row.id)),
    [displayRows, selectedIds],
  );

  const summary = useMemo(() => {
    const now = new Date();
    const source = displayRows;
    return {
      total: isListView && listPagination !== null ? listPagination.total : source.length,
      active: source.filter((row) => row.status === "ACTIVE").length,
      upcoming: source.filter((row) => new Date(row.startsAt) >= now).length,
      full: source.filter((row) => spotsLeft(row) === 0).length,
      cancelled: source.filter((row) => row.status === "CANCELLED").length,
      draft: source.filter((row) => row.status === "DRAFT").length,
    };
  }, [displayRows, isListView, listPagination]);

  const { filterFields, integratedFilterValues, handleIntegratedFilterChange } =
    useAdminScheduleListFilterFields({
      coaches,
      levels,
      packageOptions,
      filters,
      quickFilters,
      patchFilterState,
    });

  const {
    handleCancel,
    handleActivate,
    handleBulkCancel,
    handleBulkActivate,
    handleDelete,
    handleDeleteFromDetails,
    handleDuplicate,
    handleDuplicateFromDetails,
    handleDetailsSaved,
    handleFormClose,
    handleFormSaved,
  } = useAdminScheduleManagementActions({
    t,
    router,
    setRows,
    setClassTypes,
    classTypes,
    setBusyId,
    setToast,
    setDetails,
    setEditing,
    addClassOpen,
    closeAddClassModal,
    sessionModalConfig,
    clearSelection,
  });

  const handleDateTimeSort = useCallback(() => {
    patchFilterState({
      filters: { order: toggleSessionDateSortOrder(filters.order) },
    });
  }, [filters.order, patchFilterState]);

  const visibleYearMonth = useMemo(() => {
    if (filters.from.length > 0) {
      return yearMonthFromIsoDay(filters.from);
    }
    if (stripDay !== null) {
      return yearMonthFromIsoDay(stripDay);
    }
    return yearMonthFromIsoDay(scheduleTodayIsoDate());
  }, [filters.from, stripDay]);

  const handleSetView = useCallback(
    (nextView: ScheduleView) => {
      clearSelection();
      if (nextView === "monthly") {
        const { from, to } = monthBoundsIso(yearMonthFromIsoDay(scheduleTodayIsoDate()));
        patchFilterState({ stripDay: null, filters: { from, to } }, true, nextView);
        return;
      }
      if (nextView === "list") {
        patchFilterState(
          {
            stripDay: scheduleTodayIsoDate(),
            filters: { from: "", to: "" },
          },
          true,
          nextView,
        );
        return;
      }
      setView(nextView);
    },
    [clearSelection, patchFilterState, setView],
  );

  const handleShiftVisibleMonth = useCallback(
    (deltaMonths: number) => {
      clearSelection();
      const { from, to } = monthBoundsIso(addCalendarMonths(visibleYearMonth, deltaMonths));
      patchFilterState({ stripDay: null, filters: { from, to } });
    },
    [clearSelection, patchFilterState, visibleYearMonth],
  );

  return {
    isStaff,
    t,
    view,
    setView: handleSetView,
    visibleYearMonth,
    handleShiftVisibleMonth,
    searchDraft,
    setSearchDraft,
    filterFields,
    integratedFilterValues,
    handleIntegratedFilterChange,
    resetFilters,
    summary,
    toast,
    displayRows,
    dateStripRows,
    dateStripTotalCount,
    selectedStripDay,
    handleSelectStripDay,
    handleSelectAllStripDays,
    filters,
    listPage,
    listPagination,
    setListPage,
    busyId,
    handleDateTimeSort,
    setDetails,
    details,
    sessionModalConfig,
    addClassOpen,
    openAddClassModal,
    sessionClassTypeOptions,
    coaches,
    handleFormClose,
    handleFormSaved,
    handleCancel,
    handleActivate,
    handleBulkCancel: () => handleBulkCancel(selectedRows),
    handleBulkActivate: () => handleBulkActivate(selectedRows),
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    handleDelete,
    handleDeleteFromDetails,
    handleDuplicate,
    handleDuplicateFromDetails,
    handleDetailsSaved,
  };
}
