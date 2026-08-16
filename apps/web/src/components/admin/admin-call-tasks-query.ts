export type CallTaskStatus = "PENDING" | "DONE" | "CANCELLED";
export type CallTaskListFilter = CallTaskStatus | "OVERDUE";
export const CALL_TASK_LIST_FILTERS: readonly CallTaskListFilter[] = [
  "PENDING",
  "OVERDUE",
  "DONE",
  "CANCELLED",
];

export const CALL_TASK_STATUS_QUERY_KEY = "status";
export const CALL_TASK_SEARCH_QUERY_KEY = "q";
export const CALL_TASK_STATUS_ALL_QUERY_VALUE = "all";

export function firstQueryValue(
  value: string | readonly string[] | undefined,
): string | undefined {
  if (typeof value === "string") {
    return value;
  }
  if (value === undefined) {
    return undefined;
  }
  return value[0];
}

/** Missing param or `all` → no API status filter. */
export function parseCallTaskListStatus(
  value: string | readonly string[] | undefined,
): CallTaskListFilter | "" {
  const raw = firstQueryValue(value)?.trim();
  if (raw === undefined || raw.length === 0) {
    return "";
  }
  if (raw === CALL_TASK_STATUS_ALL_QUERY_VALUE) {
    return "";
  }
  if (CALL_TASK_LIST_FILTERS.includes(raw as CallTaskListFilter)) {
    return raw as CallTaskListFilter;
  }
  return "";
}

export function callTaskStatusToQueryValue(status: CallTaskListFilter | ""): string {
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
  status?: CallTaskListFilter | "";
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
