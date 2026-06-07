import { parseListPageParams } from "@/lib/list-pagination";

export type AdminWaitlistRow = {
  id: string;
  status: "ACTIVE" | "OFFERED" | "EXPIRED" | "CONVERTED" | "REMOVED";
  waitlistDate: string;
  sessionWaitlistCount: number;
  user: {
    id: string;
    name: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
  };
  session: {
    id: string;
    classType: { id: string; name: string };
  };
};

export type AdminWaitlistActivePayload = {
  items: AdminWaitlistRow[];
  total: number;
  take: number;
  offset: number;
};

export function buildAdminWaitlistActiveEndpoint(take: number, offset: number): string {
  const params = new URLSearchParams({
    take: String(take),
    offset: String(offset),
  });
  return `/waitlist/admin/active?${params.toString()}`;
}

export function parseAdminWaitlistPageParams(
  search: Record<string, string | undefined>,
) {
  return parseListPageParams(search);
}
