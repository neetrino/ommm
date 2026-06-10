/** SSE comment heartbeat interval (see plan §3.2). */
export const REALTIME_HEARTBEAT_MS = 30_000;

/** Max concurrent public SSE connections per client IP. */
export const REALTIME_MAX_PUBLIC_CONNECTIONS_PER_IP = 5;

/** Monotonic event id seed increment step. */
export const REALTIME_EVENT_ID_STEP = 1;
