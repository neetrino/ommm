import { VIEW_CLIENT_QUERY_KEY } from "@/components/admin/admin-clients-query";
import {
  CLIENT_PROFILE_TAB_QUERY_KEY,
  CLIENT_SHEET_TAB_PACKAGES,
} from "@/components/admin/admin-client-sheet-tabs";

export type DashboardStudioPaymentDueItem = {
  clientId: string;
  clientName: string;
  packageId: string;
  packageName: string;
};

export function studioPaymentDueClientHref(
  clientsHref: string,
  clientId: string,
): string {
  const params = new URLSearchParams({
    [VIEW_CLIENT_QUERY_KEY]: clientId,
    [CLIENT_PROFILE_TAB_QUERY_KEY]: CLIENT_SHEET_TAB_PACKAGES,
  });
  return `${clientsHref}?${params.toString()}`;
}

