import { AdminContentFrame } from "@/components/admin/admin-content-frame";

export default function ManagerDashboardLoading() {
  return (
    <AdminContentFrame>
      <div className="h-36 animate-pulse rounded-[24px] border border-white/60 bg-white/55" />
      <div className="mt-6 h-72 animate-pulse rounded-[24px] border border-white/60 bg-white/55" />
      <div className="mt-4 h-48 animate-pulse rounded-[24px] border border-white/60 bg-white/55" />
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="h-40 animate-pulse rounded-[24px] border border-white/60 bg-white/55 lg:col-span-2" />
        <div className="h-40 animate-pulse rounded-[24px] border border-white/60 bg-white/55" />
      </div>
    </AdminContentFrame>
  );
}
