import { Suspense } from "react";
import { AdminCouponAnalyticsPanel } from "@/components/admin/admin-coupon-analytics-panel";

export default async function ManagerCouponAnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <Suspense>
      <AdminCouponAnalyticsPanel locale={locale} />
    </Suspense>
  );
}
