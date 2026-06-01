import { NextRequest, NextResponse } from "next/server";

const HEALTH_PATH = "/v1/health";

function resolveApiBase(): string | null {
  const raw =
    process.env.API_INTERNAL_URL?.trim() ??
    process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!raw) {
    return null;
  }
  return raw.replace(/\/$/, "");
}

/** Keeps Render API warm; hits `/v1/health` only (no database). */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET not set" }, { status: 503 });
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const apiBase = resolveApiBase();
  if (!apiBase) {
    return NextResponse.json({ ok: false, error: "API URL not configured" }, { status: 503 });
  }

  try {
    const res = await fetch(`${apiBase}${HEALTH_PATH}`, { cache: "no-store" });
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      warmedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Warm request failed" }, { status: 502 });
  }
}
