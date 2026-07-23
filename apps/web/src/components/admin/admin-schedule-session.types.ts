import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import type { ScheduleView } from "@/components/admin/admin-schedule-view";
import type { ScheduleListFilterState } from "@/components/admin/admin-schedule-url";
import type { SessionSortOrder } from "@/lib/list-sort";
import type { ScheduleCapabilities } from "@/lib/backoffice-capabilities";

export type SessionStatus = "ACTIVE" | "CANCELLED" | "FULL" | "DRAFT";

export type ScheduleDayOfWeek =
  | "SUNDAY"
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY";

export type AvailabilityOption = "available" | "full";

export type TimeOfDayOption = "morning" | "afternoon" | "evening";

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
  assignedClassTypeIds: string[];
  user: { name: string | null; lastName: string | null; email: string };
};

export type AdminScheduleManagementProps = {
  locale: string;
  sessions: AdminScheduleSession[];
  /**
   * Sessions used only for the date-strip day counts.
   * Independent of the current list page when pagination is active.
   */
  dateStripSessions?: readonly Pick<AdminScheduleSession, "startsAt">[];
  /** Total for the All-classes strip card (independent of selected day / page). */
  dateStripTotalCount?: number;
  listPagination: { total: number; take: number; offset: number } | null;
  classTypes: AdminScheduleClassType[];
  packages: AdminPackageRow[];
  coaches: AdminScheduleCoach[];
  initialView: ScheduleView;
  initialFilterState: ScheduleListFilterState;
  /** Staff surfaces: list-only rows with admin filters. Manager should not use this. */
  variant?: "full" | "staff";
  staffBanner?: string;
  capabilities?: ScheduleCapabilities;
};

export type AdminScheduleFilters = {
  q: string;
  from: string;
  to: string;
  coachIds: string[];
  typeIds: string[];
  levels: string[];
  statuses: SessionStatus[];
  availability: AvailabilityOption[];
  timeOfDay: TimeOfDayOption[];
  order: SessionSortOrder;
};

export type AdminScheduleFormState = {
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

export type CalendarScheduleSlot = {
  id: string;
  weekday: ScheduleDayOfWeek;
  startTime: string;
  endTime: string;
};

export type ScheduleToastTone = "ok" | "err";

export type ScheduleToast = {
  tone: ScheduleToastTone;
  message: string;
};

export type AdminScheduleSummary = Record<
  "total" | "active" | "upcoming" | "full" | "cancelled" | "draft",
  number
>;

export type Filters = AdminScheduleFilters;
export type FormState = AdminScheduleFormState;
export type Props = AdminScheduleManagementProps;
