import { redirect } from "next/navigation";
import {
  layoutAuthUserFromMe,
  type LayoutAuthUser,
} from "@/lib/layout-auth-user";
import { homePathForRole } from "@/lib/role-home";
import type { MeApiUser } from "@/lib/me-api-types";
import { getCachedUsersMe } from "@/server/cached-users-me";

export type { LayoutAuthUser };

export type LayoutAuthResult = {
  cookie: string;
  role: string;
  userLocale: string | null;
  authUser: LayoutAuthUser;
};

export type LayoutAuthOutcome =
  | { kind: "ok"; auth: LayoutAuthResult }
  | { kind: "api_unavailable" };

/**
 * URL locale is the source of truth; users change language via the switcher.
 * Kept for call sites — no redirect so English (or any URL segment) stays default.
 */
export async function redirectIfPreferredAccountLocale(
  segmentLocale: string,
  userLocale: string | null | undefined,
): Promise<void> {
  void segmentLocale;
  void userLocale;
}

type SessionAuthResult =
  | { ok: true; cookie: string; user: MeApiUser; coachProfileId: string | null }
  | { ok: false; status: number; cookie: string };

/** One `/users/me` per RSC request — layout + pages share this cache. */
export async function getSessionAuth(): Promise<SessionAuthResult> {
  const me = await getCachedUsersMe();
  if (!me.ok) {
    return { ok: false, status: me.status, cookie: me.cookie };
  }
  return {
    ok: true,
    cookie: me.cookie,
    user: me.data.user as MeApiUser,
    coachProfileId: me.data.coachProfileId ?? null,
  };
}

function layoutAuthFromUser(cookie: string, user: MeApiUser): LayoutAuthResult {
  return {
    cookie,
    role: user.role,
    userLocale: user.locale ?? null,
    authUser: layoutAuthUserFromMe(user),
  };
}

/**
 * Ensures the session cookie yields a valid `/users/me` response.
 * Redirects unauthenticated visitors to login (localized).
 */
export async function requireAuthForLayout(locale: string): Promise<LayoutAuthOutcome> {
  const session = await getSessionAuth();
  if (!session.ok) {
    if (session.status === 503 || session.status === 504) {
      return { kind: "api_unavailable" };
    }
    redirect(`/${locale}/login`);
  }
  return {
    kind: "ok",
    auth: layoutAuthFromUser(session.cookie, session.user),
  };
}

/**
 * Resolves the current user from the session cookie without redirecting.
 * Returns `null` for guests or when the session is invalid — safe for public
 * (marketing) layouts that must render for both authenticated and anonymous visitors.
 */
export async function getOptionalLayoutAuthUser(): Promise<LayoutAuthUser | null> {
  const session = await getSessionAuth();
  if (!session.ok) {
    return null;
  }
  return layoutAuthUserFromMe(session.user);
}

/**
 * Redirects to this role’s home when the user must not see the current section.
 */
export function redirectIfRoleNotIn(
  locale: string,
  role: string,
  allowed: ReadonlySet<string>,
): void {
  if (!allowed.has(role)) {
    redirect(`/${locale}${homePathForRole(role)}`);
  }
}
