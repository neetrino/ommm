import type { AdminWaitlistToastTone } from "@/components/admin/admin-waitlist-management.constants";

type AdminWaitlistToastProps = {
  toast: { tone: AdminWaitlistToastTone; message: string } | null;
};

export function AdminWaitlistToast({ toast }: AdminWaitlistToastProps) {
  if (!toast) {
    return null;
  }

  return (
    <div
      role="status"
      className={`fixed bottom-4 right-4 z-[95] max-w-sm rounded-xl border px-4 py-3 text-sm shadow-[0_12px_32px_-20px_rgba(45,40,35,0.4)] ${
        toast.tone === "ok"
          ? "border-mint-200/80 bg-mint-50/95 text-sage-900"
          : "border-red-200/80 bg-red-50/95 text-red-900"
      }`}
    >
      {toast.message}
    </div>
  );
}
