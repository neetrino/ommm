"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminFilterResetBar } from "@/components/ui/admin-filter-reset-bar";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { OmmFilterMultiSelect } from "@/components/ui/omm-filter-multi-select";
import { OmmFormDropdown } from "@/components/ui/omm-select-dropdown";
import { OmmButton } from "@/components/ui/omm-button";
import { PlusIcon } from "@/components/ui/plus-icon";
import { TimePickerInput } from "@/components/ui/time-picker-input";
import { ApiError, apiFetch } from "@/lib/api";
import { formatDateForUi, formatDateTimeForUi } from "@/lib/date-display";
import { AdminClassTypesModal } from "@/components/admin/admin-class-types-modal";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import { normalizePackageCategoryKey } from "@/components/admin/package-category-utils";
import { AdminScheduleSessionActions } from "@/components/admin/admin-schedule-session-actions";
import {
  matchesScheduleQuickFilters,
  SCHEDULE_QUICK_FILTER_VALUES,
  type ScheduleQuickFilter,
} from "@/components/admin/admin-schedule-quick-filters";
import { OmmDrawerPortal, OmmModalPortal } from "@/components/ui/omm-modal";

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
  classTypes: AdminScheduleClassType[];
  packages: AdminPackageRow[];
  coaches: AdminScheduleCoach[];
  initialView: ScheduleView;
  description?: string;
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

type SchedulePackageOption = {
  id: string;
  label: string;
  classTypeIds: string[];
};

type SessionClassTypeOption = {
  value: string;
  label: string;
  classTypeId: string | null;
  packageLabel?: string;
};

const STATUS_OPTIONS: readonly SessionStatus[] = ["DRAFT", "ACTIVE", "FULL", "CANCELLED"];
const SESSION_LEVEL_VALUES = ["Beginner", "Intermediate", "Advanced"] as const;
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

function formatSessionTimes(
  locale: string,
  startsAt: string,
  endsAt: string,
): { start: string; end: string } {
  const formatter = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });
  return {
    start: formatter.format(new Date(startsAt)),
    end: formatter.format(new Date(endsAt)),
  };
}

const scheduleTable = {
  wrap: adminChrome.tableWrap,
  table: "w-full min-w-[56rem] table-fixed border-collapse text-left text-xs sm:text-sm",
  row: `${adminChrome.tr} transition-colors hover:bg-white/40`,
  th: `${adminChrome.th} px-3 py-3 align-middle first:pl-5 last:pr-5`,
  thCompact: `${adminChrome.th} px-3 py-3 text-center align-middle whitespace-nowrap`,
  thGroup: `${adminChrome.th} w-[9%] px-4 py-3 align-middle whitespace-nowrap`,
  thGroupCenter: `${adminChrome.th} w-[9%] px-4 py-3 text-center align-middle whitespace-nowrap`,
  thActions: `${adminChrome.th} w-[6.5rem] px-2 py-3 text-center align-middle`,
  tdPrimary: `${adminChrome.tdStrong} min-w-0 px-3 py-3.5 align-middle first:pl-5`,
  td: `${adminChrome.td} min-w-0 px-3 py-3.5 align-middle`,
  tdMuted: `${adminChrome.tdMuted} min-w-0 px-3 py-3.5 align-middle`,
  tdCompact: `${adminChrome.td} px-3 py-3.5 text-center align-middle whitespace-nowrap tabular-nums`,
  tdGroup: `${adminChrome.td} w-[9%] min-w-0 px-4 py-3.5 align-middle`,
  tdGroupCenter: `${adminChrome.td} w-[9%] px-4 py-3.5 text-center align-middle whitespace-nowrap tabular-nums`,
  tdActions: "w-[6.5rem] min-w-0 px-2 py-2 align-middle last:pr-3",
} as const;

function initialFilters(): Filters {
  return {
    q: "",
    from: "",
    to: "",
    coachIds: [],
    typeIds: [],
    levels: [],
    statuses: [],
    availability: [],
    timeOfDay: [],
  };
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

function QuickFilterGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z" />
    </svg>
  );
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

