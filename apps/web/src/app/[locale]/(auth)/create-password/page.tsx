import { redirect } from "next/navigation";
import { readTokenQueryParam } from "@/lib/auth-token-param";
import { CreatePasswordPage } from "./create-password-page";

type CreatePasswordLegacyRouteProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string | string[] }>;
};

/**
 * Legacy `?token=` links redirect into the path-based invite URL.
 * Keeps older emails working after the query-param middleware bug.
 */
export default async function CreatePasswordLegacyRoutePage({
  params,
  searchParams,
}: CreatePasswordLegacyRouteProps) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const token = readTokenQueryParam(query.token);
  if (token.length > 0) {
    redirect(`/${locale}/create-password/${encodeURIComponent(token)}`);
  }
  return <CreatePasswordPage initialToken="" />;
}
