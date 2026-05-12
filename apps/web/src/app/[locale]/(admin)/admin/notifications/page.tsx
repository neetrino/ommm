import { AdminNotificationBroadcastForm } from "@/components/admin/admin-notification-broadcast-form";

export default function AdminNotificationsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Notifications</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600">
        Send an email broadcast to members (studio admin only). Delivery uses
        the existing mail pipeline; push notifications are tracked separately in
        the product roadmap.
      </p>
      <div className="mt-8 max-w-xl rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm">
        <AdminNotificationBroadcastForm />
      </div>
    </div>
  );
}
