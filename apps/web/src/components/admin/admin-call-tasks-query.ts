export type CallTaskStatus = "PENDING" | "DONE" | "CANCELLED";

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
