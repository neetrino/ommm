import type { AdminIntegratedFilterField } from "@/components/admin/admin-integrated-search-filter-types";
import {
  ADMIN_BOOKING_PAYMENT_FILTER_VALUES,
  type AdminBookingPaymentStatus,
} from "@/components/admin/admin-booking-list-badges";
import { formatFilterDateChipLabel } from "@/lib/filter-date-display";
import { endOfStudioDayInclusive, studioWallClockToUtc } from "@/lib/studio-timezone";

type BookingFilterOptions = {
  classTypes: Array<{ id: string; name: string }>;
  coaches: Array<{ id: string; name: string }>;
  statusLabels: Record<string, string>;
  paymentLabels: Record<AdminBookingPaymentStatus, string>;
  labels: {
    dateFrom: string;
    dateTo: string;
    classAll: string;
    coachAll: string;
    statusAll: string;
    payment: string;
    paymentAll: string;
  };
};

export function buildAdminBookingsFilterFields(
  options: BookingFilterOptions,
): AdminIntegratedFilterField[] {
  return [
    {
      key: "from",
      label: options.labels.dateFrom,
      fieldType: "date",
      emptyValue: "",
      resolveChipLabel: (value) => formatFilterDateChipLabel(options.labels.dateFrom, value),
    },
    {
      key: "to",
      label: options.labels.dateTo,
      fieldType: "date",
      emptyValue: "",
      resolveChipLabel: (value) => formatFilterDateChipLabel(options.labels.dateTo, value),
    },
    {
      key: "classTypeId",
      label: "Class type",
      allLabel: options.labels.classAll,
      options: options.classTypes.map((item) => ({
        value: item.id,
        label: item.name,
      })),
    },
    {
      key: "coachId",
      label: "Coach",
      allLabel: options.labels.coachAll,
      options: options.coaches.map((item) => ({
        value: item.id,
        label: item.name,
      })),
    },
    {
      key: "status",
      label: "Status",
      allLabel: options.labels.statusAll,
      options: Object.entries(options.statusLabels).map(([value, label]) => ({
        value,
        label,
      })),
    },
    {
      key: "paymentStatus",
      label: options.labels.payment,
      allLabel: options.labels.paymentAll,
      options: ADMIN_BOOKING_PAYMENT_FILTER_VALUES.map((value) => ({
        value,
        label: options.paymentLabels[value],
      })),
    },
  ];
}

export function adminBookingsFilterValuesFromState(values: {
  from: string;
  to: string;
  classTypeId: string;
  coachId: string;
  status: string;
  paymentStatus: string;
}): Record<string, string> {
  return {
    from: values.from,
    to: values.to,
    classTypeId: values.classTypeId,
    coachId: values.coachId,
    status: values.status,
    paymentStatus: values.paymentStatus,
  };
}

/** Inclusive studio-day match. A lone `from` is that single calendar day. */
export function sessionMatchesAdminBookingDateFilter(
  startsAtIso: string,
  from: string,
  to: string,
): boolean {
  const startsAt = new Date(startsAtIso);
  const toDay = to.length > 0 ? to : from;
  if (from.length > 0 && startsAt < studioWallClockToUtc(from, "00:00")) {
    return false;
  }
  if (toDay.length > 0 && startsAt > endOfStudioDayInclusive(studioWallClockToUtc(toDay, "12:00"))) {
    return false;
  }
  return true;
}
