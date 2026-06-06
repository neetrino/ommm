import { AdminFinanceLayoutHeader } from "@/components/admin/admin-finance-layout-header";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";

export default function AdminFinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminContentFrame>
      <AdminFinanceLayoutHeader />
      {children}
    </AdminContentFrame>
  );
}
