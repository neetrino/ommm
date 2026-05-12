import { redirect } from "next/navigation";
import { homePathForRole } from "@/lib/role-home";

/** Server Components only: localized redirect to the role default home. */
export function redirectToRoleHome(locale: string, role: string): never {
  redirect(`/${locale}${homePathForRole(role)}`);
}
