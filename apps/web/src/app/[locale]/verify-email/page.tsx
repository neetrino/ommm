"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";

function VerifyInner() {
  const t = useTranslations("verifyEmail");
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
          setMsg(t("success"));
        }
      } catch (e) {
        if (!cancelled) {
          setMsg(e instanceof ApiError ? e.message : t("verificationFailed"));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, t]);

  if (!token) {
    return (
      <div>
        <h1 className="font-serif text-xl font-semibold text-sage-800">
          {t("title")}
        </h1>
        <p className="ommm-body-muted mt-4">{t("missingToken")}</p>
        <p className="mt-8">
          <Link href="/login" className="ommm-cta-primary inline-flex text-sm">
            {t("logInCta")}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-xl font-semibold text-sage-800">
        {t("title")}
      </h1>
      <p className="ommm-body-muted mt-4">{msg ?? t("verifying")}</p>
      {msg ? (
        <p className="mt-8">
          <Link href="/login" className="ommm-cta-primary inline-flex text-sm">
            {t("logInCta")}
          </Link>
        </p>
      ) : null}
    </div>
  );
}

export default function VerifyEmailPage() {
  const t = useTranslations("verifyEmail");
  return (
    <div className="flex min-h-screen items-center justify-center ommm-bg-auth px-4 py-12">
      <div className="ommm-card w-full max-w-md p-6 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-8">
        <Suspense fallback={<p className="text-sm text-sage-500">{t("loading")}</p>}>
          <VerifyInner />
        </Suspense>
      </div>
    </div>
  );
}
