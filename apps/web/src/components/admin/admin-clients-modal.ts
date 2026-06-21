export const CLIENT_MODAL_QUERY_KEY = "modal";
export const CLIENT_MODAL_QUERY_VALUE = "add-user";

export function adminClientsAddUserModalHref(): string {
  return `/admin/clients?${CLIENT_MODAL_QUERY_KEY}=${CLIENT_MODAL_QUERY_VALUE}`;
}
