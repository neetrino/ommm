"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";

function VerifyInner() {
  const search = useSearchParams();
  const token = search.get("token");
  const [msg, setMsg] = useState("Verifying…");

  useEffect(() => {
    if (!token) {
      setMsg("Missing token");
      return;
    }
    void (async () => {
      try {
        await apiFetch("/auth/verify-email", {
          method: "POST",
          body: JSON.stringify({ token }),
        });
        setMsg("Email verified. You can log in.");
      } catch (e) {
        setMsg(e instanceof ApiError ? e.message : "Verification failed");
      }
    })();
  }, [token]);

  return <p className="text-sm text-zinc-700">{msg}</p>;
}

export default function VerifyEmailPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
        <VerifyInner />
      </Suspense>
    </div>
  );
}
