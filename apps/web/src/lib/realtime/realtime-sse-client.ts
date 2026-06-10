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

/**
 * Native EventSource wrapper — does not permanently close on transient `onerror`.
 * Intentional shutdown only via {@link RealtimeSseClientHandle.close}.
 */
export function createRealtimeSseClient(
  options: RealtimeSseClientOptions,
): RealtimeSseClientHandle {
  let closed = false;
  let source: EventSource | null = null;

  const setStatus = (status: RealtimeConnectionStatus): void => {
    options.onStatusChange(status);
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
      if (es.readyState === EventSource.CLOSED) {
        setStatus("disconnected");
        return;
      }
      setStatus("disconnected");
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
      source?.close();
      source = null;
      setStatus("disconnected");
    },
  };
}
