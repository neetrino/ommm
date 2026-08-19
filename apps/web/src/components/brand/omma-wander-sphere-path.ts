import { memberUserPathWithoutLocale } from "@/lib/member-user-hub-sheet-paths";

const EXCLUDED_EXACT_PATHS = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
]);

const EXCLUDED_PREFIXES = ["/payment"] as const;

/**
 * Auth and payment already run their own sphere scenes — skip the wander overlay.
 */
export function isOmmaWanderPathEnabled(pathname: string): boolean {
  const path = memberUserPathWithoutLocale(pathname);
  if (EXCLUDED_EXACT_PATHS.has(path)) {
    return false;
  }

  return !EXCLUDED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}
