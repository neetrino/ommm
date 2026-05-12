import { StaffAccountSummary } from "@/components/backoffice/staff-account-summary";

export default async function AdminProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <StaffAccountSummary variant="admin" locale={locale} />;
}
