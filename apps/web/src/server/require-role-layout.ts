import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { homePathForRole } from "@/lib/role-home";
import { OMMM_PATHNAME_HEADER } from "@/lib/ui-locale-constants";
import { routing } from "@/i18n/routing";
import { serverApiJson } from "@/lib/server-api";

type MePayload = {
  user: { role: string; locale?: string | null };
};

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
export async function requireAuthForLayout(locale: string): Promise<{
  cookie: string;
  role: string;
  userLocale: string | null;
}> {
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<MePayload>("/users/me", cookie);
  if (!res.ok) {
    redirect(`/${locale}/login`);
  }
  return {
    cookie,
    role: res.data.user.role,
    userLocale: res.data.user.locale ?? null,
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
