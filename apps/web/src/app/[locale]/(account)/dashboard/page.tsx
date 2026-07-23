import { redirect } from "next/navigation";
import { USER_ACCOUNT_PATH } from "@/lib/role-home";

/** Legacy member dashboard URL — canonical home is `/user`. */
export default async function LegacyDashboardRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}${USER_ACCOUNT_PATH}`);
}
