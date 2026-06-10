import {
  REALTIME_SSE_EVENT_NAMES,
  type ParsedRealtimeEvent,
  type RealtimeEventName,
} from "@/lib/realtime/realtime-event-types";

function isRealtimeEventName(value: string): value is RealtimeEventName {
  return (REALTIME_SSE_EVENT_NAMES as readonly string[]).includes(value);
}

/** Parses SSE `MessageEvent` payload from the API thin-event stream. */
export function parseRealtimeMessageEvent(event: MessageEvent<string>): ParsedRealtimeEvent | null {
  if (!isRealtimeEventName(event.type)) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(event.data);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return null;
    }
    return {
      type: event.type,
      data: parsed as Record<string, unknown>,
    };
  } catch {
    return null;
  }
}