function buildSessionLevelOptions(
  translate: (
    key: "form.levels.beginner" | "form.levels.intermediate" | "form.levels.advanced",
  ) => string,
  extraLevels?: readonly string[],
): Array<{ value: string; label: string }> {
  const options = SESSION_LEVEL_VALUES.map((value) => ({
    value,
    label:
      value === "Beginner"
        ? translate("form.levels.beginner")
        : value === "Intermediate"
          ? translate("form.levels.intermediate")
          : translate("form.levels.advanced"),
  }));
  const extraOptions = (extraLevels ?? [])
    .map((level) => level.trim())
    .filter(
      (level) =>
        level.length > 0 &&
        !SESSION_LEVEL_VALUES.includes(level as (typeof SESSION_LEVEL_VALUES)[number]),
    )
    .map((level) => ({ value: level, label: level }));
  if (extraOptions.length > 0) {
    return [...extraOptions, ...options];
  }
  return options;
}

function buildPackageFilterOptions(
  packages: readonly AdminPackageRow[],
  classTypes: readonly AdminScheduleClassType[],
): SchedulePackageOption[] {
  const classTypeIdByCategoryKey = new Map(
    classTypes.map((type) => [normalizePackageCategoryKey(type.name), type.id]),
  );
  const byCategoryKey = new Map<
    string,
    { label: string; classTypeIds: Set<string> }
  >();
  const shellLabelByCategoryKey = new Map<string, string>();

  for (const pkg of packages) {
    const categoryKey = normalizePackageCategoryKey(pkg.categoryName);
    const name = pkg.name.trim();
    if (pkg.isActive && pkg.priceCents <= 0 && categoryKey.length > 0 && name.length > 0) {
      shellLabelByCategoryKey.set(categoryKey, name);
    }
  }

  for (const pkg of packages) {
    if (!pkg.isActive) {
      continue;
    }
    const categoryLabel = pkg.categoryName.trim();
    if (categoryLabel.length === 0) {
      continue;
    }
    const categoryKey = normalizePackageCategoryKey(categoryLabel);
    const label = shellLabelByCategoryKey.get(categoryKey) ?? categoryLabel;
    const mappedClassTypeId =
      pkg.classTypeId ?? classTypeIdByCategoryKey.get(categoryKey);
    const current = byCategoryKey.get(categoryKey);
    if (current === undefined) {
      byCategoryKey.set(categoryKey, {
        label,
        classTypeIds: new Set(mappedClassTypeId === undefined ? [] : [mappedClassTypeId]),
      });
      continue;
    }
    if (mappedClassTypeId !== undefined) {
      current.classTypeIds.add(mappedClassTypeId);
    }
  }

  return [...byCategoryKey.entries()]
    .map(([id, option]) => ({
      id,
      label: option.label,
      classTypeIds: [...option.classTypeIds],
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

function resolveSelectedClassTypeIds(
  selectedPackageIds: readonly string[],
  packageOptions: readonly SchedulePackageOption[],
): string[] {
  if (selectedPackageIds.length === 0) {
    return [];
  }
  const selected = new Set(selectedPackageIds);
  const classTypeIds = new Set<string>();
  for (const option of packageOptions) {
    if (!selected.has(option.id)) {
      continue;
    }
    for (const classTypeId of option.classTypeIds) {
      classTypeIds.add(classTypeId);
    }
  }
  return [...classTypeIds];
}

function buildSlugFromClassTypeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
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

async function resolveSessionClassTypeId(
  selectedValue: string,
  options: readonly SessionClassTypeOption[],
): Promise<{ classTypeId: string; created?: AdminScheduleClassType }> {
  const option = options.find((item) => item.value === selectedValue);
  if (option?.classTypeId !== null && option?.classTypeId !== undefined) {
    return { classTypeId: option.classTypeId };
  }
  const name = option?.packageLabel?.trim() ?? "";
  const existing = options.find(
    (item) => item.classTypeId !== null && item.label.toLocaleLowerCase() === name.toLocaleLowerCase(),
  );
  if (existing?.classTypeId !== null && existing?.classTypeId !== undefined) {
    return { classTypeId: existing.classTypeId };
  }
  const slug = buildSlugFromClassTypeName(name);
  if (name.length === 0 || slug.length === 0) {
    throw new Error("Class type is required.");
  }
  const created = await apiFetch<AdminScheduleClassType>("/classes/types", {
    method: "POST",
    body: JSON.stringify({ name, slug }),
  });
  return { classTypeId: created.id, created };
}

export function AdminScheduleManagement({
  locale,
  sessions,
  classTypes: initialClassTypes,
  packages,
  coaches,
  initialView,
  description,
}: Props) {
  const t = useTranslations("adminPages.classes");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState(sessions);
  const [classTypes, setClassTypes] = useState(initialClassTypes);
  const [prevInitialClassTypes, setPrevInitialClassTypes] = useState(initialClassTypes);
  const [view, setView] = useState<ScheduleView>(initialView);
  const [filters, setFilters] = useState<Filters>(() => initialFilters());
  const [quickFilters, setQuickFilters] = useState<ScheduleQuickFilter[]>([]);
  const [searchDraft, setSearchDraft] = useState("");
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
    if (editing === null) {
      return null;
    }
    if (editing.id === "") {
      return { mode: "duplicate" as const, row: editing };
    }
    return { mode: "edit" as const, row: editing };
  }, [addClassOpen, editing]);

  if (prevInitialClassTypes !== initialClassTypes) {
    setPrevInitialClassTypes(initialClassTypes);
    setClassTypes(initialClassTypes);
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setFilters((current) => ({ ...current, q: searchDraft }));
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchDraft]);

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
    () => buildPackageFilterOptions(packages, classTypes),
    [classTypes, packages],
  );

  const validSelectedPackageIds = useMemo(() => {
    const validPackageIds = new Set(packageOptions.map((option) => option.id));
    return filters.typeIds.filter((id) => validPackageIds.has(id));
  }, [filters.typeIds, packageOptions]);

  const selectedClassTypeIds = useMemo(
    () => resolveSelectedClassTypeIds(validSelectedPackageIds, packageOptions),
    [packageOptions, validSelectedPackageIds],
  );

  const sessionClassTypeOptions = useMemo(
    () => buildSessionClassTypeOptions(classTypes, packageOptions),
    [classTypes, packageOptions],
  );

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

  const summary = useMemo(() => {
    const now = new Date();
    return {
      total: filteredRows.length,
      active: filteredRows.filter((row) => row.status === "ACTIVE").length,
      upcoming: filteredRows.filter((row) => new Date(row.startsAt) >= now).length,
      full: filteredRows.filter((row) => spotsLeft(row) === 0).length,
      cancelled: filteredRows.filter((row) => row.status === "CANCELLED").length,
      draft: filteredRows.filter((row) => row.status === "DRAFT").length,
    };
  }, [filteredRows]);

  const sessionCountByTypeId = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of rows) {
      counts[row.classType.id] = (counts[row.classType.id] ?? 0) + 1;
    }
    return counts;
  }, [rows]);

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function resetFilters() {
    setSearchDraft("");
    setFilters(initialFilters());
    setQuickFilters([]);
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

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4">
        <SchedulePageActions onCreate={openAddClassModal} />
        {description ? (
          <p className="ommm-body-muted max-w-3xl text-sm">{description}</p>
        ) : null}
      </div>
      <SummaryGrid summary={summary} />
      <FiltersPanel
        values={filters}
        quickFilters={quickFilters}
        searchDraft={searchDraft}
        selectedPackageIds={validSelectedPackageIds}
        packageOptions={packageOptions}
        coaches={coaches}
        levels={levels}
        onSearch={setSearchDraft}
        onChange={updateFilter}
        onQuickFiltersChange={setQuickFilters}
        onReset={resetFilters}
      />
      <ViewToolbar view={view} onView={updateView} />
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
        rows={filteredRows}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
        onDetails={setDetails}
        onEdit={setEditing}
        busyId={busyId}
        onCancel={(row) => {
          if (window.confirm(t("confirmCancel"))) {
            void runRowAction(row, () => apiFetch(`/classes/sessions/${row.id}/status`, { method: "POST", body: JSON.stringify({ status: "CANCELLED" }) }), t("messages.cancelSuccess"));
          }
        }}
        onActivate={(row) => {
          if (window.confirm(t("confirmActivate"))) {
            void runRowAction(row, () => apiFetch(`/classes/sessions/${row.id}/status`, { method: "POST", body: JSON.stringify({ status: "ACTIVE" }) }), t("messages.activateSuccess"));
          }
        }}
        onDelete={(row) => {
          if (window.confirm(t("deleteConfirm"))) {
            void runRowAction(row, async () => {
              await apiFetch(`/classes/sessions/${row.id}`, { method: "DELETE" });
              setRows((current) => current.filter((item) => item.id !== row.id));
            }, t("messages.deleteSuccess"));
          }
        }}
        onDuplicate={(row) => setEditing({ ...row, id: "" })}
      />
      {sessionModalConfig ? (
        <SessionModal
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
                    slug: buildSlugFromClassTypeName(type.name),
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
      {details ? <DetailsDrawer locale={locale} row={details} onClose={() => setDetails(null)} /> : null}
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

function ScheduleFilterField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 text-xs text-sage-700">
      <span>{label}</span>
      {children}
    </div>
  );
}

function FiltersPanel(props: {
  values: Filters;
  quickFilters: ScheduleQuickFilter[];
  searchDraft: string;
  selectedPackageIds: readonly string[];
  packageOptions: readonly SchedulePackageOption[];
  coaches: readonly AdminScheduleCoach[];
  levels: readonly string[];
  onSearch: (value: string) => void;
  onChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  onQuickFiltersChange: (value: ScheduleQuickFilter[]) => void;
  onReset: () => void;
}) {
  const t = useTranslations("adminPages.classes");
  const activeCount = countActiveFilters(props.values, props.quickFilters);
  const scheduleMultiSelectProps = {
    wrapLabel: true,
    formatSelectedCount: (count: number) => t("filters.selectedCount", { count }),
  };
  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 p-3">
      <div className="flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ScheduleFilterField label={t("filters.searchLabel")}>
            <input
              className="ommm-input h-10"
              value={props.searchDraft}
              placeholder={t("filters.searchPlaceholder")}
              onChange={(event) => props.onSearch(event.target.value)}
              aria-label={t("filters.searchLabel")}
            />
          </ScheduleFilterField>
          <ScheduleFilterField label={t("filters.fromDateLabel")}>
            <DatePickerInput
              name="from"
              value={props.values.from}
              onChange={(value) => props.onChange("from", value)}
              placeholder={t("filters.fromDateLabel")}
              ariaLabel={t("filters.fromDateLabel")}
            />
          </ScheduleFilterField>
          <ScheduleFilterField label={t("filters.toDateLabel")}>
            <DatePickerInput
              name="to"
              value={props.values.to}
              onChange={(value) => props.onChange("to", value)}
              placeholder={t("filters.toDateLabel")}
              ariaLabel={t("filters.toDateLabel")}
            />
          </ScheduleFilterField>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          <ScheduleFilterField label={t("filters.coachLabel")}>
            <OmmFilterMultiSelect
              {...scheduleMultiSelectProps}
              ariaLabel={t("filters.coachLabel")}
              allLabel={t("filters.allCoaches")}
              selectedValues={props.values.coachIds}
              onChange={(value) => props.onChange("coachIds", value)}
              options={props.coaches.map((coach) => ({ value: coach.id, label: coachName(coach) }))}
            />
          </ScheduleFilterField>
          <ScheduleFilterField label={t("filters.typeLabel")}>
            <OmmFilterMultiSelect
              {...scheduleMultiSelectProps}
              ariaLabel={t("filters.typeLabel")}
              allLabel={t("filters.allTypes")}
              selectedValues={props.selectedPackageIds}
              onChange={(value) => props.onChange("typeIds", value)}
              options={props.packageOptions.map((option) => ({
                value: option.id,
                label: option.label,
              }))}
            />
          </ScheduleFilterField>
          <ScheduleFilterField label={t("filters.levelLabel")}>
            <OmmFilterMultiSelect
              {...scheduleMultiSelectProps}
              ariaLabel={t("filters.levelLabel")}
              allLabel={t("filters.allLevels")}
              selectedValues={props.values.levels}
              onChange={(value) => props.onChange("levels", value)}
              options={props.levels.map((level) => ({ value: level, label: level }))}
            />
          </ScheduleFilterField>
          <ScheduleFilterField label={t("filters.statusLabel")}>
            <OmmFilterMultiSelect
              {...scheduleMultiSelectProps}
              ariaLabel={t("filters.statusLabel")}
              allLabel={t("filters.allStatuses")}
              selectedValues={props.values.statuses}
              onChange={(value) => props.onChange("statuses", value as SessionStatus[])}
              options={STATUS_OPTIONS.map((status) => ({ value: status, label: t(`status.${status}`) }))}
            />
          </ScheduleFilterField>
          <ScheduleFilterField label={t("filters.availabilityLabel")}>
            <OmmFilterMultiSelect
              {...scheduleMultiSelectProps}
              ariaLabel={t("filters.availabilityLabel")}
              allLabel={t("filters.allAvailability")}
              selectedValues={props.values.availability}
              onChange={(value) => props.onChange("availability", value as AvailabilityOption[])}
              options={[
                { value: "available", label: t("filters.availableOnly") },
                { value: "full", label: t("filters.fullOnly") },
              ]}
            />
          </ScheduleFilterField>
          <ScheduleFilterField label={t("filters.timeOfDayLabel")}>
            <OmmFilterMultiSelect
              {...scheduleMultiSelectProps}
              ariaLabel={t("filters.timeOfDayLabel")}
              allLabel={t("filters.allTimes")}
              selectedValues={props.values.timeOfDay}
              onChange={(value) => props.onChange("timeOfDay", value as TimeOfDayOption[])}
              options={[
                { value: "morning", label: t("filters.morning") },
                { value: "afternoon", label: t("filters.afternoon") },
                { value: "evening", label: t("filters.evening") },
              ]}
            />
          </ScheduleFilterField>
        </div>
      </div>
      <QuickFilters
        selected={props.quickFilters}
        onChange={props.onQuickFiltersChange}
        onReset={props.onReset}
        activeCount={activeCount}
      />
    </div>
  );
}

