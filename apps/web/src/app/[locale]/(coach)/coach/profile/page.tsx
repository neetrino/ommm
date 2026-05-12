import { StaffAccountSummary } from "@/components/backoffice/staff-account-summary";

export default async function CoachProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <StaffAccountSummary variant="coach" locale={locale} />;
}
