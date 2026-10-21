"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";

const RESTORE_BUTTON_CLASS =
  "inline-flex h-9 cursor-pointer items-center rounded-full border border-white/70 bg-white/80 px-3 text-sm text-sage-800 shadow-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-50";

type AdminClientRestoreActionProps = {
  clientId: string;
  onRestored?: () => void;
  onStatusMessage?: (message: string, tone: "ok" | "err") => void;
};

export function AdminClientRestoreAction({
  clientId,
  onRestored,
  onStatusMessage,
}: AdminClientRestoreActionProps) {
  const t = useTranslations("adminPages.clients");
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function restore(): Promise<void> {
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      await apiFetch(`/clients/${clientId}/restore`, { method: "POST" });
      onStatusMessage?.(t("restoreSuccess"), "ok");
      onRestored?.();
      router.refresh();
    } catch (error) {
      onStatusMessage?.(
        error instanceof ApiError ? error.message : t("genericError"),
        "err",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className={RESTORE_BUTTON_CLASS}
      disabled={busy}
      onClick={() => {
        void restore();
      }}
    >
      {busy ? t("restoring") : t("restoreClient")}
    </button>
  );
}
