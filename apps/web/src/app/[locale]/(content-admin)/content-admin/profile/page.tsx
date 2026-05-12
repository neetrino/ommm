import { StaffAccountSummary } from "@/components/backoffice/staff-account-summary";

export default async function ContentAdminProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <StaffAccountSummary variant="contentAdmin" locale={locale} />;
}
