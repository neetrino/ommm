import { redirect } from "next/navigation";
import { CreatePasswordPage } from "./create-password-page";

type CreatePasswordLegacyRouteProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string | string[] }>;
};

function readTokenParam(value: string | string[] | undefined): string {
  if (typeof value === "string") {
    return value.trim();
  }
  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0].trim();
  }
  return "";
}

/**
 * Legacy `?token=` links redirect into the path-based invite URL.
 * Keeps older emails working after the query-param middleware bug.
 */
export default async function CreatePasswordLegacyRoutePage({
  params,
  searchParams,
}: CreatePasswordLegacyRouteProps) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const token = readTokenParam(query.token);
  if (token.length > 0) {
    redirect(`/${locale}/create-password/${encodeURIComponent(token)}`);
  }
  return <CreatePasswordPage initialToken="" />;
}
