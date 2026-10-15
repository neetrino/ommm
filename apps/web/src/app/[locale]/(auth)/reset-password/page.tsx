import { redirect } from "next/navigation";
import { readTokenQueryParam } from "@/lib/auth-token-param";
import { ResetPasswordPage } from "./reset-password-page";

type ResetPasswordLegacyRouteProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string | string[]; mode?: string | string[] }>;
};

/**
 * Legacy `?token=` links redirect into the path-based URL so already-sent emails keep working.
 * `mode=create` is the old first-time-password invite format.
 */
export default async function ResetPasswordLegacyRoutePage({
  params,
  searchParams,
}: ResetPasswordLegacyRouteProps) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const token = readTokenQueryParam(query.token);
  if (token.length > 0) {
    const route = readTokenQueryParam(query.mode) === "create" ? "create-password" : "reset-password";
    redirect(`/${locale}/${route}/${encodeURIComponent(token)}`);
  }
  return <ResetPasswordPage initialToken="" />;
}
