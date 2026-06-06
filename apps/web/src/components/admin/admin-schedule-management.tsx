"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminCalendarViewSwitcher } from "@/components/admin/admin-calendar-view-switcher";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { StaffListPageLayout } from "@/components/shared/staff/staff-list-page-layout";
import {
  adminScheduleIntegratedFilterValues,
  buildAdminScheduleFilterFields,
  parseAdminScheduleListFilter,
  serializeAdminScheduleListFilter,
} from "@/components/admin/admin-schedule-filter-fields";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { OmmFilterMultiSelect } from "@/components/ui/omm-filter-multi-select";
import { OmmFormDropdown } from "@/components/ui/omm-select-dropdown";
import { OmmButton } from "@/components/ui/omm-button";
import { PlusIcon } from "@/components/ui/plus-icon";
import { TimePickerInput } from "@/components/ui/time-picker-input";
import { ApiError, apiFetch } from "@/lib/api";
import { formatDateForUi } from "@/lib/date-display";
import { buildClassTypeSlugFromName } from "@/lib/class-type-slug";
import { AdminClassTypesModal } from "@/components/admin/admin-class-types-modal";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import { AdminScheduleSessionCompactRow } from "@/components/admin/admin-schedule-session-compact-row";
import { buildSessionLevelOptions, resolveSessionClassTypeId, type SessionClassTypeOption } from "@/components/admin/admin-schedule-session-class-type-resolve";
import { AdminScheduleSessionDetailsSheet } from "@/components/admin/admin-schedule-session-details-sheet";
import {
  ADMIN_SCHEDULE_STATUS_BADGE_CLASS,
  sessionStatusBadgeTone,
} from "@/components/admin/admin-schedule-session-list-badges";
import { AdminScheduleSessionRowActions } from "@/components/admin/admin-schedule-session-row-actions";
import {
  ADMIN_SCHEDULE_SESSIONS_LIST_ACTIONS_HEADER_CELL,
  ADMIN_SCHEDULE_SESSIONS_LIST_EMPHASIZED_HEADER,
  ADMIN_SCHEDULE_SESSIONS_LIST_HEADER_CLASS,
  ADMIN_SCHEDULE_SESSIONS_LIST_TABLE_CLASS,
} from "@/components/admin/admin-schedule-sessions-list-layout";
import {
  matchesScheduleQuickFilters,
  SCHEDULE_QUICK_FILTER_VALUES,
  type ScheduleQuickFilter,
} from "@/components/admin/admin-schedule-quick-filters";
import { OmmDrawerPortal } from "@/components/ui/omm-modal";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import {
  ADMIN_SCHEDULE_LIST_PAGE_KEYS,
  parseAdminScheduleListPageParams,
} from "@/components/admin/admin-schedule-query";
import {
  ADMIN_SCHEDULE_LIST_FILTER_KEYS,
  buildScheduleFiltersQuery,
  defaultScheduleListFilters,
  type ScheduleListFilterState,
} from "@/components/admin/admin-schedule-url";
import {
  buildSchedulePackageFilterOptions,
  resolveScheduleSelectedClassTypeIds,
  type SchedulePackageOption,
} from "@/components/admin/admin-schedule-package-filter-options";
import { resetListPageQuery, syncListPageQuery } from "@/lib/list-pagination";
import { mapAdminScheduleSessionToListRow } from "@/lib/map-admin-session-to-list-row";
import { StaffScheduleSessionsTable } from "@/components/shared/schedule/staff-schedule-sessions-table";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS,
  ADMIN_DETAILS_SHEET_FOOTER_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_LEDE_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
  ADMIN_WIDE_DRAWER_PANEL_CLASS,
} from "@/components/admin/admin-details-sheet-layout";

type SessionStatus = "ACTIVE" | "CANCELLED" | "FULL" | "DRAFT";
type ScheduleDayOfWeek =
  | "SUNDAY"
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY";
export type ScheduleView = "list" | "monthly" | "weekly" | "daily";
type AvailabilityOption = "available" | "full";
type TimeOfDayOption = "morning" | "afternoon" | "evening";

export type AdminScheduleSession = {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  capacity: number;
  level: string | null;
  classFormat: string | null;
  status: SessionStatus;
  classType: { id: string; name: string };
  coach: { id: string; user: { name: string | null } };
  _count: { bookings: number };
};

export type AdminScheduleClassType = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

export type AdminScheduleCoach = {
  id: string;
  isActive: boolean;
  user: { name: string | null; lastName: string | null; email: string };
};

type Props = {
  locale: string;
  sessions: AdminScheduleSession[];
  listPagination: { total: number; take: number; offset: number } | null;
  classTypes: AdminScheduleClassType[];
  packages: AdminPackageRow[];
  coaches: AdminScheduleCoach[];
  initialView: ScheduleView;
  initialFilterState: ScheduleListFilterState;
  /** Staff surfaces (manager): list-only read-only rows with admin filters. */
  variant?: "full" | "staff";
  staffBanner?: string;
};

type Filters = {
  q: string;
  from: string;
  to: string;
  coachIds: string[];
  typeIds: string[];
  levels: string[];
  statuses: SessionStatus[];
  availability: AvailabilityOption[];
  timeOfDay: TimeOfDayOption[];
};

type FormState = {
  title: string;
  description: string;
  classTypeId: string;
  coachId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: string;
  levels: string[];
  status: SessionStatus;
};

type CalendarScheduleSlot = {
  id: string;
  weekday: ScheduleDayOfWeek;
  startTime: string;
  endTime: string;
};

type ScheduleToastTone = "ok" | "err";

type ScheduleToast = {
  tone: ScheduleToastTone;
  message: string;
};

const STATUS_OPTIONS: readonly SessionStatus[] = ["DRAFT", "ACTIVE", "FULL", "CANCELLED"];
const SCHEDULE_WEEKDAYS: readonly ScheduleDayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];
const SEARCH_DEBOUNCE_MS = 300;
const ADMIN_SCHEDULE_TOAST_DISMISS_MS = 5000;
const SCHEDULE_MODAL_QUERY_KEY = "modal";
const CLASS_TYPES_MODAL_QUERY_VALUE = "class-types";
const ADD_CLASS_MODAL_QUERY_VALUE = "add-class";
const EDIT_CLASS_TYPE_QUERY_KEY = "editClassType";
const SESSION_LEVEL_SEPARATOR = ", ";
const PACKAGE_CLASS_TYPE_VALUE_PREFIX = "package:";

function replaceScheduleModalInUrl(
  pathname: string,
  searchParams: URLSearchParams,
  router: ReturnType<typeof useRouter>,
  modal: string | null,
): void {
  const params = new URLSearchParams(searchParams.toString());
  if (modal === null) {
    params.delete(SCHEDULE_MODAL_QUERY_KEY);
    params.delete(EDIT_CLASS_TYPE_QUERY_KEY);
  } else {
    params.set(SCHEDULE_MODAL_QUERY_KEY, modal);
    if (modal !== CLASS_TYPES_MODAL_QUERY_VALUE) {
      params.delete(EDIT_CLASS_TYPE_QUERY_KEY);
    }
  }
  const qs = params.toString();
  router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
}

function replaceEditingClassTypeInUrl(
  pathname: string,
  searchParams: URLSearchParams,
  router: ReturnType<typeof useRouter>,
  classTypeId: string | null,
): void {
  const params = new URLSearchParams(searchParams.toString());
  params.set(SCHEDULE_MODAL_QUERY_KEY, CLASS_TYPES_MODAL_QUERY_VALUE);
  if (classTypeId === null) {
    params.delete(EDIT_CLASS_TYPE_QUERY_KEY);
  } else {
    params.set(EDIT_CLASS_TYPE_QUERY_KEY, classTypeId);
  }
  const qs = params.toString();
  router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
}

