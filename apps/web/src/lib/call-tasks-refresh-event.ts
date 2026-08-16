export const CALL_TASKS_REFRESH_EVENT = "ommm:call-tasks-refresh";

export function dispatchCallTasksRefresh(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new CustomEvent(CALL_TASKS_REFRESH_EVENT));
}
