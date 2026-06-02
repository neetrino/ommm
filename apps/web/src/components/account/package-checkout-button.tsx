"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";

type Props = {
  planId: string;
  label?: string;
};

export function PackageCheckoutButton({ planId, label }: Props) {
  const t = useTranslations("forms.packageCheckout");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const cta = label ?? t("subscribe");

  async function checkout() {
    setBusy(true);
    setMsg(null);
    try {
      const { url } = await apiFetch<{ url: string | null }>(
        `/payments/checkout/package/${planId}`,
        { method: "POST" },
      );
      if (url) {
        window.location.href = url;
        return;
      }
      setMsg(t("checkoutUnavailable"));
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : t("checkoutFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <OmmButton
        type="button"
        variant="primary"
        disabled={busy}
        onClick={() => void checkout()}
      >
        {cta}
      </OmmButton>
      {msg ? <p className="text-xs text-amber-900">{msg}</p> : null}
    </div>
  );
}
