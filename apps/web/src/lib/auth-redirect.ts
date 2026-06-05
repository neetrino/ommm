import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import { homePathForRole, postAuthPathForRole } from "@/lib/role-home";

/** Query param on `/register` (and `/login`) for post-auth destination. */
export const REGISTER_REDIRECT_PARAM = "redirect";

/** Redirect target: member schedule after booking from public schedule. */
export const REGISTER_REDIRECT_SCHEDULE = "schedule";

/** Redirect target: resume a package subscription started on `/packages` as a guest. */
export const REGISTER_REDIRECT_PACKAGES_BUY = "packages-buy";

/** Query param carrying the package plan id selected before authentication. */
export const PACKAGES_INTENT_PLAN_PARAM = "plan";

/** Query param on `/packages` that auto-opens the subscribe modal for a plan. */
export const PACKAGES_SUBSCRIBE_PARAM = "subscribe";

/** Public packages route (locale-free) used as the subscribe resume destination. */
const PACKAGES_PATH = "/packages";

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
  return postAuthPathForRole(role);
}

/** Login URL that resumes a package subscription on `/packages` after auth. */
export function buildPackagesSubscribeLoginHref(planId: string): string {
  const params = new URLSearchParams();
  params.set(REGISTER_REDIRECT_PARAM, REGISTER_REDIRECT_PACKAGES_BUY);
  params.set(PACKAGES_INTENT_PLAN_PARAM, planId);
  return `/login?${params.toString()}`;
}

/**
 * Resolves the `/packages` resume path when a guest authenticated mid-subscription.
 * Returns `null` when there is no package-subscribe intent in the query.
 */
export function resolvePackagesSubscribeIntentPath(
  redirectParam: string | null,
  planId: string | null,
): string | null {
  if (redirectParam !== REGISTER_REDIRECT_PACKAGES_BUY) {
    return null;
  }
  if (planId === null || planId.length === 0) {
    return null;
  }
  const params = new URLSearchParams();
  params.set(PACKAGES_SUBSCRIBE_PARAM, planId);
  return `${PACKAGES_PATH}?${params.toString()}`;
}

/**
 * Post-auth destination honoring an in-flight package-subscribe intent first,
 * then falling back to the role/redirect landing path.
 */
export function resolveAuthDestination(
  role: string,
  params: Pick<URLSearchParams, "get">,
): string {
  const redirectParam = params.get(REGISTER_REDIRECT_PARAM);
  const intentPath = resolvePackagesSubscribeIntentPath(
    redirectParam,
    params.get(PACKAGES_INTENT_PLAN_PARAM),
  );
  if (intentPath !== null) {
    return intentPath;
  }
  return resolvePostAuthPath(role, redirectParam);
}

/**
 * Preserved redirect query for login when registration does not establish a session.
 */
export function buildLoginHrefWithRedirect(redirectParam: string): string {
  const params = new URLSearchParams();
  params.set(REGISTER_REDIRECT_PARAM, redirectParam);
  return `/login?${params.toString()}`;
}