function QuickFilters({
  selected,
  onChange,
  onReset,
  activeCount,
}: {
  selected: ScheduleQuickFilter[];
  onChange: (value: ScheduleQuickFilter[]) => void;
  onReset: () => void;
  activeCount: number;
}) {
  const t = useTranslations("adminPages.classes");
  const quickOptions = useMemo(
    () =>
      SCHEDULE_QUICK_FILTER_VALUES.map((value) => ({
        value,
        label: t(`quick.${value}`),
      })),
    [t],
  );

  return (
    <div className="mt-3 border-t border-sage-700/10 pt-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="flex w-full min-w-[14rem] max-w-sm shrink-0 flex-col gap-1">
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.08em] text-[#92907e]">
            <QuickFilterGlyph className="h-3.5 w-3.5 shrink-0 text-[#92907e]" />
            {t("filters.quickFilterLabel")}
          </span>
          <OmmFilterMultiSelect
            variant="accent"
            wrapLabel
            ariaLabel={t("filters.quickFilterLabel")}
            allLabel={t("filters.allQuickFilters")}
            selectedValues={selected}
            onChange={(value) => onChange(value as ScheduleQuickFilter[])}
            formatSelectedCount={(count) => t("filters.selectedCount", { count })}
            options={quickOptions}
          />
        </div>
        <AdminFilterResetBar
          onReset={onReset}
          label={t("filters.reset")}
          meta={
            <p className="whitespace-nowrap text-xs text-sage-600">
              {t("filters.activeCount", { count: activeCount })}
            </p>
          }
        />
      </div>
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

function CalendarGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  );
}

function ListGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className={className} aria-hidden>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

const SCHEDULE_TOOLBAR_BTN_BASE =
  "inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-700/30";

const SCHEDULE_TOOLBAR_BTN_IDLE =
  "border-white/70 bg-white/70 text-sage-700 hover:-translate-y-0.5 hover:bg-white hover:text-sage-900";

const SCHEDULE_TOOLBAR_BTN_ACTIVE =
  "border-sage-700/15 bg-sage-800 text-white shadow-[0_14px_30px_-20px_rgba(45,40,35,0.55)]";

function SchedulePageActions({ onCreate }: { onCreate: () => void }) {
  const t = useTranslations("adminPages.classes");
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <OmmButton
        type="button"
        variant="secondary"
        size="md"
        onClick={onCreate}
        className="inline-flex h-11 min-w-[11rem] items-center justify-center gap-2 rounded-full"
      >
        <PlusIcon className="h-5 w-5 shrink-0" />
        {t("addClassButton")}
      </OmmButton>
    </div>
  );
}

function ViewToolbar({
  view,
  onView,
}: {
  view: ScheduleView;
  onView: (view: ScheduleView) => void;
}) {
  const t = useTranslations("adminPages.classes");
  const options: readonly ScheduleView[] = ["list", "monthly", "weekly", "daily"];
  return (
    <div className="rounded-[28px] border border-white/70 bg-white/55 p-3 shadow-[0_18px_44px_-28px_rgba(45,40,35,0.32)] backdrop-blur-md">
      <div className="grid gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap" role="tablist" aria-label={t("views.aria")}>
        {options.map((next) => (
          <button
            key={next}
            type="button"
            role="tab"
            aria-selected={view === next}
            onClick={() => onView(next)}
            className={`group ${SCHEDULE_TOOLBAR_BTN_BASE} ${
              view === next ? SCHEDULE_TOOLBAR_BTN_ACTIVE : SCHEDULE_TOOLBAR_BTN_IDLE
            }`}
          >
            {next === "list" ? <ListGlyph className="h-4 w-4 shrink-0" /> : <CalendarGlyph className="h-4 w-4 shrink-0" />}
            {t(`views.${next}`)}
          </button>
        ))}
      </div>
    </div>
  );
}

