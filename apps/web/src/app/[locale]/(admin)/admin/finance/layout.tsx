import { AdminFinanceSectionPersist } from "@/components/admin/admin-finance-section-persist";
import { AdminFinanceUnifiedHeader } from "@/components/admin/admin-finance-unified-header";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";

export default function AdminFinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminContentFrame>
      <AdminFinanceSectionPersist />
      <div className="flex flex-col gap-6">
        <AdminFinanceUnifiedHeader />
        {children}
      </div>
    </AdminContentFrame>
  );
}
