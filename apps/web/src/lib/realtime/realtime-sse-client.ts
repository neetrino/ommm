import { parseRealtimeMessageEvent } from "@/lib/realtime/parse-realtime-event";
import { REALTIME_SSE_EVENT_NAMES } from "@/lib/realtime/realtime-event-types";
import type { ParsedRealtimeEvent } from "@/lib/realtime/realtime-event-types";

export type RealtimeConnectionStatus = "connecting" | "connected" | "disconnected";

export type RealtimeSseClientOptions = {
  url: string;
  withCredentials: boolean;
  onEvent: (event: ParsedRealtimeEvent) => void;
  onOpen: () => void;
  onStatusChange: (status: RealtimeConnectionStatus) => void;
};

export type RealtimeSseClientHandle = {
  close: () => void;
};

const RECONNECT_BASE_MS = 1_000;
const RECONNECT_MAX_MS = 30_000;

/**
 * Native EventSource wrapper with automatic reconnect when the stream closes.
 * Intentional shutdown only via {@link RealtimeSseClientHandle.close}.
 */
export function createRealtimeSseClient(
  options: RealtimeSseClientOptions,
): RealtimeSseClientHandle {
  let closed = false;
  let source: EventSource | null = null;
  let reconnectAttempt = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

  const setStatus = (status: RealtimeConnectionStatus): void => {
    options.onStatusChange(status);
  };

  const clearReconnectTimer = (): void => {
    if (reconnectTimer !== undefined) {
      clearTimeout(reconnectTimer);
      reconnectTimer = undefined;
    }
  };

  const scheduleReconnect = (): void => {
    if (closed) {
      return;
    }
    clearReconnectTimer();
    const delay = Math.min(
      RECONNECT_BASE_MS * 2 ** reconnectAttempt,
      RECONNECT_MAX_MS,
    );
    reconnectAttempt += 1;
    reconnectTimer = setTimeout(() => {
      connect();
    }, delay);
  };

  const attachListeners = (es: EventSource): void => {
    const handleNamedEvent = (event: MessageEvent<string>): void => {
      const parsed = parseRealtimeMessageEvent(event);
      if (parsed !== null) {
        options.onEvent(parsed);
      }
    };

    for (const name of REALTIME_SSE_EVENT_NAMES) {
      es.addEventListener(name, handleNamedEvent);
    }

    es.onopen = (): void => {
      if (closed) {
        return;
      }
      reconnectAttempt = 0;
      clearReconnectTimer();
      setStatus("connected");
      options.onOpen();
    };

    es.onerror = (): void => {
      if (closed) {
        return;
      }
      if (es.readyState === EventSource.CONNECTING) {
        setStatus("connecting");
        return;
      }
      setStatus("disconnected");
      source?.close();
      source = null;
      scheduleReconnect();
    };
  };

  const connect = (): void => {
    if (closed || typeof EventSource === "undefined") {
      return;
    }
    setStatus("connecting");
    source?.close();
    source = new EventSource(options.url, { withCredentials: options.withCredentials });
    attachListeners(source);
  };

  connect();

  return {
    close: (): void => {
      closed = true;
      clearReconnectTimer();
      source?.close();
      source = null;
      setStatus("disconnected");
    },
  };
}
