import { AdminNotificationBroadcastForm } from "@/components/admin/admin-notification-broadcast-form";
import { AccountPageFrame } from "@/components/layout/account-page-frame";

export default function AdminNotificationsPage() {
  return (
    <AccountPageFrame
      title="Notifications"
      description="Send an email broadcast to members (studio admin only). Delivery uses the existing mail pipeline; push notifications are tracked separately in the product roadmap."
    >
      <div className="mt-2 max-w-xl ommm-account-section">
        <AdminNotificationBroadcastForm />
      </div>
    </AccountPageFrame>
  );
}
