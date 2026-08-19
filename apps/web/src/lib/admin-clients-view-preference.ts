export type AdminClientsViewMode = "list" | "sphere";

export const ADMIN_CLIENTS_VIEW_QUERY_KEY = "view";
export const DEFAULT_ADMIN_CLIENTS_VIEW_MODE: AdminClientsViewMode = "list";

const VALID_MODES: readonly AdminClientsViewMode[] = ["list", "sphere"];

function isAdminClientsViewMode(value: string | null): value is AdminClientsViewMode {
  return value !== null && (VALID_MODES as readonly string[]).includes(value);
}

export function parseAdminClientsViewMode(
  value: string | string[] | null | undefined,
): AdminClientsViewMode {
  const requestedValue = Array.isArray(value) ? value[0] : value;
  if (requestedValue === undefined || requestedValue === null) {
    return DEFAULT_ADMIN_CLIENTS_VIEW_MODE;
  }
  return isAdminClientsViewMode(requestedValue)
    ? requestedValue
    : DEFAULT_ADMIN_CLIENTS_VIEW_MODE;
}