function ScheduleViews(props: {
  locale: string;
  view: ScheduleView;
  rows: AdminScheduleSession[];
  selectedDay: string;
  busyId: string | null;
  onSelectDay: (day: string) => void;
  onDetails: (row: AdminScheduleSession) => void;
  onEdit: (row: AdminScheduleSession) => void;
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
    return <div className={adminChrome.panel}><p className="font-medium text-sage-900">{t("empty.filteredTitle")}</p><p className="mt-1 text-sm text-sage-600">{t("empty.filteredBody")}</p></div>;
  }
  return (
    <div className={scheduleTable.wrap}>
      <table className={scheduleTable.table}>
        <colgroup>
          <col className="w-[16%]" />
          <col className="w-[12%]" />
          <col className="w-[9%]" />
          <col className="w-[10%]" />
          <col className="w-[9%]" />
          <col className="w-[9%]" />
          <col className="w-[9%]" />
          <col className="w-[9%]" />
          <col className="w-[8%]" />
          <col className="w-[9%]" />
        </colgroup>
        <thead className={adminChrome.thead}>
          <tr>
            <th className={scheduleTable.th}>{t("colClass")}</th>
            <th className={scheduleTable.th}>{t("colType")}</th>
            <th className={scheduleTable.th}>{t("colDate")}</th>
            <th className={scheduleTable.th}>{t("colTime")}</th>
            <th className={scheduleTable.thGroupCenter}>{t("fields.duration")}</th>
            <th className={scheduleTable.thGroup}>{t("colCoach")}</th>
            <th className={scheduleTable.thGroupCenter}>{t("colCapacity")}</th>
            <th className={scheduleTable.th}>{t("colLevel")}</th>
            <th className={scheduleTable.thCompact}>{t("colStatus")}</th>
            <th className={scheduleTable.thActions}>{t("colActions")}</th>
          </tr>
        </thead>
        <tbody>{rows.map((row) => <SessionRow key={row.id} row={row} {...props} />)}</tbody>
      </table>
    </div>
  );
}

