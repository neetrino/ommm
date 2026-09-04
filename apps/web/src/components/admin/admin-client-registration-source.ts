import type { ClientRow } from "@/components/admin/admin-clients-types";

type RegistrationLabelParams = {
  registrationSource: ClientRow["registrationSource"];
  registeredBy: ClientRow["registeredBy"];
  labels: {
    self: string;
    byAdmin: string;
    byManager: string;
    byStaff: string;
  };
};

/**
 * Human-readable how the client account was created (self vs staff).
 */
export function clientRegistrationSourceLabel(
  params: RegistrationLabelParams,
): string {
  if (params.registrationSource === "SELF") {
    return params.labels.self;
  }
  const role = params.registeredBy?.role;
  if (role === "ADMIN") {
    return params.labels.byAdmin;
  }
  if (role === "MANAGER") {
    return params.labels.byManager;
  }
  return params.labels.byStaff;
}
