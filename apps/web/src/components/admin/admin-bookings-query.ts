import type { BookingsView } from "@/components/admin/admin-bookings-view";
import { buildScheduleWeekDayKeys } from "@/components/shared/schedule/schedule-week-view-utils";
import { normalizeFilterDateValue } from "@/lib/filter-date-display";
import { parseListPageParams } from "@/lib/list-pagination";

export const ADMIN_BOOKINGS_FILTER_KEYS = [
  "search",
  "from",
  "to",
  "classTypeId",
  "coachId",
  "clientId",
  "status",
] as const;

export type AdminBookingsFilterState = {
  search: string;
  from: string;
  to: string;
  classTypeId: string;
  coachId: string;
  clientId: string;
  status: string;
};

export type AdminBookingSessionSlot = {
  id: string;
  title: string;
  status: "DRAFT" | "ACTIVE" | "FULL" | "CANCELLED";
  startsAt: string;
  endsAt: string;
  capacity: number;
  bookedCount: number;
  spotsLeft: number;
  level: string | null;
  classFormat: string | null;
  classType: { id: string; name: string };
  coach: { id: string; name: string | null };
};

export type AdminBookingRow = {
  id: string;
  recordType: "BOOKING" | "WAITLIST";
  status: "BOOKED" | "COMPLETED" | "CANCELLED" | "MISSED" | "WAITLISTED";
  attendanceStatus: "ATTENDED" | "NOT_ATTENDED" | "NO_SHOW" | "LATE_CANCEL" | null;
  paymentStatus: "PAID" | "CASH" | "UNPAID" | "REFUNDED";
  channel: "WEBSITE" | "APP";
  registerDate: string;
  user: { id: string; name: string | null; email: string; phone: string | null };
  session: {
    id: string;
    startsAt: string;
    endsAt: string;
    classType: { id: string; name: string };
    coach: { id: string; name: string | null };
  };
  package: {
    planName: string;
    sessionsRemaining: number | null;
    sessionsPerMonth: number | null;
    isUnlimited: boolean;
  } | null;
  latestNote: {
    id: string;
    body: string;
    authorName: string | null;
    createdAt: string;
  } | null;
  waitlistPosition?: number;
};

export type AdminBookingsManagementPayload = {
  rows: AdminBookingRow[];
  summary: {
    total: number;
    booked: number;
    completed: number;
    cancelled: number;
    waitlisted: number;
    today: number;
  };
  pagination?: {
    total: number;
    take: number;
    offset: number;
  };
  filterOptions: {
    classTypes: Array<{ id: string; name: string }>;
    coaches: Array<{ id: string; name: string }>;
  };
  sessionSlots: AdminBookingSessionSlot[];
};

export const defaultAdminBookingsFilters: AdminBookingsFilterState = {
  search: "",
  from: "",
  to: "",
  classTypeId: "",
  coachId: "",
  clientId: "",
  status: "",
};

function isoDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Same rolling window as schedule week board: today plus the next three days. */
export function resolveAdminBookingsCalendarRange(): { from: string; to: string } {
  const dayKeys = buildScheduleWeekDayKeys();
  const from = dayKeys[0];
  const to = dayKeys[dayKeys.length - 1];
  if (!from || !to) {
    const today = isoDateLocal(new Date());
    return { from: today, to: today };
  }
  return { from, to };
}

export function isCalendarBookingsView(view: BookingsView): view is "weekly" {
  return view === "weekly";
}

export const MANAGER_BOOKINGS_WINDOW_PAST_DAYS = 7;
export const MANAGER_BOOKINGS_WINDOW_FUTURE_DAYS = 30;

export function resolveManagerBookingsInitialFilters(
  search: Record<string, string | undefined>,
): AdminBookingsFilterState {
  const picked = pickAdminBookingsInitialFilters(search);
  if (picked.from.length > 0 && picked.to.length > 0) {
    return picked;
  }
  const from = new Date();
  from.setDate(from.getDate() - MANAGER_BOOKINGS_WINDOW_PAST_DAYS);
  const to = new Date();
  to.setDate(to.getDate() + MANAGER_BOOKINGS_WINDOW_FUTURE_DAYS);
  return normalizeBookingsFilterDates({
    ...picked,
    from: picked.from || isoDateLocal(from),
    to: picked.to || isoDateLocal(to),
  });
}

function normalizeBookingsFilterDates(
  filters: AdminBookingsFilterState,
): AdminBookingsFilterState {
  return {
    ...filters,
    from: normalizeFilterDateValue(filters.from),
    to: normalizeFilterDateValue(filters.to),
  };
}

export function pickAdminBookingsInitialFilters(
  search: Record<string, string | undefined>,
): AdminBookingsFilterState {
  return normalizeBookingsFilterDates({
    search: search.search?.trim() ?? "",
    from: search.from ?? "",
    to: search.to ?? "",
    classTypeId: search.classTypeId ?? "",
    coachId: search.coachId ?? "",
    clientId: search.clientId ?? "",
    status: search.status ?? "",
  });
}

function appendFilterParams(
  params: URLSearchParams,
  filters: AdminBookingsFilterState,
  dateRange?: { from: string; to: string },
): void {
  const q = filters.search.trim();
  if (q.length > 0) {
    params.set("q", q);
  }
  const from = dateRange?.from ?? filters.from;
  const to = dateRange?.to ?? filters.to;
  if (from) {
    params.set("from", from);
  }
  if (to) {
    params.set("to", to);
  }
  if (filters.classTypeId) {
    params.set("classTypeId", filters.classTypeId);
  }
  if (filters.coachId) {
    params.set("coachId", filters.coachId);
  }
  if (filters.clientId) {
    params.set("userId", filters.clientId);
  }
  if (filters.status) {
    params.set("status", filters.status);
  }
}

export function buildAdminBookingsListEndpoint(
  filters: AdminBookingsFilterState,
  listPage: ReturnType<typeof parseListPageParams>,
): string {
  const params = new URLSearchParams();
  appendFilterParams(params, filters);
  params.set("take", String(listPage.take));
  params.set("offset", String(listPage.offset));
  return `/bookings/admin/management?${params.toString()}`;
}

export function buildAdminBookingsCalendarEndpoint(
  filters: AdminBookingsFilterState,
  calendarRange: { from: string; to: string },
): string {
  const params = new URLSearchParams();
  appendFilterParams(params, filters, calendarRange);
  return `/bookings/admin/management?${params.toString()}`;
}
