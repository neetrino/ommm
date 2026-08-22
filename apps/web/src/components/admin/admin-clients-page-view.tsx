import { Suspense } from "react";
import { AdminClientsPageClient } from "@/components/admin/admin-clients-page-client";
import type { AdminClientsPayload } from "@/components/admin/admin-clients-types";
import type { ClientCapabilities } from "@/lib/backoffice-capabilities";

type AdminClientsPageViewProps = {
  initial: AdminClientsPayload;
  locale: string;
  initialFilters: Record<string, string>;
  /** @deprecated Prefer `capabilities`. When true and caps omitted, all writes are disabled. */
  readOnly?: boolean;
  capabilities?: ClientCapabilities;
  variant?: "full" | "staff";
  staffBanner?: string;
};

export function AdminClientsPageView(props: AdminClientsPageViewProps) {
  return (
    <Suspense fallback={null}>
      <AdminClientsPageClient {...props} />
    </Suspense>
  );
}
