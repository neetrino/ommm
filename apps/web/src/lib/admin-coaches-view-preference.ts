export type AdminCoachesViewMode = "list" | "board";

export const ADMIN_COACHES_VIEW_QUERY_KEY = "view";
export const DEFAULT_ADMIN_COACHES_VIEW_MODE: AdminCoachesViewMode = "list";

const VALID_MODES: readonly AdminCoachesViewMode[] = ["list", "board"];

function isAdminCoachesViewMode(value: string | null): value is AdminCoachesViewMode {
  return value !== null && (VALID_MODES as readonly string[]).includes(value);
}

export function parseAdminCoachesViewMode(
  value: string | string[] | null | undefined,
): AdminCoachesViewMode {
  const requestedValue = Array.isArray(value) ? value[0] : value;
  if (requestedValue === undefined || requestedValue === null) {
    return DEFAULT_ADMIN_COACHES_VIEW_MODE;
  }
  return isAdminCoachesViewMode(requestedValue)
    ? requestedValue
    : DEFAULT_ADMIN_COACHES_VIEW_MODE;
}
