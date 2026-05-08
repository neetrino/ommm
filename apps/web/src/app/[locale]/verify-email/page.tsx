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
        <h1 className="font-serif text-xl font-semibold text-sage-800">
          Email verification
        </h1>
        <p className="ommm-body-muted mt-4">
          Missing token — open the link from your email.
        </p>
        <p className="mt-8">
          <Link href="/login" className="ommm-cta-primary inline-flex text-sm">
            Log in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-xl font-semibold text-sage-800">
        Email verification
      </h1>
      <p className="ommm-body-muted mt-4">{msg ?? "Verifying…"}</p>
      {msg ? (
        <p className="mt-8">
          <Link href="/login" className="ommm-cta-primary inline-flex text-sm">
            Log in
          </Link>
        </p>
      ) : null}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center ommm-bg-auth px-4 py-12">
      <div className="ommm-card w-full max-w-md p-6 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-8">
        <Suspense fallback={<p className="text-sm text-sage-500">Loading…</p>}>
          <VerifyInner />
        </Suspense>
      </div>
    </div>
  );
}
