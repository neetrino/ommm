import { Suspense } from "react";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { AdminStaffActivitySection } from "@/components/admin/admin-staff-activity-section";

export default function ManagerStaffActivityPage() {
  return (
    <AdminContentFrame>
      <Suspense fallback={null}>
        <AdminStaffActivitySection />
      </Suspense>
    </AdminContentFrame>
  );
}
