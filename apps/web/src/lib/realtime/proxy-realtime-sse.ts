import { ensureMonorepoEnvLoaded } from "@/lib/load-monorepo-env";
import type { NextRequest } from "next/server";

/** Allowed Nest SSE channels under `/v1/realtime/:channel`. */
export const REALTIME_SSE_CHANNELS = ["events", "public"] as const;

export type RealtimeSseChannel = (typeof REALTIME_SSE_CHANNELS)[number];

const SSE_PROXY_HEADERS: HeadersInit = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
  /** Prevent intermediary / Next compression buffering of the event stream. */
  "Content-Encoding": "identity",
};

function resolveApiBase(): string {
  ensureMonorepoEnvLoaded();
  const raw =
    process.env.API_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://127.0.0.1:4000";
  return raw.replace(/\/$/, "");
}

function isRealtimeSseChannel(value: string): value is RealtimeSseChannel {
  return (REALTIME_SSE_CHANNELS as readonly string[]).includes(value);
}

function buildUpstreamHeaders(request: NextRequest): Headers {
  const headers = new Headers();
  headers.set("accept", "text/event-stream");
  headers.set("cache-control", "no-cache");

  const cookie = request.headers.get("cookie");
  if (cookie !== null && cookie.length > 0) {
    headers.set("cookie", cookie);
  }

  const authorization = request.headers.get("authorization");
  if (authorization !== null && authorization.length > 0) {
    headers.set("authorization", authorization);
  }

  const lastEventId = request.headers.get("last-event-id");
  if (lastEventId !== null && lastEventId.length > 0) {
    headers.set("last-event-id", lastEventId);
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  if (forwardedFor !== null && forwardedFor.length > 0) {
    headers.set("x-forwarded-for", forwardedFor);
  } else if (realIp !== null && realIp.length > 0) {
    headers.set("x-forwarded-for", realIp);
  }

  const userAgent = request.headers.get("user-agent");
  if (userAgent !== null && userAgent.length > 0) {
    headers.set("user-agent", userAgent);
  }

  return headers;
}

function isClientAbort(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

/**
 * Same-origin SSE BFF: streams Nest `/v1/realtime/*` without Next rewrite buffering.
 * Keeps host-only session cookies on the storefront origin.
 */
export async function proxyRealtimeSse(
  request: NextRequest,
  channel: string,
): Promise<Response> {
  if (!isRealtimeSseChannel(channel)) {
    return new Response("Not Found", { status: 404 });
  }

  const upstreamUrl = `${resolveApiBase()}/v1/realtime/${channel}`;
  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method: "GET",
      headers: buildUpstreamHeaders(request),
      signal: request.signal,
      cache: "no-store",
    });
  } catch (error) {
    if (isClientAbort(error)) {
      return new Response(null, { status: 204 });
    }
    return new Response("Upstream realtime unavailable", { status: 502 });
  }

  if (!upstream.ok) {
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ?? "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  const upstreamBody = upstream.body;
  if (upstreamBody === null) {
    return new Response("Upstream realtime empty body", { status: 502 });
  }

  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  void upstreamBody.pipeTo(writable, { signal: request.signal }).catch((error: unknown) => {
    // Client disconnect or upstream reset — EventSource reconnects; do not rethrow.
    if (!isClientAbort(error) && process.env.NODE_ENV !== "production") {
      console.warn("[realtime-sse-proxy] upstream pipe ended", error);
    }
  });

  return new Response(readable, {
    status: 200,
    headers: SSE_PROXY_HEADERS,
  });
}
