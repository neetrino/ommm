import type { AdminWaitlistActivePayload } from "@/components/admin/admin-waitlist-query";

export type AdminWaitlistManagementProps = {
  locale: string;
  initial: AdminWaitlistActivePayload;
  initialLoadError: string | null;
  staffBanner?: string;
};
