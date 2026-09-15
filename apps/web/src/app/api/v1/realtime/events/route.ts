import { proxyRealtimeSse } from "@/lib/realtime/proxy-realtime-sse";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

/**
 * Authenticated SSE — static path so Next afterFiles rewrites do not steal it
 * from a dynamic `[channel]` segment.
 */
export async function GET(request: NextRequest): Promise<Response> {
  return proxyRealtimeSse(request, "events");
}
