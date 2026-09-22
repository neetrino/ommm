import type { ClientRow } from "@/components/admin/admin-clients-types";

type RegistrationLabels = {
  self: string;
  byAdmin: string;
  byManager: string;
  byStaff: string;
  viaAdmin: string;
  viaManager: string;
  viaStaff: string;
};

type RegistrationLabelParams = {
  registrationSource: ClientRow["registrationSource"];
  registeredBy: ClientRow["registeredBy"];
  labels: RegistrationLabels;
};

function labelForRole(
  role: NonNullable<ClientRow["registeredBy"]>["role"] | undefined,
  labels: { admin: string; manager: string; staff: string },
): string {
  if (role === "ADMIN") {
    return labels.admin;
  }
  if (role === "MANAGER") {
    return labels.manager;
  }
  return labels.staff;
}

/**
 * Human-readable how the client account was created (self, staff form, or invite link).
 */
export function clientRegistrationSourceLabel(
  params: RegistrationLabelParams,
): string {
  const role = params.registeredBy?.role;
  if (params.registrationSource === "INVITE") {
    return labelForRole(role, {
      admin: params.labels.viaAdmin,
      manager: params.labels.viaManager,
      staff: params.labels.viaStaff,
    });
  }
  if (params.registrationSource === "SELF") {
    return params.labels.self;
  }
  return labelForRole(role, {
    admin: params.labels.byAdmin,
    manager: params.labels.byManager,
    staff: params.labels.byStaff,
  });
}
