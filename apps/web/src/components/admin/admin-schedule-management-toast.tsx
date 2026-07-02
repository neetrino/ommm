"use client";

import type { ScheduleToast } from "@/components/admin/admin-schedule-session.types";

type AdminScheduleManagementToastProps = {
  toast: ScheduleToast;
};

export function AdminScheduleManagementToast({ toast }: AdminScheduleManagementToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 right-4 z-[95] max-w-sm rounded-xl border px-4 py-3 text-sm shadow-[0_12px_32px_-20px_rgba(45,40,35,0.4)] backdrop-blur-md ${
        toast.tone === "ok"
          ? "border-mint-200/80 bg-mint-50/95 text-sage-900"
          : "border-red-200/80 bg-red-50/95 text-red-900"
      }`}
    >
      {toast.message}
    </div>
  );
}
