import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { homePathForRole } from "@/lib/role-home";
import { serverApiJson } from "@/lib/server-api";

type MePayload = {
  user: { role: string };
};

/**
 * Ensures the session cookie yields a valid `/users/me` response.
 * Redirects unauthenticated visitors to login (localized).
 */
export async function requireAuthForLayout(locale: string): Promise<{
  cookie: string;
  role: string;
}> {
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<MePayload>("/users/me", cookie);
  if (!res.ok) {
    redirect(`/${locale}/login`);
  }
  return { cookie, role: res.data.user.role };
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
