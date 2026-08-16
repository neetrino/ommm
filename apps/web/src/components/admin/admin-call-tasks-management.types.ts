export type AdminCallTasksManagementProps = {
  initial: import("@/components/admin/admin-call-tasks-query").CallTaskListPayload;
  initialLoadError: string | null;
  initialStatus: import("@/components/admin/admin-call-tasks-query").CallTaskStatus | "";
  initialQuery: string;
};
