export type CallTaskStatus = "PENDING" | "DONE" | "CANCELLED";

export const CALL_TASK_STATUS_QUERY_KEY = "status";
export const CALL_TASK_SEARCH_QUERY_KEY = "q";
export const CALL_TASK_STATUS_ALL_QUERY_VALUE = "all";

export function firstQueryValue(
  value: string | readonly string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

/** Missing param → PENDING (default queue). `all` → no API status filter. */
export function parseCallTaskListStatus(
  value: string | readonly string[] | undefined,
): CallTaskStatus | "" {
  const raw = firstQueryValue(value)?.trim();
  if (raw === undefined || raw.length === 0) {
    return "PENDING";
  }
  if (raw === CALL_TASK_STATUS_ALL_QUERY_VALUE) {
    return "";
  }
  if (raw === "PENDING" || raw === "DONE" || raw === "CANCELLED") {
    return raw;
  }
  return "PENDING";
}

export function callTaskStatusToQueryValue(status: CallTaskStatus | ""): string {
  return status.length > 0 ? status : CALL_TASK_STATUS_ALL_QUERY_VALUE;
}

export type CallTaskRow = {
  id: string;
  contactName: string;
  phone: string;
  comment: string;
  dueOn: string;
  dueOnDate: string;
  status: CallTaskStatus;
  userId: string | null;
  createdById: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isOverdue: boolean;
  isDueToday: boolean;
};

export type CallTaskListPayload = {
  items: CallTaskRow[];
  total: number;
  take: number;
  offset: number;
};

export type CallTaskDuePayload = {
  items: CallTaskRow[];
  total: number;
};

export function buildCallTasksListEndpoint(params: {
  take: number;
  offset: number;
  q?: string;
  status?: CallTaskStatus | "";
}): string {
  const search = new URLSearchParams({
    take: String(params.take),
    offset: String(params.offset),
    order: "due-asc",
  });
  const q = params.q?.trim();
  if (q) {
    search.set("q", q);
  }
  if (params.status) {
    search.set("status", params.status);
  }
  return `/call-tasks?${search.toString()}`;
}
