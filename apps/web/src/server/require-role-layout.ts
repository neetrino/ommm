import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { homePathForRole } from "@/lib/role-home";
import { OMMM_PATHNAME_HEADER } from "@/lib/ui-locale-constants";
import { routing } from "@/i18n/routing";
import { serverApiJson } from "@/lib/server-api";

type MePayload = {
  user: {
    role: string;
    locale?: string | null;
    name?: string | null;
    lastName?: string | null;
    email?: string;
    homeImageUrl?: string | null;
  };
};

export type LayoutAuthUser = {
  role: string;
  locale: string | null;
  name: string | null;
  lastName: string | null;
  email: string;
  homeImageUrl: string | null;
};

export type LayoutAuthResult = {
  cookie: string;
  role: string;
  userLocale: string | null;
  authUser: LayoutAuthUser;
};

export type LayoutAuthOutcome =
  | { kind: "ok"; auth: LayoutAuthResult }
  | { kind: "api_unavailable" };

function isRoutingLocale(value: string): value is (typeof routing.locales)[number] {
  return routing.locales.includes(value as (typeof routing.locales)[number]);
}

/**
 * When the signed-in user's saved `locale` differs from the URL segment,
 * redirect to the same path under their preferred locale (switcher + RSC stay in sync).
 */
export async function redirectIfPreferredAccountLocale(
  segmentLocale: string,
  userLocale: string | null | undefined,
): Promise<void> {
  const pref = userLocale?.trim();
  if (!pref || !isRoutingLocale(pref)) return;
  if (pref === segmentLocale) return;

  const pathname = (await headers()).get(OMMM_PATHNAME_HEADER);
  if (!pathname?.startsWith("/")) return;

  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0 || !isRoutingLocale(parts[0])) return;

  const tail = parts.slice(1);
  if (tail.length === 0) {
    redirect(`/${pref}`);
    return;
  }
  redirect(`/${pref}/${tail.join("/")}`);
}

/**
 * Ensures the session cookie yields a valid `/users/me` response.
 * Redirects unauthenticated visitors to login (localized).
 */
export async function requireAuthForLayout(locale: string): Promise<LayoutAuthOutcome> {
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<MePayload>("/users/me", cookie);
  if (!res.ok) {
    if (res.status === 503 || res.status === 504) {
      return { kind: "api_unavailable" };
    }
    redirect(`/${locale}/login`);
  }
  const { user } = res.data;
  return {
    kind: "ok",
    auth: {
      cookie,
      role: user.role,
      userLocale: user.locale ?? null,
      authUser: {
        role: user.role,
        locale: user.locale ?? null,
        name: user.name ?? null,
        lastName: user.lastName ?? null,
        email: user.email ?? "",
        homeImageUrl: user.homeImageUrl ?? null,
      },
    },
  };
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
