import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import { homePathForRole } from "@/lib/role-home";

/** Query param on `/register` (and `/login`) for post-auth destination. */
export const REGISTER_REDIRECT_PARAM = "redirect";

/** Redirect target: member schedule after booking from public schedule. */
export const REGISTER_REDIRECT_SCHEDULE = "schedule";

/** Member schedule route — matches `dashboard-nav` USER nav. */
export const USER_SCHEDULE_PATH = "/user/classes";

const BOOKING_QUERY_KEYS = {
  classId: "classId",
  className: "className",
  dayOfWeek: "dayOfWeek",
  startTime: "startTime",
  endTime: "endTime",
} as const;

/**
 * Register URL for guests booking a class from the public schedule.
 * Preserves booking context and opens Schedule after account creation.
 */
export function buildRegisterHrefForScheduleBooking(
  item: Pick<
    MarketingScheduleItem,
    "id" | "className" | "dayOfWeek" | "startTime" | "endTime"
  >,
): string {
  const params = new URLSearchParams();
  params.set(REGISTER_REDIRECT_PARAM, REGISTER_REDIRECT_SCHEDULE);
  params.set(BOOKING_QUERY_KEYS.classId, item.id);
  params.set(BOOKING_QUERY_KEYS.className, item.className);
  params.set(BOOKING_QUERY_KEYS.dayOfWeek, item.dayOfWeek);
  params.set(BOOKING_QUERY_KEYS.startTime, item.startTime);
  if (item.endTime !== null) {
    params.set(BOOKING_QUERY_KEYS.endTime, item.endTime);
  }
  return `/register?${params.toString()}`;
}

/**
 * Landing path after successful auth for the given role and optional redirect param.
 */
export function resolvePostAuthPath(role: string, redirectParam: string | null): string {
  if (
    role === "USER" &&
    (redirectParam === REGISTER_REDIRECT_SCHEDULE || redirectParam === "packages")
  ) {
    return USER_SCHEDULE_PATH;
  }
  return homePathForRole(role);
}

/**
 * Preserved redirect query for login when registration does not establish a session.
 */
export function buildLoginHrefWithRedirect(redirectParam: string): string {
  const params = new URLSearchParams();
  params.set(REGISTER_REDIRECT_PARAM, redirectParam);
  return `/login?${params.toString()}`;
}
