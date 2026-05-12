import { getTranslations } from "next-intl/server";
import { AdminNotificationBroadcastForm } from "@/components/admin/admin-notification-broadcast-form";
import { AccountPageFrame } from "@/components/layout/account-page-frame";

export default async function AdminNotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminPages.notifications" });

  return (
    <AccountPageFrame title={t("title")} description={t("description")}>
      <div className="mt-2 max-w-xl ommm-account-section">
        <AdminNotificationBroadcastForm />
      </div>
    </AccountPageFrame>
  );
}
