import type { ManagerInvitesAnalyticsPayload } from "@/components/admin/admin-analytics-managers-types";
import {
  parseAnalyticsQuickFilters,
  parseAnalyticsRangeDays,
  resolveAnalyticsDateRange,
} from "@/components/admin/admin-analytics-helpers";
import { serverApiJson } from "@/lib/server-api";

export async function loadManagerInvitesAnalyticsPayload(
  search: Record<string, string | string[] | undefined>,
  cookie: string,
): Promise<
  { ok: true; data: ManagerInvitesAnalyticsPayload } | { ok: false; status: number }
> {
  const rangeDays = parseAnalyticsRangeDays(
    Array.isArray(search.rangeDays) ? search.rangeDays[0] : search.rangeDays,
  );
  const from = Array.isArray(search.from) ? search.from[0] : search.from;
  const to = Array.isArray(search.to) ? search.to[0] : search.to;
  const quickRaw = Array.isArray(search.quick) ? search.quick[0] : search.quick;
  const quickFilters = parseAnalyticsQuickFilters(quickRaw);
  const { fromIso, toIso } = resolveAnalyticsDateRange({
    rangeDays,
    from,
    to,
    quickFilters,
  });
  const params = new URLSearchParams();
  params.set("from", fromIso);
  params.set("to", toIso);
  const res = await serverApiJson<ManagerInvitesAnalyticsPayload>(
    `/reports/analytics/manager-invites?${params.toString()}`,
    cookie,
  );
  if (!res.ok) {
    return { ok: false, status: res.status };
  }
  return { ok: true, data: res.data };
}
