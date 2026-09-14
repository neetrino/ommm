import { AdminStudioPaymentDuePage } from "@/components/admin/admin-studio-payment-due-page";

export default async function AdminPaymentDueRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <AdminStudioPaymentDuePage locale={locale} includeFinance />;
}
