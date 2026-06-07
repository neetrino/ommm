import { startOfLocalDay } from "@/components/marketing/schedule/schedule-date-utils";
import type { IntegratedFilterField } from "@/components/shared/search/integrated-search-filter-types";

function toLocalIsoDate(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function scheduleTodayIsoDate(): string {
  return toLocalIsoDate(startOfLocalDay(new Date()));
}

function scheduleSessionLocalIsoDay(startsAt: string): string {
  return toLocalIsoDate(new Date(startsAt));
}

export const DATE_SORT_ORDERS = ["newest", "oldest"] as const;
export type DateSortOrder = (typeof DATE_SORT_ORDERS)[number];

export const SESSION_SORT_ORDERS = ["upcoming", "date-asc", "date-desc"] as const;
export type SessionSortOrder = (typeof SESSION_SORT_ORDERS)[number];

export const BOOKING_MANAGEMENT_SORT_ORDERS = [
  "upcoming",
  "date-asc",
  "date-desc",
  "newest",
  "oldest",
] as const;
export type BookingManagementSortOrder = (typeof BOOKING_MANAGEMENT_SORT_ORDERS)[number];

export const USER_GIFT_CARD_SORT_ORDERS = ["newest", "oldest", "expirationSoon"] as const;
export type UserGiftCardSortOrder = (typeof USER_GIFT_CARD_SORT_ORDERS)[number];

export const USER_PACKAGE_SORT_ORDERS = ["upcoming", "newest", "oldest"] as const;
export type UserPackageSortOrder = (typeof USER_PACKAGE_SORT_ORDERS)[number];

export function parseDateSortOrder(
  value: string | undefined | null,
  fallback: DateSortOrder = "newest",
): DateSortOrder {
  return DATE_SORT_ORDERS.includes(value as DateSortOrder)
    ? (value as DateSortOrder)
    : fallback;
}

export function parseSessionSortOrder(
  value: string | undefined | null,
  fallback: SessionSortOrder = "upcoming",
): SessionSortOrder {
  return SESSION_SORT_ORDERS.includes(value as SessionSortOrder)
    ? (value as SessionSortOrder)
    : fallback;
}

export function parseBookingManagementSortOrder(
  value: string | undefined | null,
  fallback: BookingManagementSortOrder = "upcoming",
): BookingManagementSortOrder {
  return BOOKING_MANAGEMENT_SORT_ORDERS.includes(value as BookingManagementSortOrder)
    ? (value as BookingManagementSortOrder)
    : fallback;
}

export function parseUserGiftCardSortOrder(
  value: string | undefined | null,
  fallback: UserGiftCardSortOrder = "newest",
): UserGiftCardSortOrder {
  return USER_GIFT_CARD_SORT_ORDERS.includes(value as UserGiftCardSortOrder)
    ? (value as UserGiftCardSortOrder)
    : fallback;
}

export function parseUserPackageSortOrder(
  value: string | undefined | null,
  fallback: UserPackageSortOrder = "upcoming",
): UserPackageSortOrder {
  return USER_PACKAGE_SORT_ORDERS.includes(value as UserPackageSortOrder)
    ? (value as UserPackageSortOrder)
    : fallback;
}

export function compareIsoDateStrings(
  left: string,
  right: string,
  order: DateSortOrder,
): number {
  const diff = left.localeCompare(right);
  return order === "oldest" ? diff : -diff;
}

export function compareSessionStartsAt(
  left: string,
  right: string,
  order: SessionSortOrder,
): number {
  if (order === "date-desc") {
    return right.localeCompare(left);
  }
  if (order === "date-asc") {
    return left.localeCompare(right);
  }
  const todayKey = scheduleTodayIsoDate();
  const leftDay = scheduleSessionLocalIsoDay(left);
  const rightDay = scheduleSessionLocalIsoDay(right);
  const leftIsPast = leftDay < todayKey;
  const rightIsPast = rightDay < todayKey;
  if (leftIsPast !== rightIsPast) {
    return leftIsPast ? 1 : -1;
  }
  return left.localeCompare(right);
}

export function sortBySessionStartsAt<T>(
  rows: readonly T[],
  getStartsAt: (row: T) => string,
  order: SessionSortOrder,
): T[] {
  return [...rows].sort((left, right) =>
    compareSessionStartsAt(getStartsAt(left), getStartsAt(right), order),
  );
}

export function sortByIsoDate<T>(
  rows: readonly T[],
  getDate: (row: T) => string,
  order: DateSortOrder,
): T[] {
  return [...rows].sort((left, right) =>
    compareIsoDateStrings(getDate(left), getDate(right), order),
  );
}

export function sortBookingManagementRows<
  T extends { session: { startsAt: string }; registerDate: string },
>(rows: readonly T[], order: BookingManagementSortOrder): T[] {
  const copy = [...rows];
  copy.sort((left, right) => {
    if (order === "newest" || order === "oldest") {
      return compareIsoDateStrings(left.registerDate, right.registerDate, order);
    }
    return compareSessionStartsAt(
      left.session.startsAt,
      right.session.startsAt,
      order === "date-desc" ? "date-desc" : order === "date-asc" ? "date-asc" : "upcoming",
    );
  });
  return copy;
}

export function sortUserGiftCards<
  T extends { createdAt: string; expiresAt: string | null },
>(rows: readonly T[], order: UserGiftCardSortOrder): T[] {
  const copy = [...rows];
  copy.sort((left, right) => {
    switch (order) {
      case "oldest":
        return left.createdAt.localeCompare(right.createdAt);
      case "expirationSoon": {
        const leftTime = left.expiresAt
          ? new Date(left.expiresAt).getTime()
          : Number.POSITIVE_INFINITY;
        const rightTime = right.expiresAt
          ? new Date(right.expiresAt).getTime()
          : Number.POSITIVE_INFINITY;
        return leftTime - rightTime || right.createdAt.localeCompare(left.createdAt);
      }
      case "newest":
      default:
        return right.createdAt.localeCompare(left.createdAt);
    }
  });
  return copy;
}

export function sortUserPackages<
  T extends { currentPeriodStart: string | null; currentPeriodEnd: string | null },
>(rows: readonly T[], order: UserPackageSortOrder): T[] {
  const copy = [...rows];
  copy.sort((left, right) => {
    switch (order) {
      case "oldest":
        return (left.currentPeriodStart ?? "").localeCompare(right.currentPeriodStart ?? "");
      case "newest":
        return (right.currentPeriodStart ?? "").localeCompare(left.currentPeriodStart ?? "");
      case "upcoming":
      default: {
        const leftEnd = left.currentPeriodEnd ?? "9999-12-31T23:59:59.999Z";
        const rightEnd = right.currentPeriodEnd ?? "9999-12-31T23:59:59.999Z";
        return leftEnd.localeCompare(rightEnd);
      }
    }
  });
  return copy;
}

type SortFilterLabels<T extends string> = Record<T, string>;

export function buildDateSortFilterField(
  label: string,
  sortLabels: SortFilterLabels<DateSortOrder>,
): IntegratedFilterField {
  return {
    key: "order",
    label,
    emptyValue: "newest",
    options: DATE_SORT_ORDERS.map((value) => ({
      value,
      label: sortLabels[value],
    })),
  };
}

export function buildSessionSortFilterField(
  label: string,
  sortLabels: SortFilterLabels<SessionSortOrder>,
  emptyValue: SessionSortOrder = "upcoming",
): IntegratedFilterField {
  return {
    key: "order",
    label,
    emptyValue,
    options: SESSION_SORT_ORDERS.map((value) => ({
      value,
      label: sortLabels[value],
    })),
  };
}

export function buildBookingManagementSortFilterField(
  label: string,
  sortLabels: SortFilterLabels<BookingManagementSortOrder>,
): IntegratedFilterField {
  return {
    key: "order",
    label,
    emptyValue: "upcoming",
    options: BOOKING_MANAGEMENT_SORT_ORDERS.map((value) => ({
      value,
      label: sortLabels[value],
    })),
  };
}

export function buildUserGiftCardSortFilterField(
  label: string,
  sortLabels: SortFilterLabels<UserGiftCardSortOrder>,
): IntegratedFilterField {
  return {
    key: "order",
    label,
    emptyValue: "newest",
    options: USER_GIFT_CARD_SORT_ORDERS.map((value) => ({
      value,
      label: sortLabels[value],
    })),
  };
}

export function buildUserPackageSortFilterField(
  label: string,
  sortLabels: SortFilterLabels<UserPackageSortOrder>,
): IntegratedFilterField {
  return {
    key: "order",
    label,
    emptyValue: "upcoming",
    options: USER_PACKAGE_SORT_ORDERS.map((value) => ({
      value,
      label: sortLabels[value],
    })),
  };
}

export function sortAdminSessionRows<T extends { startsAt: string }>(
  rows: readonly T[],
  order: SessionSortOrder,
): T[] {
  return [...rows].sort((left, right) =>
    compareSessionStartsAt(left.startsAt, right.startsAt, order),
  );
}