function SessionRow({ row, locale, busyId, onDetails, onEdit, onCancel, onActivate, onDelete, onDuplicate }: { row: AdminScheduleSession; locale: string; busyId: string | null; onDetails: (row: AdminScheduleSession) => void; onEdit: (row: AdminScheduleSession) => void; onCancel: (row: AdminScheduleSession) => void; onActivate: (row: AdminScheduleSession) => void; onDelete: (row: AdminScheduleSession) => void; onDuplicate: (row: AdminScheduleSession) => void }) {
  const t = useTranslations("adminPages.classes");
  const busy = busyId === row.id;
  const times = formatSessionTimes(locale, row.startsAt, row.endsAt);
  const classFormat = row.classFormat?.trim();

  return (
    <tr className={scheduleTable.row}>
      <td className={scheduleTable.tdPrimary}>
        <button
          type="button"
          className="block max-w-full truncate text-left underline-offset-2 hover:underline"
          title={row.title}
          onClick={() => onDetails(row)}
        >
          {row.title}
        </button>
      </td>
      <td className={scheduleTable.td}>
        <span className="block truncate font-medium text-sage-800" title={row.classType.name}>
          {row.classType.name}
        </span>
        {classFormat ? (
          <span className={`${adminChrome.metaText} block truncate`} title={classFormat}>
            {classFormat}
          </span>
        ) : null}
      </td>
      <td className={scheduleTable.td}>
        <span className="block whitespace-nowrap tabular-nums">{formatDateForUi(row.startsAt)}</span>
      </td>
      <td className={scheduleTable.td}>
        <span className="block whitespace-nowrap tabular-nums">{times.start}</span>
        <span className="block whitespace-nowrap tabular-nums text-xs text-sage-500">{times.end}</span>
      </td>
      <td className={scheduleTable.tdGroupCenter}>{durationMinutes(row)}m</td>
      <td className={scheduleTable.tdGroup}>
        <span className="block truncate" title={coachName(row.coach)}>
          {coachName(row.coach)}
        </span>
      </td>
      <td className={scheduleTable.tdGroupCenter}>
        <span className="block font-medium tabular-nums">
          {row._count.bookings}/{row.capacity}
        </span>
        <span className={`${adminChrome.metaText} block`}>
          {t("fields.spotsLeft", { count: spotsLeft(row) })}
        </span>
      </td>
      <td className={scheduleTable.tdMuted}>
        <span className="block whitespace-normal break-words">{row.level ?? "—"}</span>
      </td>
      <td className={scheduleTable.tdCompact}>
        <div className="flex justify-center">
          <Badge
            label={t(`status.${row.status}`)}
            tone={row.status === "CANCELLED" ? "sand" : row.status === "ACTIVE" ? "mint" : "slate"}
          />
        </div>
      </td>
      <td className={scheduleTable.tdActions}>
        <div className="flex items-center justify-center">
          <AdminScheduleSessionActions
            row={row}
            busy={busy}
            includeDelete
            onDetails={onDetails}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onCancel={onCancel}
            onActivate={onActivate}
            onDelete={onDelete}
          />
        </div>
      </td>
    </tr>
  );
}

