import { AdminContentFrame } from "@/components/admin/admin-content-frame";

export default function AdminHomeLoading() {
  return (
    <AdminContentFrame>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-[24px] border border-white/60 bg-white/55"
          />
        ))}
      </div>
    </AdminContentFrame>
  );
}
