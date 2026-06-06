import { AdminFinanceUnifiedHeader } from "@/components/admin/admin-finance-unified-header";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";

export default function AdminFinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminContentFrame>
      <AdminFinanceUnifiedHeader />
      {children}
    </AdminContentFrame>
  );
}
