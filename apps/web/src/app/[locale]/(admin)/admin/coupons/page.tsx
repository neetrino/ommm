import { getTranslations } from "next-intl/server";
import { AdminCouponsManagement } from "@/components/admin/admin-coupons-management";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";

export default async function AdminCouponsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminPages.coupons" });
  return (
    <AdminContentFrame description={t("description")}>
      <AdminCouponsManagement canDelete />
    </AdminContentFrame>
  );
}
