import { getTranslations } from "next-intl/server";
import { AdminNotificationBroadcastForm } from "@/components/admin/admin-notification-broadcast-form";
import { AccountPageFrame } from "@/components/layout/account-page-frame";

export default async function AdminNotificationsPage() {
  const t = await getTranslations("adminPages.notifications");

  return (
    <AccountPageFrame title={t("title")} description={t("description")}>
      <div className="mt-2 max-w-xl ommm-account-section">
        <AdminNotificationBroadcastForm />
      </div>
    </AccountPageFrame>
  );
}
