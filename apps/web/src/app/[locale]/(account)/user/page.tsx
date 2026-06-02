import { redirect } from "next/navigation";
import { USER_DASHBOARD_PATH } from "@/lib/role-home";

export default async function UserIndexRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}${USER_DASHBOARD_PATH}`);
}
