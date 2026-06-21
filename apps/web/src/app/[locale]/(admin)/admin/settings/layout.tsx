import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { AdminSettingsUnifiedHeader } from "@/components/admin/admin-settings-unified-header";

export default function AdminSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminContentFrame>
      <div className="flex flex-col gap-6">
        <AdminSettingsUnifiedHeader />
        {children}
      </div>
    </AdminContentFrame>
  );
}
