import { redirect } from "next/navigation";
import { USER_DASHBOARD_PATH } from "@/lib/role-home";

/** Legacy member dashboard URL — canonical home is `/user/home`. */
export default async function LegacyDashboardRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}${USER_DASHBOARD_PATH}`);
}
