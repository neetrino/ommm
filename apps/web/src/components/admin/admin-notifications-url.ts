import type { BroadcastAudience } from "@/components/admin/admin-notifications-types";

export const ADMIN_NOTIFICATIONS_SCHEDULED_FILTER_KEYS = [
  "schedSearch",
  "schedStatus",
  "schedAudience",
  "schedOrder",
  "schedQuick",
] as const;

export const ADMIN_NOTIFICATIONS_DELIVERIES_FILTER_KEYS = [
  "delSearch",
  "delAudience",
  "delChannel",
  "delTiming",
  "delOrder",
  "delQuick",
] as const;

export type ScheduledListFilters = {
  search: string;
  status: string;
  audience: BroadcastAudience | "";
  order: "newest" | "oldest" | "schedule";
  quick: "" | "pending" | "failed" | "sent";
};

export type DeliveriesListFilters = {
  search: string;
  audience: BroadcastAudience | "";
  channel: string;
  timing: "" | "scheduled" | "immediate";
  order: "newest" | "oldest";
  quick: "" | "scheduled" | "immediate" | "sent-today";
};

export const defaultScheduledListFilters: ScheduledListFilters = {
  search: "",
  status: "",
  audience: "",
  order: "newest",
  quick: "",
};

export const defaultDeliveriesListFilters: DeliveriesListFilters = {
  search: "",
  audience: "",
  channel: "",
  timing: "",
  order: "newest",
  quick: "",
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function parseScheduledListFiltersFromSearch(
  search: Record<string, string | string[] | undefined>,
): ScheduledListFilters {
  const orderRaw = firstParam(search.schedOrder);
  const order =
    orderRaw === "oldest" || orderRaw === "schedule" ? orderRaw : "newest";
  const quickRaw = firstParam(search.schedQuick);
  const quick =
    quickRaw === "pending" || quickRaw === "failed" || quickRaw === "sent"
      ? quickRaw
      : "";
  const audienceRaw = firstParam(search.schedAudience);
  const audience =
    audienceRaw === "users" ||
    audienceRaw === "coaches" ||
    audienceRaw === "staff" ||
    audienceRaw === "all"
      ? audienceRaw
      : "";

  return {
    search: firstParam(search.schedSearch)?.trim() ?? "",
    status: firstParam(search.schedStatus) ?? "",
    audience,
    order,
    quick,
  };
}

export function parseDeliveriesListFiltersFromSearch(
  search: Record<string, string | string[] | undefined>,
): DeliveriesListFilters {
  const orderRaw = firstParam(search.delOrder);
  const order = orderRaw === "oldest" ? "oldest" : "newest";
  const timingRaw = firstParam(search.delTiming);
  const timing =
    timingRaw === "scheduled" || timingRaw === "immediate" ? timingRaw : "";
  const quickRaw = firstParam(search.delQuick);
  const quick =
    quickRaw === "scheduled" ||
    quickRaw === "immediate" ||
    quickRaw === "sent-today"
      ? quickRaw
      : "";
  const audienceRaw = firstParam(search.delAudience);
  const audience =
    audienceRaw === "users" ||
    audienceRaw === "coaches" ||
    audienceRaw === "staff" ||
    audienceRaw === "all"
      ? audienceRaw
      : "";

  return {
    search: firstParam(search.delSearch)?.trim() ?? "",
    audience,
    channel: firstParam(search.delChannel) ?? "",
    timing,
    order,
    quick,
  };
}

export function buildScheduledFiltersQuery(values: ScheduledListFilters): string {
  const params = new URLSearchParams();
  if (values.search.trim()) params.set("schedSearch", values.search.trim());
  if (values.status) params.set("schedStatus", values.status);
  if (values.audience) params.set("schedAudience", values.audience);
  if (values.order !== "newest") params.set("schedOrder", values.order);
  if (values.quick) params.set("schedQuick", values.quick);
  return params.toString();
}

export function buildDeliveriesFiltersQuery(values: DeliveriesListFilters): string {
  const params = new URLSearchParams();
  if (values.search.trim()) params.set("delSearch", values.search.trim());
  if (values.audience) params.set("delAudience", values.audience);
  if (values.channel) params.set("delChannel", values.channel);
  if (values.timing) params.set("delTiming", values.timing);
  if (values.order !== "newest") params.set("delOrder", values.order);
  if (values.quick) params.set("delQuick", values.quick);
  return params.toString();
}

export function scheduledFiltersToApiParams(
  values: ScheduledListFilters,
): URLSearchParams {
  const params = new URLSearchParams();
  if (values.search.trim()) params.set("search", values.search.trim());
  if (values.status) params.set("status", values.status);
  if (values.audience) params.set("audience", values.audience);
  if (values.order !== "newest") params.set("order", values.order);
  if (values.quick) params.set("quick", values.quick);
  return params;
}

export function deliveriesFiltersToApiParams(
  values: DeliveriesListFilters,
): URLSearchParams {
  const params = new URLSearchParams();
  if (values.search.trim()) params.set("search", values.search.trim());
  if (values.audience) params.set("audience", values.audience);
  if (values.channel) params.set("channel", values.channel);
  if (values.timing) params.set("timing", values.timing);
  if (values.order !== "newest") params.set("order", values.order);
  if (values.quick) params.set("quick", values.quick);
  return params;
}
