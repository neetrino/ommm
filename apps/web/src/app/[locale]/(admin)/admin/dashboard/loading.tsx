import { AdminContentFrame } from "@/components/admin/admin-content-frame";

export default function AdminDashboardLoading() {
  return (
    <AdminContentFrame>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-[20px] border border-white/60 bg-white/55"
          />
        ))}
      </div>
      <div className="mt-6 h-72 animate-pulse rounded-[24px] border border-white/60 bg-white/55" />
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="h-48 animate-pulse rounded-[24px] border border-white/60 bg-white/55" />
        <div className="h-48 animate-pulse rounded-[24px] border border-white/60 bg-white/55" />
      </div>
    </AdminContentFrame>
  );
}
