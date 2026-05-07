"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";

function VerifyInner() {
  const search = useSearchParams();
  const token = search.get("token");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        await apiFetch("/auth/verify-email", {
          method: "POST",
          body: JSON.stringify({ token }),
        });
        if (!cancelled) {
          setMsg("Email verified. You can log in.");
        }
      } catch (e) {
        if (!cancelled) {
          setMsg(e instanceof ApiError ? e.message : "Verification failed");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!token) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">
          Email verification
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-zinc-700">
          Missing token — open the link from your email.
        </p>
        <p className="mt-8">
          <Link href="/login" className="app-btn-primary inline-flex text-sm">
            Log in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-zinc-900">Email verification</h1>
      <p className="mt-4 text-sm leading-relaxed text-zinc-700">
        {msg ?? "Verifying…"}
      </p>
      {msg ? (
        <p className="mt-8">
          <Link href="/login" className="app-btn-primary inline-flex text-sm">
            Log in
          </Link>
        </p>
      ) : null}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="app-surface-card w-full max-w-md p-6 sm:p-8">
        <Suspense
          fallback={
            <p className="text-sm text-zinc-500">Loading…</p>
          }
        >
          <VerifyInner />
        </Suspense>
      </div>
    </div>
  );
}
