import { redirect } from "next/navigation";
import { homePathForRole } from "@/lib/role-home";
import { getSessionAuth } from "@/server/require-role-layout";

/** Server Components only: localized redirect to the role default home. */
export function redirectToRoleHome(locale: string, role: string): never {
  redirect(`/${locale}${homePathForRole(role)}`);
}

/**
 * Auth pages (e.g. `/login`): send authenticated visitors to their role home
 * instead of showing the sign-in form again.
 */
export async function redirectIfAuthenticatedToRoleHome(locale: string): Promise<void> {
  const session = await getSessionAuth();
  if (session.ok) {
    redirectToRoleHome(locale, session.user.role);
  }
}
