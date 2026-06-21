"use client";

import { useCallback, useRef } from "react";
import { AdminClientsManagement } from "@/components/admin/admin-clients-management";
import { AdminClientsShell } from "@/components/admin/admin-clients-shell";
import type { AdminClientsPayload, ClientRow } from "@/components/admin/admin-clients-types";

type AdminClientsPageViewProps = {
  initial: AdminClientsPayload;
  locale: string;
  initialFilters: Record<string, string>;
  readOnly?: boolean;
  variant?: "full" | "staff";
  staffBanner?: string;
};

export function AdminClientsPageView({
  initial,
  locale,
  initialFilters,
  readOnly = false,
  variant = "full",
  staffBanner,
}: AdminClientsPageViewProps) {
  const refetchRef = useRef<(() => void) | null>(null);

  const handleClientCreated = useCallback((_client: ClientRow) => {
    refetchRef.current?.();
  }, []);

  return (
    <AdminClientsShell onClientCreated={handleClientCreated} readOnly={readOnly}>
      {({ openAddUserModal }) => (
        <AdminClientsManagement
          initial={initial}
          locale={locale}
          initialFilters={initialFilters}
          variant={variant}
          staffBanner={staffBanner}
          readOnly={readOnly}
          onAddUser={readOnly ? undefined : openAddUserModal}
          onRegisterRefetch={(refetch) => {
            refetchRef.current = refetch;
          }}
        />
      )}
    </AdminClientsShell>
  );
}
