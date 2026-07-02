import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import type {
  AdminBookingDetailPayload,
  AdminBookingRow,
  AdminBookingsFilterState,
  AdminBookingsManagementPayload,
} from "@/components/admin/admin-bookings-query";

export type AdminBookingsManagementProps = {
  locale: string;
  initial: AdminBookingsManagementPayload;
  initialFilters: AdminBookingsFilterState;
  /** Staff surfaces (manager): list-only canon rows, no calendar hero/metrics. */
  variant?: "full" | "staff";
  staffBanner?: string;
};

export type BookingConfirmKind = "cancel" | "delete" | "attended" | "activate";

export type PendingBookingConfirm = {
  kind: BookingConfirmKind;
  row: AdminBookingRow;
};

export type { AdminBookingRow as AdminBookingsManagementRow };
