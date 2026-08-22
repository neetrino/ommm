"use client";

import { useCallback, useRef } from "react";
import { AdminClientsManagement } from "@/components/admin/admin-clients-management";
import { AdminClientsShell } from "@/components/admin/admin-clients-shell";
import type { AdminClientsPayload, ClientRow } from "@/components/admin/admin-clients-types";
import {
  adminClientCapabilities,
  type ClientCapabilities,
} from "@/lib/backoffice-capabilities";

type AdminClientsPageClientProps = {
  initial: AdminClientsPayload;
  locale: string;
  initialFilters: Record<string, string>;
  /** @deprecated Prefer `capabilities`. When true and caps omitted, all writes are disabled. */
  readOnly?: boolean;
  capabilities?: ClientCapabilities;
  variant?: "full" | "staff";
  staffBanner?: string;
};

function resolveClientCapabilities(
  capabilities: ClientCapabilities | undefined,
  readOnly: boolean,
): ClientCapabilities {
  if (capabilities) {
    return capabilities;
  }
  if (readOnly) {
    return {
      canView: true,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      canAddNotes: false,
      canAssignPackage: false,
      canCreateBooking: false,
      canCancelBooking: false,
    };
  }
  return adminClientCapabilities();
}

export function AdminClientsPageClient({
  initial,
  locale,
  initialFilters,
  readOnly = false,
  capabilities,
  variant = "full",
  staffBanner,
}: AdminClientsPageClientProps) {
  const caps = resolveClientCapabilities(capabilities, readOnly);
  const refetchRef = useRef<(() => void) | null>(null);
  const seedCreatedClientRef = useRef<((client: ClientRow) => void) | null>(null);

  const handleClientCreated = useCallback((client: ClientRow) => {
    seedCreatedClientRef.current?.(client);
    refetchRef.current?.();
  }, []);

  return (
    <AdminClientsShell onClientCreated={handleClientCreated} capabilities={caps}>
      {({ openAddUserModal }) => (
        <AdminClientsManagement
          initial={initial}
          locale={locale}
          initialFilters={initialFilters}
          variant={variant}
          staffBanner={staffBanner}
          capabilities={caps}
          onAddUser={caps.canCreate ? openAddUserModal : undefined}
          onRegisterRefetch={(refetch) => {
            refetchRef.current = refetch;
          }}
          onRegisterSeedCreatedClient={(seed) => {
            seedCreatedClientRef.current = seed;
          }}
        />
      )}
    </AdminClientsShell>
  );
}
