import { StaffAccountSummary } from "@/components/backoffice/staff-account-summary";

export default async function ManagerProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <StaffAccountSummary variant="manager" locale={locale} />;
}
