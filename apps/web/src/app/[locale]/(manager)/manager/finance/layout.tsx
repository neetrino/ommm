import type { ReactNode } from "react";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { ManagerFinanceHeader } from "@/components/admin/manager-finance-header";
import { formatDateForUi } from "@/lib/date-display";
import { utcToStudioCalendarDate } from "@/lib/studio-timezone";

export default function ManagerFinanceLayout({ children }: { children: ReactNode }) {
  const dateLabel = formatDateForUi(utcToStudioCalendarDate(new Date()));
  return (
    <AdminContentFrame>
      <div className="flex flex-col gap-6">
        <ManagerFinanceHeader dateLabel={dateLabel} />
        {children}
      </div>
    </AdminContentFrame>
  );
}