function isoDate(value: Date | string): string {
  return new Date(value).toISOString().slice(0, 10);
}

function timeValue(value: Date | string): string {
  return new Date(value).toTimeString().slice(0, 5);
}

function addDays(value: Date | string, days: number): Date {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
}

function createScheduleSlotId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `slot-${Date.now()}-${Math.random()}`;
}

function weekdayFromDate(value: Date | string): ScheduleDayOfWeek {
  const day = new Date(value).getDay();
  return (["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] as const)[day];
}

function initialCalendarSlot(form: FormState): CalendarScheduleSlot {
  return {
    id: createScheduleSlotId(),
    weekday: weekdayFromDate(`${form.date}T00:00:00`),
    startTime: form.startTime,
    endTime: form.endTime,
  };
}

function coachName(coach: AdminScheduleCoach | AdminScheduleSession["coach"]): string {
  if ("lastName" in coach.user) {
    return [coach.user.name, coach.user.lastName].filter(Boolean).join(" ") || coach.user.email;
  }
  return coach.user.name ?? "—";
}

function durationMinutes(row: AdminScheduleSession): number {
  return Math.max(0, Math.round((new Date(row.endsAt).getTime() - new Date(row.startsAt).getTime()) / 60000));
}

function spotsLeft(row: AdminScheduleSession): number {
  return Math.max(row.capacity - row._count.bookings, 0);
}

function splitSessionLevels(level: string | null | undefined): string[] {
  if (!level) {
    return [];
  }
  return level
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function joinSessionLevels(levels: readonly string[]): string | undefined {
  const uniqueLevels = Array.from(new Set(levels.map((value) => value.trim()).filter(Boolean)));
  return uniqueLevels.length > 0 ? uniqueLevels.join(SESSION_LEVEL_SEPARATOR) : undefined;
}

function matchesAvailability(row: AdminScheduleSession, selected: readonly AvailabilityOption[]): boolean {
  if (selected.length === 0) {
    return true;
  }
  const available = spotsLeft(row) > 0;
  const full = spotsLeft(row) === 0;
  return (
    (selected.includes("available") && available) ||
    (selected.includes("full") && full)
  );
}

function matchesTimeOfDaySelection(row: AdminScheduleSession, selected: readonly TimeOfDayOption[]): boolean {
  if (selected.length === 0) {
    return true;
  }
  const hour = new Date(row.startsAt).getHours();
  return (
    (selected.includes("morning") && hour < 12) ||
    (selected.includes("afternoon") && hour >= 12 && hour < 17) ||
    (selected.includes("evening") && hour >= 17)
  );
}

function countActiveFilters(values: Filters, quickFilters: readonly ScheduleQuickFilter[]): number {
  return [
    values.q.trim(),
    values.from,
    values.to,
    values.coachIds.length > 0 ? "coach" : "",
    values.typeIds.length > 0 ? "type" : "",
    values.levels.length > 0 ? "level" : "",
    values.statuses.length > 0 ? "status" : "",
    values.availability.length > 0 ? "availability" : "",
    values.timeOfDay.length > 0 ? "timeOfDay" : "",
    quickFilters.length > 0 ? "quick" : "",
  ].filter(Boolean).length;
}

function initialForm(
  classTypeOptions: readonly SessionClassTypeOption[],
  coaches: readonly AdminScheduleCoach[],
  row?: AdminScheduleSession,
): FormState {
  const start = row ? new Date(row.startsAt) : new Date();
  const end = row ? new Date(row.endsAt) : new Date(start.getTime() + 60 * 60000);
  return {
    title: row?.title ?? "",
    description: row?.description ?? "",
    classTypeId: row?.classType.id ?? classTypeOptions[0]?.value ?? "",
    coachId: row?.coach.id ?? coaches[0]?.id ?? "",
    date: isoDate(start),
    startTime: timeValue(start),
    endTime: timeValue(end),
    capacity: row ? String(row.capacity) : "",
    levels: splitSessionLevels(row?.level),
    status: row?.status ?? "ACTIVE",
  };
}

function formPayload(form: FormState, classTypeId: string) {
  return {
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    classTypeId,
    coachId: form.coachId,
    startsAt: new Date(`${form.date}T${form.startTime}:00`).toISOString(),
    endsAt: new Date(`${form.date}T${form.endTime}:00`).toISOString(),
    capacity: Number(form.capacity),
    level: joinSessionLevels(form.levels),
    status: form.status,
  };
}

function batchFormPayload(
  form: FormState,
  classTypeId: string,
  startDate: string,
  endDate: string,
  slots: readonly CalendarScheduleSlot[],
) {
  return {
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    classTypeId,
    coachId: form.coachId,
    capacity: Number(form.capacity),
    level: joinSessionLevels(form.levels),
    status: form.status,
    startDate,
    endDate,
    timezoneOffsetMinutes: new Date().getTimezoneOffset(),
    slots: slots.map(({ weekday, startTime, endTime }) => ({ weekday, startTime, endTime })),
  };
}

function buildSessionClassTypeOptions(
  classTypes: readonly AdminScheduleClassType[],
  packageOptions: readonly SchedulePackageOption[],
): SessionClassTypeOption[] {
  const options: SessionClassTypeOption[] = classTypes.map((type) => ({
    value: type.id,
    label: type.name,
    classTypeId: type.id,
  }));
  const classTypeIds = new Set(classTypes.map((type) => type.id));

  for (const option of packageOptions) {
    const linkedClassTypeId = option.classTypeIds.find((id) => classTypeIds.has(id)) ?? null;
    if (linkedClassTypeId !== null) {
      continue;
    }
    options.push({
      value: `${PACKAGE_CLASS_TYPE_VALUE_PREFIX}${option.id}`,
      label: option.label,
      classTypeId: null,
      packageLabel: option.label,
    });
  }

  return options.sort((left, right) => left.label.localeCompare(right.label));
}

export function AdminScheduleManagement({
  locale,
  sessions,
  listPagination,
  classTypes: initialClassTypes,
  packages,
  coaches,
  initialView,
  initialFilterState,
  variant = "full",
  staffBanner,
}: Props) {
  const isStaff = variant === "staff";
  const t = useTranslations("adminPages.classes");
  const tPage = useTranslations("adminPages.schedule");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasMounted = useRef(false);
  const filterStateRef = useRef(initialFilterState);
  const [rows, setRows] = useState(sessions);
  const [classTypes, setClassTypes] = useState(initialClassTypes);
  const [prevInitialClassTypes, setPrevInitialClassTypes] = useState(initialClassTypes);
  const [view, setView] = useState<ScheduleView>(isStaff ? "list" : initialView);
  const [filters, setFilters] = useState<Filters>(() => initialFilterState.filters);
  const [quickFilters, setQuickFilters] = useState<ScheduleQuickFilter[]>(
    () => initialFilterState.quickFilters,
  );
  const [searchDraft, setSearchDraft] = useState(() => initialFilterState.filters.q);
  const [selectedDay, setSelectedDay] = useState(() => isoDate(new Date()));
  const [editing, setEditing] = useState<AdminScheduleSession | null>(null);
  const [details, setDetails] = useState<AdminScheduleSession | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<ScheduleToast | null>(null);

  const scheduleModalParam = searchParams.get(SCHEDULE_MODAL_QUERY_KEY);
  const classTypesOpen = scheduleModalParam === CLASS_TYPES_MODAL_QUERY_VALUE;
  const addClassOpen = scheduleModalParam === ADD_CLASS_MODAL_QUERY_VALUE;
  const editingClassTypeIdParam = searchParams.get(EDIT_CLASS_TYPE_QUERY_KEY);
  const editingClassTypeId =
    editingClassTypeIdParam !== null &&
    classTypes.some((type) => type.id === editingClassTypeIdParam)
      ? editingClassTypeIdParam
      : null;

  const closeClassTypesModal = useCallback(() => {
    if (searchParams.get(SCHEDULE_MODAL_QUERY_KEY) === CLASS_TYPES_MODAL_QUERY_VALUE) {
      replaceScheduleModalInUrl(pathname, searchParams, router, null);
    }
  }, [pathname, router, searchParams]);

  const setEditingClassTypeInUrl = useCallback(
    (classTypeId: string | null) => {
      replaceEditingClassTypeInUrl(pathname, searchParams, router, classTypeId);
    },
    [pathname, router, searchParams],
  );

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

  useEffect(() => {
    setRows(sessions);
  }, [sessions]);

  useEffect(() => {
    filterStateRef.current = { filters, quickFilters };
  }, [filters, quickFilters]);

  useEffect(() => {
    setFilters(initialFilterState.filters);
    setQuickFilters(initialFilterState.quickFilters);
    setSearchDraft(initialFilterState.filters.q);
    filterStateRef.current = initialFilterState;
  }, [initialFilterState]);

  const listPage = useMemo(
    () => parseAdminScheduleListPageParams(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  const syncFilterStateToUrl = useCallback(
    (state: ScheduleListFilterState, resetPage = false) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const key of ADMIN_SCHEDULE_LIST_FILTER_KEYS) {
        params.delete(key);
      }
      if (resetPage && listPagination !== null) {
        resetListPageQuery(params, ADMIN_SCHEDULE_LIST_PAGE_KEYS);
      }
      const filterQuery = buildScheduleFiltersQuery(state.filters, state.quickFilters);
      if (filterQuery.length > 0) {
        for (const [key, value] of new URLSearchParams(filterQuery)) {
          params.set(key, value);
        }
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [listPagination, pathname, router, searchParams],
  );

  const patchFilterState = useCallback(
    (
      patch: {
        filters?: Partial<Filters>;
        quickFilters?: ScheduleQuickFilter[];
      },
      resetPage = true,
    ) => {
      const next: ScheduleListFilterState = {
        filters: { ...filterStateRef.current.filters, ...patch.filters },
        quickFilters: patch.quickFilters ?? filterStateRef.current.quickFilters,
      };
      setFilters(next.filters);
      setQuickFilters(next.quickFilters);
      filterStateRef.current = next;
      syncFilterStateToUrl(next, resetPage);
    },
    [syncFilterStateToUrl],
  );

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return undefined;
    }
    const handle = window.setTimeout(() => {
      const trimmed = searchDraft.trim();
      if (filterStateRef.current.filters.q === trimmed) {
        return;
      }
      patchFilterState({ filters: { q: trimmed } }, true);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [patchFilterState, searchDraft]);

  useEffect(() => {
    if (toast === null) {
      return undefined;
    }
    const handle = window.setTimeout(() => setToast(null), ADMIN_SCHEDULE_TOAST_DISMISS_MS);
    return () => window.clearTimeout(handle);
  }, [toast]);

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
    () => buildSessionClassTypeOptions(classTypes, packageOptions),
    [classTypes, packageOptions],
  );

  const isListView = isStaff || view === "list";

  const filteredRows = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return rows.filter((row) => {
      if (q && !`${row.title} ${row.classType.name} ${coachName(row.coach)}`.toLowerCase().includes(q)) return false;
      if (filters.from && row.startsAt.slice(0, 10) < filters.from) return false;
      if (filters.to && row.startsAt.slice(0, 10) > filters.to) return false;
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
  }, [filters, quickFilters, rows, selectedClassTypeIds, validSelectedPackageIds]);

  const displayRows = isListView ? rows : filteredRows;

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

  const sessionCountByTypeId = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of rows) {
      counts[row.classType.id] = (counts[row.classType.id] ?? 0) + 1;
    }
    return counts;
  }, [rows]);

  function resetFilters() {
    const cleared: ScheduleListFilterState = {
      filters: defaultScheduleListFilters,
      quickFilters: [],
    };
    setSearchDraft("");
    setFilters(cleared.filters);
    setQuickFilters(cleared.quickFilters);
    filterStateRef.current = cleared;
    syncFilterStateToUrl(cleared, true);
  }

  const setListPage = useCallback(
    (page: number, pageSize?: number) => {
      const params = new URLSearchParams(searchParams.toString());
      syncListPageQuery(params, page, pageSize, ADMIN_SCHEDULE_LIST_PAGE_KEYS);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const activeFilterCount = useMemo(
    () => countActiveFilters(filters, quickFilters),
    [filters, quickFilters],
  );

  const quickOptions = useMemo(
    () =>
      SCHEDULE_QUICK_FILTER_VALUES.map((value) => ({
        value,
        label: t(`quick.${value}`),
      })),
    [t],
  );

  const scheduleMultiSelectFormat = useCallback(
    (count: number) => t("filters.selectedCount", { count }),
    [t],
  );

  const filterFields = useMemo(
    () =>
      buildAdminScheduleFilterFields({
        labels: {
          fromDate: t("filters.fromDateLabel"),
          toDate: t("filters.toDateLabel"),
          coach: t("filters.coachLabel"),
          type: t("filters.typeLabel"),
          level: t("filters.levelLabel"),
          status: t("filters.statusLabel"),
          availability: t("filters.availabilityLabel"),
          timeOfDay: t("filters.timeOfDayLabel"),
          quick: t("filters.quickFilterLabel"),
        },
        renderCoachIds: ({ value, onChange }) => (
          <OmmFilterMultiSelect
            wrapLabel
            formatSelectedCount={scheduleMultiSelectFormat}
            ariaLabel={t("filters.coachLabel")}
            allLabel={t("filters.allCoaches")}
            selectedValues={parseAdminScheduleListFilter(value)}
            onChange={(values) => onChange(serializeAdminScheduleListFilter(values))}
            options={coaches.map((coach) => ({ value: coach.id, label: coachName(coach) }))}
          />
        ),
        renderTypeIds: ({ value, onChange }) => (
          <OmmFilterMultiSelect
            wrapLabel
            formatSelectedCount={scheduleMultiSelectFormat}
            ariaLabel={t("filters.typeLabel")}
            allLabel={t("filters.allTypes")}
            selectedValues={parseAdminScheduleListFilter(value)}
            onChange={(next) => onChange(serializeAdminScheduleListFilter(next))}
            options={packageOptions.map((option) => ({
              value: option.id,
              label: option.label,
            }))}
          />
        ),
        renderLevels: ({ value, onChange }) => (
          <OmmFilterMultiSelect
            wrapLabel
            formatSelectedCount={scheduleMultiSelectFormat}
            ariaLabel={t("filters.levelLabel")}
            allLabel={t("filters.allLevels")}
            selectedValues={parseAdminScheduleListFilter(value)}
            onChange={(next) => onChange(serializeAdminScheduleListFilter(next))}
            options={levels.map((level) => ({ value: level, label: level }))}
          />
        ),
        renderStatuses: ({ value, onChange }) => (
          <OmmFilterMultiSelect
            wrapLabel
            formatSelectedCount={scheduleMultiSelectFormat}
            ariaLabel={t("filters.statusLabel")}
            allLabel={t("filters.allStatuses")}
            selectedValues={parseAdminScheduleListFilter(value)}
            onChange={(next) => onChange(serializeAdminScheduleListFilter(next))}
            options={STATUS_OPTIONS.map((status) => ({
              value: status,
              label: t(`status.${status}`),
            }))}
          />
        ),
        renderAvailability: ({ value, onChange }) => (
          <OmmFilterMultiSelect
            wrapLabel
            formatSelectedCount={scheduleMultiSelectFormat}
            ariaLabel={t("filters.availabilityLabel")}
            allLabel={t("filters.allAvailability")}
            selectedValues={parseAdminScheduleListFilter(value)}
            onChange={(next) => onChange(serializeAdminScheduleListFilter(next))}
            options={[
              { value: "available", label: t("filters.availableOnly") },
              { value: "full", label: t("filters.fullOnly") },
            ]}
          />
        ),
        renderTimeOfDay: ({ value, onChange }) => (
          <OmmFilterMultiSelect
            wrapLabel
            formatSelectedCount={scheduleMultiSelectFormat}
            ariaLabel={t("filters.timeOfDayLabel")}
            allLabel={t("filters.allTimes")}
            selectedValues={parseAdminScheduleListFilter(value)}
            onChange={(next) => onChange(serializeAdminScheduleListFilter(next))}
            options={[
              { value: "morning", label: t("filters.morning") },
              { value: "afternoon", label: t("filters.afternoon") },
              { value: "evening", label: t("filters.evening") },
            ]}
          />
        ),
        renderQuick: ({ value, onChange }) => (
          <OmmFilterMultiSelect
            variant="accent"
            wrapLabel
            formatSelectedCount={scheduleMultiSelectFormat}
            ariaLabel={t("filters.quickFilterLabel")}
            allLabel={t("filters.allQuickFilters")}
            selectedValues={parseAdminScheduleListFilter(value)}
            onChange={(next) => onChange(serializeAdminScheduleListFilter(next))}
            options={quickOptions}
          />
        ),
      }),
    [coaches, levels, packageOptions, quickOptions, scheduleMultiSelectFormat, t],
  );

  const integratedFilterValues = useMemo(
    () =>
      adminScheduleIntegratedFilterValues(
        {
          from: filters.from,
          to: filters.to,
          coachIds: filters.coachIds,
          typeIds: filters.typeIds,
          levels: filters.levels,
          statuses: filters.statuses,
          availability: filters.availability,
          timeOfDay: filters.timeOfDay,
        },
        quickFilters,
      ),
    [filters, quickFilters],
  );

  function handleIntegratedFilterChange(key: string, value: string) {
    switch (key) {
      case "from":
        patchFilterState({ filters: { from: value } });
        break;
      case "to":
        patchFilterState({ filters: { to: value } });
        break;
      case "coachIds":
        patchFilterState({ filters: { coachIds: parseAdminScheduleListFilter(value) } });
        break;
      case "typeIds":
        patchFilterState({ filters: { typeIds: parseAdminScheduleListFilter(value) } });
        break;
      case "levels":
        patchFilterState({ filters: { levels: parseAdminScheduleListFilter(value) } });
        break;
      case "statuses":
        patchFilterState({
          filters: { statuses: parseAdminScheduleListFilter(value) as SessionStatus[] },
        });
        break;
      case "availability":
        patchFilterState({
          filters: {
            availability: parseAdminScheduleListFilter(value) as AvailabilityOption[],
          },
        });
        break;
      case "timeOfDay":
        patchFilterState({
          filters: { timeOfDay: parseAdminScheduleListFilter(value) as TimeOfDayOption[] },
        });
        break;
      case "quick":
        patchFilterState({
          quickFilters: parseAdminScheduleListFilter(value) as ScheduleQuickFilter[],
        });
        break;
      default:
        break;
    }
  }

  function updateView(nextView: ScheduleView): void {
    setView(nextView);
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", nextView);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  async function runRowAction(row: AdminScheduleSession, action: () => Promise<AdminScheduleSession | void>, ok: string) {
    setBusyId(row.id);
    setToast(null);
    try {
      const updated = await action();
      if (updated) setRows((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setToast({ tone: "ok", message: ok });
      router.refresh();
    } catch (error) {
      setToast({
        tone: "err",
        message: error instanceof ApiError ? error.message : t("messages.genericError"),
      });
    } finally {
      setBusyId(null);
    }
  }

  if (isStaff) {
    const staffRows = displayRows.map(mapAdminScheduleSessionToListRow);
    return (
      <div className="space-y-5">
        <StaffListPageLayout
          title={tPage("title")}
          banner={staffBanner}
          search={
            <ListPageSearchFilters
              search={searchDraft}
              onSearchChange={setSearchDraft}
              searchPlaceholder={t("filters.searchPlaceholder")}
              fields={filterFields}
              filterValues={integratedFilterValues}
              onFilterChange={handleIntegratedFilterChange}
              onClearAll={resetFilters}
              resetLabel={t("filters.reset")}
            />
          }
          headerTrailing={
            activeFilterCount > 0 ? (
              <p className="whitespace-nowrap text-xs text-sage-600" role="status">
                {t("filters.activeCount", { count: activeFilterCount })}
              </p>
            ) : undefined
          }
          metrics={<SummaryGrid summary={summary} />}
        >
          <StaffScheduleSessionsTable
            locale={locale}
            rows={staffRows}
            emptyTitle={t("empty.filteredTitle")}
            emptyBody={t("empty.filteredBody")}
            preset="staffWithCoach"
          />
          {listPagination !== null && listPagination.total > 0 ? (
            <OmmListPagination
              total={listPagination.total}
              page={listPage.page}
              pageSize={listPage.pageSize}
              offset={listPagination.offset}
              onPageChange={setListPage}
              onPageSizeChange={(pageSize) => setListPage(1, pageSize)}
              disabled={busyId !== null}
            />
          ) : null}
        </StaffListPageLayout>
        {toast ? (
          <div
            role="status"
            aria-live="polite"
            className={`fixed bottom-4 right-4 z-[95] max-w-sm rounded-xl border px-4 py-3 text-sm shadow-[0_12px_32px_-20px_rgba(45,40,35,0.4)] backdrop-blur-md ${
              toast.tone === "ok"
                ? "border-mint-200/80 bg-mint-50/95 text-sage-900"
                : "border-red-200/80 bg-red-50/95 text-red-900"
            }`}
          >
            {toast.message}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <AdminPageHero
        title={tPage("title")}
        search={
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <ListPageSearchFilters
              search={searchDraft}
              onSearchChange={setSearchDraft}
              searchPlaceholder={t("filters.searchPlaceholder")}
              fields={filterFields}
              filterValues={integratedFilterValues}
              onFilterChange={handleIntegratedFilterChange}
              onClearAll={resetFilters}
              resetLabel={t("filters.reset")}
            />
            <AdminCalendarViewSwitcher
              value={view}
              onChange={updateView}
              labels={{
                groupAria: t("views.aria"),
                list: t("views.list"),
                monthly: t("views.monthly"),
                weekly: t("views.weekly"),
                daily: t("views.daily"),
              }}
            />
          </div>
        }
        trailing={
          <>
            <OmmButton
              type="button"
              variant="secondary"
              size="md"
              onClick={openAddClassModal}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full"
            >
              <PlusIcon className="h-5 w-5 shrink-0" />
              {t("addClassButton")}
            </OmmButton>
            {activeFilterCount > 0 ? (
              <p className="whitespace-nowrap text-xs text-sage-600" role="status">
                {t("filters.activeCount", { count: activeFilterCount })}
              </p>
            ) : null}
          </>
        }
      />
      <SummaryGrid summary={summary} />
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-4 right-4 z-[95] max-w-sm rounded-xl border px-4 py-3 text-sm shadow-[0_12px_32px_-20px_rgba(45,40,35,0.4)] backdrop-blur-md ${
            toast.tone === "ok"
              ? "border-mint-200/80 bg-mint-50/95 text-sage-900"
              : "border-red-200/80 bg-red-50/95 text-red-900"
          }`}
        >
          {toast.message}
        </div>
      ) : null}
      <ScheduleViews
        locale={locale}
        view={view}
        rows={displayRows}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
        onDetails={setDetails}
        busyId={busyId}
        onCancel={(row) => {
          void runRowAction(
            row,
            () =>
              apiFetch(`/classes/sessions/${row.id}/status`, {
                method: "POST",
                body: JSON.stringify({ status: "CANCELLED" }),
              }),
            t("messages.cancelSuccess"),
          );
        }}
        onActivate={(row) => {
          void runRowAction(
            row,
            () =>
              apiFetch(`/classes/sessions/${row.id}/status`, {
                method: "POST",
                body: JSON.stringify({ status: "ACTIVE" }),
              }),
            t("messages.activateSuccess"),
          );
        }}
        onDelete={(row) => {
          void runRowAction(
            row,
            async () => {
              await apiFetch(`/classes/sessions/${row.id}`, { method: "DELETE" });
              setRows((current) => current.filter((item) => item.id !== row.id));
            },
            t("messages.deleteSuccess"),
          );
        }}
        onDuplicate={(row) => setEditing({ ...row, id: "" })}
      />
      {view === "list" && listPagination !== null && listPagination.total > 0 ? (
        <OmmListPagination
          total={listPagination.total}
          page={listPage.page}
          pageSize={listPage.pageSize}
          offset={listPagination.offset}
          onPageChange={setListPage}
          onPageSizeChange={(pageSize) => setListPage(1, pageSize)}
          disabled={busyId !== null}
        />
      ) : null}
      {sessionModalConfig ? (
        <SessionFormSheet
          isOpen
          mode={sessionModalConfig.mode}
          row={sessionModalConfig.row}
          classTypeOptions={sessionClassTypeOptions}
          coaches={coaches}
          onClose={() => {
            if (addClassOpen) {
              closeAddClassModal();
              return;
            }
            setEditing(null);
          }}
          onSaved={(saved) => {
            const savedRows = Array.isArray(saved) ? saved : [saved];
            const createdClassTypes = savedRows
              .map((row) => row.classType)
              .filter((type) => !classTypes.some((item) => item.id === type.id));
            if (createdClassTypes.length > 0) {
              setClassTypes((current) => {
                const byId = new Map(current.map((type) => [type.id, type]));
                for (const type of createdClassTypes) {
                  byId.set(type.id, {
                    id: type.id,
                    name: type.name,
                    slug: buildClassTypeSlugFromName(type.name),
                  });
                }
                return Array.from(byId.values()).sort((first, second) =>
                  first.name.localeCompare(second.name),
                );
              });
            }
            setRows((current) => {
              const byId = new Map(current.map((row) => [row.id, row]));
              for (const savedRow of savedRows) {
                byId.set(savedRow.id, savedRow);
              }
              return Array.from(byId.values()).sort((first, second) =>
                first.startsAt.localeCompare(second.startsAt),
              );
            });
            setToast({
              tone: "ok",
              message:
                sessionModalConfig.mode === "create"
                  ? t("messages.createSuccess")
                  : sessionModalConfig.mode === "duplicate"
                    ? t("messages.duplicateSuccess")
                    : t("messages.updateSuccess"),
            });
            if (addClassOpen) {
              closeAddClassModal();
            } else {
              setEditing(null);
            }
            router.refresh();
          }}
        />
      ) : null}
      <AdminScheduleSessionDetailsSheet
        locale={locale}
        row={details}
        classTypeOptions={sessionClassTypeOptions}
        coaches={coaches}
        actionBusy={busyId !== null && details !== null && busyId === details.id}
        onClose={() => setDetails(null)}
        onSaved={(saved) => {
          setRows((current) =>
            current
              .map((item) => (item.id === saved.id ? saved : item))
              .sort((first, second) => first.startsAt.localeCompare(second.startsAt)),
          );
          setDetails(saved);
        }}
        onDuplicate={(row) => {
          setDetails(null);
          setEditing({ ...row, id: "" });
        }}
        onDelete={(row) => {
          void runRowAction(
            row,
            async () => {
              await apiFetch(`/classes/sessions/${row.id}`, { method: "DELETE" });
              setRows((current) => current.filter((item) => item.id !== row.id));
              setDetails(null);
            },
            t("messages.deleteSuccess"),
          );
        }}
        onClassTypeCreated={(created) => {
          setClassTypes((current) => {
            if (current.some((type) => type.id === created.id)) {
              return current;
            }
            return [...current, created].sort((first, second) =>
              first.name.localeCompare(second.name),
            );
          });
        }}
      />
      <AdminClassTypesModal
        isOpen={classTypesOpen}
        classTypes={classTypes}
        sessionCountByTypeId={sessionCountByTypeId}
        initialSelectedId={editingClassTypeId}
        onClose={closeClassTypesModal}
        onSelectedTypeIdChange={setEditingClassTypeInUrl}
        onChanged={(nextTypes) => {
          setClassTypes(nextTypes);
        }}
      />
    </div>
  );
}

function SummaryGrid({ summary }: { summary: Record<"total" | "active" | "upcoming" | "full" | "cancelled" | "draft", number> }) {
  const t = useTranslations("adminPages.classes.summary");
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {(["total", "active", "upcoming", "full", "cancelled", "draft"] as const).map((key) => (
        <div key={key} className={adminChrome.metricCard}>
          <p className={adminChrome.metricLabel}>{t(key)}</p>
          <p className={adminChrome.metricValue}>{summary[key]}</p>
        </div>
      ))}
    </div>
  );
}

function startOfWeek(value: Date): Date {
  return addDays(value, -((value.getDay() + 6) % 7));
}

function groupRowsByDay(rows: readonly AdminScheduleSession[]): Map<string, AdminScheduleSession[]> {
  const map = new Map<string, AdminScheduleSession[]>();
  for (const row of rows) {
    const key = row.startsAt.slice(0, 10);
    map.set(key, [...(map.get(key) ?? []), row]);
  }
  for (const [key, value] of map) {
    map.set(key, value.sort((a, b) => a.startsAt.localeCompare(b.startsAt)));
  }
  return map;
}

function ScheduleViews(props: {
  locale: string;
  view: ScheduleView;
  rows: AdminScheduleSession[];
  selectedDay: string;
  busyId: string | null;
  onSelectDay: (day: string) => void;
  onDetails: (row: AdminScheduleSession) => void;
  onCancel: (row: AdminScheduleSession) => void;
  onActivate: (row: AdminScheduleSession) => void;
  onDelete: (row: AdminScheduleSession) => void;
  onDuplicate: (row: AdminScheduleSession) => void;
}) {
  if (props.view === "monthly") return <MonthlyPanel {...props} />;
  if (props.view === "weekly") return <WeeklyPanel {...props} />;
  if (props.view === "daily") return <DailyPanel {...props} />;
  return (
    <div className="space-y-3">
      <CalendarSummaryCard locale={props.locale} rows={props.rows} selectedDay={props.selectedDay} onSelectDay={props.onSelectDay} />
      <SessionTable {...props} rows={props.rows} />
    </div>
  );
}

function SessionTable(props: Omit<Parameters<typeof ScheduleViews>[0], "view">) {
  const t = useTranslations("adminPages.classes");
  const rows = [...props.rows].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  if (rows.length === 0) {
    return (
      <div className={adminChrome.panel}>
        <p className="font-medium text-sage-900">{t("empty.filteredTitle")}</p>
        <p className="mt-1 text-sm text-sage-600">{t("empty.filteredBody")}</p>
      </div>
    );
  }
  return (
    <div className={ADMIN_SCHEDULE_SESSIONS_LIST_TABLE_CLASS}>
      <div className={ADMIN_SCHEDULE_SESSIONS_LIST_HEADER_CLASS}>
        <span>{t("colClass")}</span>
        <span className={ADMIN_SCHEDULE_SESSIONS_LIST_EMPHASIZED_HEADER}>{t("colDateTime")}</span>
        <span className={ADMIN_SCHEDULE_SESSIONS_LIST_EMPHASIZED_HEADER}>{t("colCoach")}</span>
        <span className={ADMIN_SCHEDULE_SESSIONS_LIST_EMPHASIZED_HEADER}>{t("colCapacity")}</span>
        <span className={ADMIN_SCHEDULE_SESSIONS_LIST_EMPHASIZED_HEADER}>{t("colTags")}</span>
        <span aria-hidden="true" />
        <span className={ADMIN_SCHEDULE_SESSIONS_LIST_ACTIONS_HEADER_CELL}>{t("colActions")}</span>
      </div>
      {rows.map((row) => (
        <AdminScheduleSessionCompactRow
          key={row.id}
          row={row}
          locale={props.locale}
          busy={props.busyId === row.id}
          onDetails={props.onDetails}
          onDuplicate={props.onDuplicate}
          onCancel={props.onCancel}
          onActivate={props.onActivate}
        />
      ))}
    </div>
  );
}

function SessionStatusBadge({ status }: { status: AdminScheduleSession["status"] }) {
  const t = useTranslations("adminPages.classes");
  return (
    <span
      className={`${ADMIN_SCHEDULE_STATUS_BADGE_CLASS} ${sessionStatusBadgeTone(status)}`}
    >
      {t(`status.${status}`)}
    </span>
  );
}

function SessionAgendaCard({ row, locale, busyId, onDetails, onCancel, onActivate, onDuplicate }: { row: AdminScheduleSession; locale: string; busyId: string | null; onDetails: (row: AdminScheduleSession) => void; onCancel: (row: AdminScheduleSession) => void; onActivate: (row: AdminScheduleSession) => void; onDuplicate: (row: AdminScheduleSession) => void }) {
  const t = useTranslations("adminPages.classes");
  const busy = busyId === row.id;
  return (
    <article className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-[0_14px_34px_-26px_rgba(45,40,35,0.35)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sage-500">
            {new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(row.startsAt))} - {new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(row.endsAt))}
          </p>
          <button type="button" className="mt-1 text-left text-base font-semibold text-sage-900 underline-offset-2 hover:underline" onClick={() => onDetails(row)}>
            {row.title}
          </button>
          <p className="mt-1 text-sm text-sage-600">
            {row.classType.name} · {coachName(row.coach)} · {durationMinutes(row)}m
          </p>
          <p className="mt-2 text-xs text-sage-500">
            {row._count.bookings}/{row.capacity} · {t("fields.spotsLeft", { count: spotsLeft(row) })}
            {row.level ? ` · ${row.level}` : ""}
          </p>
        </div>
        <SessionStatusBadge status={row.status} />
      </div>
      <div className="mt-4 flex justify-end">
        <AdminScheduleSessionRowActions
          row={row}
          busy={busy}
          onDuplicate={onDuplicate}
          onCancel={onCancel}
          onActivate={onActivate}
        />
      </div>
    </article>
  );
}

function CalendarSummaryCard({ locale, rows, selectedDay, onSelectDay }: { locale: string; rows: readonly AdminScheduleSession[]; selectedDay: string; onSelectDay: (day: string) => void }) {
  const grouped = groupRowsByDay(rows);
  const days = Array.from(grouped.keys()).sort().slice(0, 14);
  if (days.length === 0) return null;
  return (
    <div className="rounded-[28px] border border-white/70 bg-white/55 p-4 shadow-[0_18px_44px_-30px_rgba(45,40,35,0.3)] backdrop-blur-md">
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7">
        {days.map((day) => (
          <DayCard key={day} locale={locale} day={day} rows={grouped.get(day) ?? []} selected={day === selectedDay} onSelect={onSelectDay} compact />
        ))}
      </div>
    </div>
  );
}

function DayCard({ locale, day, rows, selected, onSelect, muted = false, compact = false }: { locale: string; day: string; rows: readonly AdminScheduleSession[]; selected: boolean; onSelect: (day: string) => void; muted?: boolean; compact?: boolean }) {
  const date = new Date(`${day}T00:00:00`);
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date);
  const isToday = day === isoDate(new Date());
  return (
    <button
      type="button"
      onClick={() => onSelect(day)}
      className={`min-h-28 rounded-2xl border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-700/25 ${
        isToday
          ? "border-sage-700/20 bg-sage-800 text-white shadow-[0_18px_34px_-24px_rgba(45,40,35,0.6)]"
          : selected
            ? "border-sage-700/20 bg-sage-50/90 text-sage-900 shadow-[0_14px_28px_-24px_rgba(45,40,35,0.35)]"
          : muted
            ? "border-white/50 bg-white/35 text-sage-500 hover:bg-white/55"
            : "border-white/70 bg-white/75 text-sage-800 hover:-translate-y-0.5 hover:bg-white"
      }`}
    >
      <span className="flex items-start justify-between gap-2">
        <span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] opacity-75">{weekday}</span>
          <span className="mt-1 block text-lg font-semibold tabular-nums">{date.getDate()}</span>
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${isToday ? "bg-white/20" : selected ? "bg-sage-800/10 text-sage-900" : "bg-sand-50 text-sage-700"}`}>
          {rows.length}
        </span>
      </span>
      {compact ? null : (
        <span className="mt-3 block space-y-1">
          {rows.slice(0, 3).map((row) => (
            <span key={row.id} className={`block truncate rounded-lg px-2 py-1 text-[11px] ${isToday ? "bg-white/15" : "bg-sage-50/80 text-sage-700"}`}>
              {timeValue(row.startsAt)} · {row.title}
            </span>
          ))}
          {rows.length > 3 ? <span className="block text-[11px] opacity-70">+{rows.length - 3}</span> : null}
        </span>
      )}
    </button>
  );
}

function MonthlyPanel(props: Omit<Parameters<typeof ScheduleViews>[0], "view">) {
  const grouped = groupRowsByDay(props.rows);
  const selected = new Date(`${props.selectedDay}T00:00:00`);
  const monthStart = new Date(selected.getFullYear(), selected.getMonth(), 1);
  const gridStart = startOfWeek(monthStart);
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index);
    return date.toISOString().slice(0, 10);
  });
  return (
    <div className="rounded-[30px] border border-white/70 bg-white/55 p-4 shadow-[0_20px_50px_-32px_rgba(45,40,35,0.35)] backdrop-blur-md">
      <p className="mb-3 text-sm font-semibold text-sage-900">{new Intl.DateTimeFormat(props.locale, { month: "long", year: "numeric" }).format(selected)}</p>
      <div className="grid gap-2 md:grid-cols-7">
        {days.map((day) => {
          const date = new Date(`${day}T00:00:00`);
          return <DayCard key={day} locale={props.locale} day={day} rows={grouped.get(day) ?? []} selected={day === props.selectedDay} onSelect={props.onSelectDay} muted={date.getMonth() !== selected.getMonth()} />;
        })}
      </div>
    </div>
  );
}

function WeeklyPanel(props: Omit<Parameters<typeof ScheduleViews>[0], "view">) {
  const selected = new Date(`${props.selectedDay}T00:00:00`);
  const monday = startOfWeek(selected);
  const grouped = groupRowsByDay(props.rows);
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = addDays(monday, index);
    const iso = day.toISOString().slice(0, 10);
    return { iso, rows: grouped.get(iso) ?? [] };
  });
  return (
    <div className="rounded-[30px] border border-white/70 bg-white/55 p-4 shadow-[0_20px_50px_-32px_rgba(45,40,35,0.35)] backdrop-blur-md">
      <p className="mb-3 text-sm font-semibold text-sage-900">
        {formatDateForUi(days[0]?.iso ?? props.selectedDay)} - {formatDateForUi(days[6]?.iso ?? props.selectedDay)}
      </p>
      <div className="grid gap-3 lg:grid-cols-7">
        {days.map((day) => (
          <div
            key={day.iso}
            className={`min-h-72 rounded-2xl border p-3 transition-all ${
              day.iso === isoDate(new Date())
                ? "border-sage-700/20 bg-sage-800 text-white shadow-[0_18px_34px_-24px_rgba(45,40,35,0.6)]"
                : day.iso === props.selectedDay
                  ? "border-sage-700/20 bg-sage-50/80 text-sage-900"
                  : "border-white/70 bg-white/65 text-sage-900"
            }`}
          >
            <button type="button" className="mb-3 w-full text-left" onClick={() => props.onSelectDay(day.iso)}>
              <span className={`block text-[10px] font-semibold uppercase tracking-[0.12em] ${day.iso === isoDate(new Date()) ? "text-white/70" : "text-sage-500"}`}>
                {new Intl.DateTimeFormat(props.locale, { weekday: "short" }).format(new Date(`${day.iso}T00:00:00`))}
              </span>
              <span className={`mt-1 block text-lg font-semibold ${day.iso === isoDate(new Date()) ? "text-white" : "text-sage-900"}`}>
                {new Date(`${day.iso}T00:00:00`).getDate()}
              </span>
            </button>
            <div className="space-y-2">
              {day.rows.length === 0 ? <p className={`rounded-xl px-3 py-4 text-xs ${day.iso === isoDate(new Date()) ? "bg-white/10 text-white/65" : "bg-white/55 text-sage-400"}`}>—</p> : day.rows.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  className={`w-full rounded-xl border px-3 py-2 text-left text-xs shadow-sm transition-colors ${
                    day.iso === isoDate(new Date())
                      ? "border-white/15 bg-white/10 text-white hover:bg-white/20"
                      : "border-white/70 bg-white/85 text-sage-700 hover:bg-white"
                  }`}
                  onClick={() => props.onDetails(row)}
                >
                  <span className={`block font-semibold ${day.iso === isoDate(new Date()) ? "text-white" : "text-sage-900"}`}>{timeValue(row.startsAt)}</span>
                  <span className={`mt-0.5 block truncate ${day.iso === isoDate(new Date()) ? "text-white/80" : "text-sage-600"}`}>{row.title}</span>
                  <span className={`mt-1 block truncate text-[11px] ${day.iso === isoDate(new Date()) ? "text-white/60" : "text-sage-500"}`}>{coachName(row.coach)}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DailyPanel(props: Omit<Parameters<typeof ScheduleViews>[0], "view">) {
  const selected = new Date(`${props.selectedDay}T00:00:00`);
  const weekStart = startOfWeek(selected);
  const grouped = groupRowsByDay(props.rows);
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index).toISOString().slice(0, 10));
  const selectedRows = grouped.get(props.selectedDay) ?? [];
  return (
    <div className="space-y-3">
      <div className="rounded-[30px] border border-white/70 bg-white/55 p-4 shadow-[0_20px_50px_-32px_rgba(45,40,35,0.35)] backdrop-blur-md">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-sage-900">{formatDateForUi(props.selectedDay)}</p>
            <p className="text-xs text-sage-500">{new Intl.DateTimeFormat(props.locale, { weekday: "long" }).format(selected)}</p>
          </div>
          <div className="flex gap-2">
            <OmmButton size="sm" variant="ghost" onClick={() => props.onSelectDay(addDays(selected, -1).toISOString().slice(0, 10))}>{"<"}</OmmButton>
            <OmmButton size="sm" variant="ghost" onClick={() => props.onSelectDay(addDays(selected, 1).toISOString().slice(0, 10))}>{">"}</OmmButton>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
          {days.map((day) => <DayCard key={day} locale={props.locale} day={day} rows={grouped.get(day) ?? []} selected={day === props.selectedDay} onSelect={props.onSelectDay} compact />)}
        </div>
      </div>
      <div className="rounded-[30px] border border-white/70 bg-white/55 p-4 shadow-[0_20px_50px_-32px_rgba(45,40,35,0.35)] backdrop-blur-md">
        {selectedRows.length === 0 ? (
          <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-10 text-center text-sm text-sage-500">—</div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {selectedRows.map((row) => (
              <SessionAgendaCard key={row.id} row={row} locale={props.locale} busyId={props.busyId} onDetails={props.onDetails} onCancel={props.onCancel} onActivate={props.onActivate} onDuplicate={props.onDuplicate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SessionFormSheet({
  isOpen,
  mode,
  row,
  classTypeOptions,
  coaches,
  onClose,
  onSaved,
}: {
  isOpen: boolean;
  mode: "create" | "edit" | "duplicate";
  row?: AdminScheduleSession;
  classTypeOptions: readonly SessionClassTypeOption[];
  coaches: readonly AdminScheduleCoach[];
  onClose: () => void;
  onSaved: (row: AdminScheduleSession | AdminScheduleSession[]) => void;
}) {
  const t = useTranslations("adminPages.classes");
  const titleId = useId();
  const formId = useId();
  const [form, setForm] = useState(() => initialForm(classTypeOptions, coaches, row));
  const [calendarStartDate, setCalendarStartDate] = useState(form.date);
  const [calendarEndDate, setCalendarEndDate] = useState(isoDate(addDays(`${form.date}T00:00:00`, 29)));
  const [calendarSlots, setCalendarSlots] = useState<CalendarScheduleSlot[]>(() => [
    initialCalendarSlot(form),
  ]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isBatchCreate = mode !== "edit";
  const levelOptions = useMemo(
    () => buildSessionLevelOptions((key) => t(key), [...splitSessionLevels(row?.level), ...form.levels]),
    [form.levels, row?.level, t],
  );

  function addCalendarSlot(): void {
    setCalendarSlots((current) => [
      ...current,
      {
        id: createScheduleSlotId(),
        weekday: current.at(-1)?.weekday ?? weekdayFromDate(`${form.date}T00:00:00`),
        startTime: form.startTime,
        endTime: form.endTime,
      },
    ]);
  }

  function updateCalendarSlot<K extends keyof Omit<CalendarScheduleSlot, "id">>(
    id: string,
    key: K,
    value: CalendarScheduleSlot[K],
  ): void {
    setCalendarSlots((current) =>
      current.map((slot) => (slot.id === id ? { ...slot, [key]: value } : slot)),
    );
  }

  function removeCalendarSlot(id: string): void {
    setCalendarSlots((current) => current.filter((slot) => slot.id !== id));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const resolvedClassType = await resolveSessionClassTypeId(form.classTypeId, classTypeOptions);
      if (isBatchCreate) {
        const payload = batchFormPayload(
          form,
          resolvedClassType.classTypeId,
          calendarStartDate,
          calendarEndDate,
          calendarSlots,
        );
        const saved = await apiFetch<AdminScheduleSession[]>("/classes/sessions/batch", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        onSaved(saved);
        return;
      }
      const saved = await apiFetch<AdminScheduleSession>(
        row?.id ? `/classes/sessions/${row.id}` : "/classes/sessions",
        { method: "PATCH", body: JSON.stringify(formPayload(form, resolvedClassType.classTypeId)) },
      );
      onSaved(saved);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError ? requestError.message : t("messages.genericError"),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <OmmDrawerPortal
      isOpen={isOpen}
      onClose={onClose}
      backdropAriaLabel={t("modalBackdropClose")}
      ariaLabelledBy={titleId}
      closeDisabled={pending}
      overlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
      panelClassName={ADMIN_WIDE_DRAWER_PANEL_CLASS}
    >
      <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h2 id={titleId} className={ADMIN_DETAILS_SHEET_TITLE_CLASS}>
              {mode === "create"
                ? t("createTitle")
                : mode === "duplicate"
                  ? t("duplicateTitle")
                  : t("editTitle")}
            </h2>
            <p className={ADMIN_DETAILS_SHEET_LEDE_CLASS}>
              {mode === "duplicate"
                ? t("duplicateDescription")
                : mode === "create"
                  ? t("createDescription")
                  : t("editDescription")}
            </p>
          </div>
          <button
            type="button"
            className={ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS}
            onClick={onClose}
            aria-label={t("modalCloseAria")}
            disabled={pending}
          >
            ×
          </button>
        </div>
      </header>
      <div className={ADMIN_DETAILS_SHEET_BODY_CLASS}>
        <form
          id={formId}
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(event) => {
            void submit(event);
          }}
        >
        <input
          className="ommm-input sm:col-span-2"
          value={form.title}
          onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          placeholder={t("form.className")}
          required
        />
        <OmmFormDropdown
          value={form.classTypeId}
          ariaLabel={t("form.classType")}
          placeholderLabel={t("form.classType")}
          options={classTypeOptions.map((type) => ({ value: type.value, label: type.label }))}
          onChange={(value) => setForm((current) => ({ ...current, classTypeId: value }))}
        />
        <OmmFormDropdown
          value={form.coachId}
          ariaLabel={t("form.coach")}
          placeholderLabel={t("form.coach")}
          options={coaches.map((coach) => ({ value: coach.id, label: coachName(coach) }))}
          onChange={(value) => setForm((current) => ({ ...current, coachId: value }))}
        />
        {!isBatchCreate ? (
          <>
            <DatePickerInput
              name="date"
              value={form.date}
              onChange={(value) => setForm((current) => ({ ...current, date: value }))}
              ariaLabel={t("form.date")}
              required
            />
            <TimePickerInput
              name="startTime"
              value={form.startTime}
              onChange={(value) => setForm((current) => ({ ...current, startTime: value }))}
              required
            />
            <TimePickerInput
              name="endTime"
              value={form.endTime}
              onChange={(value) => setForm((current) => ({ ...current, endTime: value }))}
              required
            />
          </>
        ) : null}
        <label className="flex flex-col gap-1">
          <span className="px-1 text-xs font-semibold uppercase tracking-[0.12em] text-sage-500">
            {t("form.capacityHint")}
          </span>
          <input
            className="ommm-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={form.capacity}
            onChange={(event) =>
              setForm((current) => ({ ...current, capacity: event.target.value.replace(/\D/g, "") }))
            }
            placeholder={t("form.capacity")}
            required
          />
        </label>
        <OmmFilterMultiSelect
          ariaLabel={t("form.level")}
          allLabel={t("form.level")}
          selectedValues={form.levels}
          options={levelOptions}
          onChange={(value) => setForm((current) => ({ ...current, levels: value }))}
          className="sm:col-span-2"
          triggerClassName="text-center"
          formatSelectedCount={(count) => t("filters.selectedCount", { count })}
        />
        {isBatchCreate ? (
          <section className="rounded-2xl border border-sand-500/20 bg-white/70 p-4 sm:col-span-2">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-sage-950">
                {t("calendarSchedule.title")}
              </h3>
              <p className="text-sm text-sage-600">{t("calendarSchedule.description")}</p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-sm font-semibold text-sage-950">
                  {t("calendarSchedule.startDate")}
                </span>
                <DatePickerInput
                  name="calendar-start-date"
                  value={calendarStartDate}
                  onChange={setCalendarStartDate}
                  ariaLabel={t("calendarSchedule.startDate")}
                  required
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-sage-950">
                  {t("calendarSchedule.endDate")}
                </span>
                <DatePickerInput
                  name="calendar-end-date"
                  value={calendarEndDate}
                  onChange={setCalendarEndDate}
                  ariaLabel={t("calendarSchedule.endDate")}
                  required
                />
              </label>
            </div>
            <div className="mt-4 space-y-3">
              <h4 className="text-sm font-semibold text-sage-950">
                {t("calendarSchedule.weeklySlots")}
              </h4>
              <div className="space-y-2 rounded-2xl border border-sand-500/15 bg-white/75 p-2">
                {calendarSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="grid gap-2 rounded-xl border border-sand-500/15 bg-white/80 p-2 sm:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,1fr)_3.5rem]"
                  >
                    <OmmFormDropdown
                      value={slot.weekday}
                      ariaLabel={t("calendarSchedule.weekday")}
                      placeholderLabel={t("calendarSchedule.weekday")}
                      options={SCHEDULE_WEEKDAYS.map((weekday) => ({
                        value: weekday,
                        label: t(`weekday.${weekday}`),
                      }))}
                      onChange={(value) =>
                        updateCalendarSlot(slot.id, "weekday", value as ScheduleDayOfWeek)
                      }
                    />
                    <TimePickerInput
                      name={`calendar-start-time-${slot.id}`}
                      value={slot.startTime}
                      onChange={(value) => updateCalendarSlot(slot.id, "startTime", value)}
                      ariaLabel={t("calendarSchedule.startTime")}
                      required
                    />
                    <TimePickerInput
                      name={`calendar-end-time-${slot.id}`}
                      value={slot.endTime}
                      onChange={(value) => updateCalendarSlot(slot.id, "endTime", value)}
                      ariaLabel={t("calendarSchedule.endTime")}
                      required
                    />
                    <button
                      type="button"
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-sand-500/25 bg-white/80 text-sage-600 transition-colors hover:bg-sand-50 disabled:opacity-45"
                      onClick={() => removeCalendarSlot(slot.id)}
                      disabled={calendarSlots.length === 1}
                      aria-label={t("calendarSchedule.removeSlot")}
                    >
                      x
                    </button>
                  </div>
                ))}
                <OmmButton type="button" variant="ghost" size="sm" onClick={addCalendarSlot}>
                  <PlusIcon className="h-3.5 w-3.5" />
                  {t("calendarSchedule.addSlot")}
                </OmmButton>
              </div>
            </div>
          </section>
        ) : null}
        <textarea
          className="ommm-input min-h-24 sm:col-span-2"
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          placeholder={t("form.description")}
        />
        {error ? <p className="app-alert-warn text-sm sm:col-span-2">{error}</p> : null}
        </form>
      </div>
      <footer className={`${ADMIN_DETAILS_SHEET_FOOTER_CLASS} flex justify-end gap-2`}>
        <OmmButton type="button" size="sm" variant="ghost" onClick={onClose} disabled={pending}>
          {t("cancelButton")}
        </OmmButton>
        <OmmButton type="submit" size="sm" variant="primary" form={formId} disabled={pending}>
          {pending ? t("savingButton") : mode === "create" ? t("createButton") : t("saveButton")}
        </OmmButton>
      </footer>
    </OmmDrawerPortal>
  );
}
