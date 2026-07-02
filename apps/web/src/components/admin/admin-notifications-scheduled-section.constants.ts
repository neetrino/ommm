import type {
  BroadcastAudience,
  ScheduledBroadcastStatus,
} from "@/components/admin/admin-notifications-types";
import type { ScheduledListFilters } from "@/components/admin/admin-notifications-url";

export type ScheduledQuickFilter = "" | "pending" | "failed" | "sent";

export const ADMIN_NOTIFICATIONS_SCHEDULED_SEARCH_DEBOUNCE_MS = 300;

export const ADMIN_NOTIFICATIONS_SCHEDULED_STATUS_OPTIONS: Array<
  [ScheduledBroadcastStatus | "", string]
> = [
  ["", "statusAll"],
  ["PENDING", "statusPending"],
  ["SENT", "statusSent"],
  ["FAILED", "statusFailed"],
  ["CANCELLED", "statusCancelled"],
];

export const ADMIN_NOTIFICATIONS_SCHEDULED_AUDIENCE_OPTIONS: Array<
  [BroadcastAudience | "", string]
> = [
  ["", "audienceAll"],
  ["users", "audienceUsers"],
  ["coaches", "audienceCoaches"],
  ["staff", "audienceStaff"],
  ["all", "audienceAllRoles"],
];

export const ADMIN_NOTIFICATIONS_SCHEDULED_QUICK_FILTERS: Array<[ScheduledQuickFilter, string]> =
  [
    ["", "quickAll"],
    ["pending", "quickScheduledPending"],
    ["failed", "quickFailed"],
    ["sent", "quickSentScheduled"],
  ];

export type AdminNotificationsScheduledSectionProps = {
  locale: string;
  payload: import("@/components/admin/admin-notifications-types").AdminNotificationsListPayload<
    import("@/components/admin/admin-notifications-types").ScheduledBroadcast
  >;
  loadFailed: boolean;
  initialFilters: ScheduledListFilters;
  onRefresh: () => void;
};
