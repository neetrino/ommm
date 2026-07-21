import type {
  AdminBookingRow,
  AdminBookingsFilterState,
  AdminBookingsManagementPayload,
} from "@/components/admin/admin-bookings-query";
import type { BookingCapabilities } from "@/lib/backoffice-capabilities";

export type AdminBookingsManagementProps = {
  locale: string;
  initial: AdminBookingsManagementPayload;
  initialFilters: AdminBookingsFilterState;
  /** Staff surfaces: list-only canon rows. Manager should not use this. */
  variant?: "full" | "staff";
  staffBanner?: string;
  capabilities?: BookingCapabilities;
};

export type BookingConfirmKind = "cancel" | "delete" | "attended" | "activate";

export type PendingBookingConfirm = {
  kind: BookingConfirmKind;
  row: AdminBookingRow;
};

export type { AdminBookingRow as AdminBookingsManagementRow };
