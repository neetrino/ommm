import type { BookingsView } from "@/components/admin/admin-bookings-view";
import { buildScheduleWeekDayKeys } from "@/components/shared/schedule/schedule-week-view-utils";
import { normalizeFilterDateValue } from "@/lib/filter-date-display";
import {
  ADMIN_BOOKING_PAYMENT_FILTER_VALUES,
  type AdminBookingPaymentStatus,
} from "@/components/admin/admin-booking-list-badges";
import { parseListPageParams } from "@/lib/list-pagination";

export const ADMIN_BOOKINGS_BOOKING_ID_QUERY_KEY = "bookingId";

export const ADMIN_BOOKINGS_ACTION_QUERY_KEY = "action";

export const ADMIN_BOOKINGS_MOVE_ACTION = "move";

export const ADMIN_BOOKINGS_FILTER_KEYS = [
  "search",
  "from",
  "to",
  "classTypeId",
  "coachId",
  "status",
  "paymentStatus",
] as const;

export type AdminBookingsFilterState = {
  search: string;
  from: string;
  to: string;
  classTypeId: string;
  coachId: string;
  status: string;
  paymentStatus: AdminBookingPaymentStatus | "";
};

export function parseAdminBookingPaymentFilter(
  value: string | undefined | null,
): AdminBookingPaymentStatus | "" {
  if (!value) {
    return "";
  }
  const normalized = value.toUpperCase();
  return ADMIN_BOOKING_PAYMENT_FILTER_VALUES.includes(normalized as AdminBookingPaymentStatus)
    ? (normalized as AdminBookingPaymentStatus)
    : "";
}

export type AdminBookingSessionSlot = {
  id: string;
  title: string;
  status: "DRAFT" | "ACTIVE" | "FULL" | "FINISHED" | "CANCELLED";
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
  paymentStatus: "PAID" | "CASH" | "UNPAID" | "CANCELLED";
  bookingPaymentMethod: string | null;
  channel: "WEBSITE" | "APP";
  guestName?: string | null;
  guestPassSlot?: number;
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
  status: "",
  paymentStatus: "",
};

function isoDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Same scrollable window as schedule week board (past days through today + next six). */
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
    status: search.status ?? "",
    paymentStatus: parseAdminBookingPaymentFilter(search.paymentStatus),
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
  if (filters.status) {
    params.set("status", filters.status);
  }
  if (filters.paymentStatus) {
    params.set("paymentStatus", filters.paymentStatus);
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

export function bookingRowKey(row: Pick<AdminBookingRow, "id" | "recordType">): string {
  return `${row.recordType}-${row.id}`;
}

export function parseBookingRowKey(
  key: string,
): { recordType: AdminBookingRow["recordType"]; id: string } | null {
  const match = /^(BOOKING|WAITLIST)-(.+)$/.exec(key);
  if (match === null) {
    return null;
  }
  return {
    recordType: match[1] as AdminBookingRow["recordType"],
    id: match[2],
  };
}

export type AdminBookingDetailPayload = {
  id: string;
  status: AdminBookingRow["status"];
  channel: AdminBookingRow["channel"];
  createdAt: string;
  paymentStatus: AdminBookingRow["paymentStatus"];
  bookingPaymentMethod: AdminBookingRow["bookingPaymentMethod"];
  attendanceStatus: AdminBookingRow["attendanceStatus"];
  user: AdminBookingRow["user"];
  session: {
    id: string;
    startsAt: string;
    endsAt: string;
    classType: { id: string; name: string };
    coach: { id: string; user: { name: string | null } };
  };
  notes?: Array<{
    id: string;
    body: string;
    createdAt: string;
    author: { name: string | null };
  }>;
};

/** Maps admin booking detail API payload to a management list row. */
export function mapAdminBookingDetailToRow(payload: AdminBookingDetailPayload): AdminBookingRow {
  return {
    id: payload.id,
    recordType: "BOOKING",
    status: payload.status,
    attendanceStatus: payload.attendanceStatus,
    paymentStatus: payload.paymentStatus,
    bookingPaymentMethod: payload.bookingPaymentMethod ?? null,
    channel: payload.channel,
    registerDate: payload.createdAt,
    user: payload.user,
    session: {
      id: payload.session.id,
      startsAt: payload.session.startsAt,
      endsAt: payload.session.endsAt,
      classType: payload.session.classType,
      coach: {
        id: payload.session.coach.id,
        name: payload.session.coach.user.name,
      },
    },
    package: null,
    latestNote:
      payload.notes?.[0] === undefined
        ? null
        : {
            id: payload.notes[0].id,
            body: payload.notes[0].body,
            authorName: payload.notes[0].author.name,
            createdAt: payload.notes[0].createdAt,
          },
  };
}

/** Placeholder row so the detail sheet can open while list data is still resolving. */
export function buildLoadingBookingRow(key: string): AdminBookingRow | null {
  const parsed = parseBookingRowKey(key);
  if (parsed === null) {
    return null;
  }

  const now = new Date().toISOString();
  return {
    id: parsed.id,
    recordType: parsed.recordType,
    status: "BOOKED",
    attendanceStatus: null,
    paymentStatus: "UNPAID",
    bookingPaymentMethod: null,
    channel: "WEBSITE",
    registerDate: now,
    user: { id: "", name: null, email: "…", phone: null },
    session: {
      id: "",
      startsAt: now,
      endsAt: now,
      classType: { id: "", name: "…" },
      coach: { id: "", name: null },
    },
    package: null,
    latestNote: null,
  };
}