function Badge({ label, tone }: { label: string; tone: "slate" | "sand" | "mint" }) {
  const classes = tone === "mint" ? "border-mint-200 bg-mint-50 text-sage-900" : tone === "sand" ? "border-sand-300 bg-sand-50 text-sage-900" : "border-zinc-200 bg-zinc-50 text-zinc-800";
  return (
    <span className={`inline-flex shrink-0 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium leading-tight ${classes}`}>
      {label}
    </span>
  );
}

function SessionAgendaCard({ row, locale, busyId, onDetails, onEdit, onCancel, onActivate, onDuplicate }: { row: AdminScheduleSession; locale: string; busyId: string | null; onDetails: (row: AdminScheduleSession) => void; onEdit: (row: AdminScheduleSession) => void; onCancel: (row: AdminScheduleSession) => void; onActivate: (row: AdminScheduleSession) => void; onDuplicate: (row: AdminScheduleSession) => void }) {
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
        <Badge label={t(`status.${row.status}`)} tone={row.status === "CANCELLED" ? "sand" : row.status === "ACTIVE" ? "mint" : "slate"} />
      </div>
      <div className="mt-4 flex justify-end">
        <AdminScheduleSessionActions
          row={row}
          busy={busy}
          onDetails={onDetails}
          onEdit={onEdit}
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
              <SessionAgendaCard key={row.id} row={row} locale={props.locale} busyId={props.busyId} onDetails={props.onDetails} onEdit={props.onEdit} onCancel={props.onCancel} onActivate={props.onActivate} onDuplicate={props.onDuplicate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SessionModal({
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
    <OmmModalPortal
      isOpen={isOpen}
      onClose={onClose}
      backdropAriaLabel={t("modalBackdropClose")}
      closeDisabled={pending}
      panelClassName="max-w-2xl rounded-t-[28px] border border-white/60 bg-white p-5 shadow-xl sm:rounded-[24px]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className={adminChrome.panelHeading}>
            {mode === "create"
              ? t("createTitle")
              : mode === "duplicate"
                ? t("duplicateTitle")
                : t("editTitle")}
          </h2>
          <p className="ommm-body-muted mt-1 text-sm">
            {mode === "duplicate"
              ? t("duplicateDescription")
              : mode === "create"
                ? t("createDescription")
                : t("editDescription")}
          </p>
        </div>
        <button
          className="rounded-full p-2 text-sage-500 hover:bg-sand-50"
          onClick={onClose}
          aria-label={t("modalCloseAria")}
          type="button"
        >
          x
        </button>
      </div>
      <form className="mt-5 grid gap-3 sm:grid-cols-2" onSubmit={(event) => { void submit(event); }}>
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
        <div className="flex justify-end gap-2 sm:col-span-2">
          <OmmButton type="button" size="sm" variant="ghost" onClick={onClose} disabled={pending}>
            {t("cancelButton")}
          </OmmButton>
          <OmmButton type="submit" size="sm" variant="primary" disabled={pending}>
            {pending ? t("savingButton") : mode === "create" ? t("createButton") : t("saveButton")}
          </OmmButton>
        </div>
      </form>
    </OmmModalPortal>
  );
}

function DetailsDrawer({
  locale,
  row,
  onClose,
}: {
  locale: string;
  row: AdminScheduleSession;
  onClose: () => void;
}) {
  const t = useTranslations("adminPages.classes");
  return (
    <OmmDrawerPortal isOpen onClose={onClose} backdropAriaLabel={t("modalCloseAria")}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-sage-900">{row.title}</h3>
        <button
          type="button"
          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-sage-500 transition-[background-color,color,transform] hover:bg-sand-50 hover:text-sage-900 active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500/40 focus-visible:ring-offset-2"
          onClick={onClose}
        >
          x
        </button>
      </div>
      <div className="space-y-3 text-sm text-sage-700">
        <p>
          <span className="text-sage-500">{t("colType")}:</span> {row.classType.name}
        </p>
        <p>
          <span className="text-sage-500">{t("colDate")}:</span> {formatDateTimeForUi(row.startsAt, locale)}
        </p>
        <p>
          <span className="text-sage-500">{t("form.endTime")}:</span>{" "}
          {formatDateTimeForUi(row.endsAt, locale)}
        </p>
        <p>
          <span className="text-sage-500">{t("fields.duration")}:</span> {durationMinutes(row)}m
        </p>
        <p>
          <span className="text-sage-500">{t("colCoach")}:</span> {coachName(row.coach)}
        </p>
        <p>
          <span className="text-sage-500">{t("colCapacity")}:</span> {row._count.bookings}/{row.capacity}{" "}
          · {t("fields.spotsLeft", { count: spotsLeft(row) })}
        </p>
        <p>
          <span className="text-sage-500">{t("colLevel")}:</span> {row.level ?? "—"}
        </p>
        <p>
          <span className="text-sage-500">{t("colStatus")}:</span> {t(`status.${row.status}`)}
        </p>
        {row.description ? (
          <p>
            <span className="text-sage-500">{t("form.description")}:</span> {row.description}
          </p>
        ) : null}
      </div>
    </OmmDrawerPortal>
  );
}
