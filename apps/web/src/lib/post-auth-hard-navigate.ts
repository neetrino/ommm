import { localizedWorkspaceHref } from "@/lib/workspace-nav-link";

/**
 * Full document navigation after login/register.
 * Soft `router.push` leaves the auth shell mounted while a heavy workspace RSC
 * loads — on production that feels like flicker/jump; hard nav avoids it.
 */
export function hardNavigateAfterAuth(locale: string, path: string): void {
  window.location.assign(localizedWorkspaceHref(locale, path));
}
