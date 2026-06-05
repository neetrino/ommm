import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import { postAuthPathForRole } from "@/lib/role-home";

/** Query param on `/register` (and `/login`) for post-auth destination. */
export const REGISTER_REDIRECT_PARAM = "redirect";

/** Query param on `/login` — locale-free path to return to after auth (USER only). */
export const RETURN_URL_PARAM = "returnUrl";

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

/** Public marketing schedule — post-auth landing for schedule booking intents. */
export const MARKETING_SCHEDULE_PATH = "/schedule";

const BOOKING_QUERY_KEYS = {
  classId: "classId",
  className: "className",
  dayOfWeek: "dayOfWeek",
  startTime: "startTime",
  endTime: "endTime",
} as const;

function isSafeReturnPath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//");
}

/**
 * Login URL that returns the visitor to a marketing page after authentication.
 */
export function buildLoginHrefWithReturnUrl(returnPath: string): string {
  const params = new URLSearchParams();
  params.set(RETURN_URL_PARAM, returnPath);
  return `/login?${params.toString()}`;
}

/**
 * Register URL for guests booking a class from the public schedule.
 * Preserves booking context and returns to `/schedule` after account creation.
 */
export function buildRegisterHrefForScheduleBooking(
  item: Pick<
    MarketingScheduleItem,
    "id" | "className" | "dayOfWeek" | "startTime" | "endTime"
  >,
): string {
  const params = new URLSearchParams();
  params.set(REGISTER_REDIRECT_PARAM, REGISTER_REDIRECT_SCHEDULE);
  params.set(RETURN_URL_PARAM, MARKETING_SCHEDULE_PATH);
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
export function resolveReturnUrlFromParams(
  params: Pick<URLSearchParams, "get">,
): string | null {
  const raw = params.get(RETURN_URL_PARAM);
  if (raw === null) {
    return null;
  }
  const trimmed = raw.trim();
  if (trimmed.length === 0 || !isSafeReturnPath(trimmed)) {
    return null;
  }
  return trimmed;
}

export function resolvePostAuthPath(role: string, redirectParam: string | null): string {
  if (role === "USER") {
    if (redirectParam === REGISTER_REDIRECT_SCHEDULE) {
      return MARKETING_SCHEDULE_PATH;
    }
    if (redirectParam === "packages") {
      return PACKAGES_PATH;
    }
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
  const returnUrl = resolveReturnUrlFromParams(params);
  if (role === "USER" && returnUrl !== null) {
    return returnUrl;
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
