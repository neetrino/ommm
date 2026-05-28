import { AccountPageFrame } from "@/components/layout/account-page-frame";

export default function AdminHomeLoading() {
  return (
    <AccountPageFrame title="" description="">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={`overview-skeleton-${index}`}
            className="h-28 animate-pulse rounded-[24px] border border-white/60 bg-white/50"
          />
        ))}
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <div className="h-72 animate-pulse rounded-[24px] border border-white/60 bg-white/50 xl:col-span-2" />
        <div className="h-72 animate-pulse rounded-[24px] border border-white/60 bg-white/50" />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="h-64 animate-pulse rounded-[24px] border border-white/60 bg-white/50" />
        <div className="h-64 animate-pulse rounded-[24px] border border-white/60 bg-white/50" />
      </div>
    </AccountPageFrame>
  );
}
