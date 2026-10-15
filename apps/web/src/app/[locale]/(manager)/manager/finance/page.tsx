import { redirect } from "next/navigation";
import { MANAGER_FINANCE_SECTION_HREF } from "@/components/admin/manager-finance-module";

export default async function ManagerFinanceIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}${MANAGER_FINANCE_SECTION_HREF.overview}`);
}
