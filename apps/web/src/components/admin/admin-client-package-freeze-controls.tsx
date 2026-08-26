"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { ClientSheetPackageItem } from "@/components/admin/admin-clients-types";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";
import { normalizeUserPackageFreeze } from "@/lib/user-package-freeze";

type AdminClientPackageFreezeControlsProps = {
  item: ClientSheetPackageItem;
  onSuccess: (message: string) => void;
};

export function AdminClientPackageFreezeControls({
  item,
  onSuccess,
}: AdminClientPackageFreezeControlsProps) {
  const t = useTranslations("adminPages.clients.packages");
  const freeze = normalizeUserPackageFreeze(item.freeze);
  const [days, setDays] = useState(
    freeze.maxDaysPerUse > 0 ? String(freeze.maxDaysPerUse) : "1",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!freeze.canFreeze && !freeze.canUnfreeze) {
    return null;
  }

  async function run(path: "freeze" | "unfreeze") {
    setSubmitting(true);
    setError(null);
    const parsedDays = Number.parseInt(days, 10);
    try {
      await apiFetch(`/packages/admin/user-packages/${item.id}/${path}`, {
        method: "PATCH",
        ...(path === "freeze" ? { body: JSON.stringify({ days: parsedDays }) } : {}),
      });
      onSuccess(path === "freeze" ? t("freezeSuccess") : t("unfreezeSuccess"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("freezeError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-white/70 bg-white/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
        {t("freezeHeading")}
      </p>
      <p className="text-sm text-sage-700">
        {freeze.allowedCount > 0
          ? t("freezeRemaining", {
              remaining: freeze.remainingCount,
              allowed: freeze.allowedCount,
              days: freeze.maxDaysPerUse,
            })
          : t("freezeAdminOverrideHint")}
      </p>
      {freeze.canFreeze ? (
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex min-w-[7rem] flex-1 flex-col gap-1.5">
            <span className="ommm-label text-xs uppercase tracking-wide">
              {t("freezeDaysLabel")}
            </span>
            <input
              type="number"
              min={1}
              max={Math.max(1, freeze.maxDaysPerUse)}
              step={1}
              inputMode="numeric"
              value={days}
              disabled={submitting}
              onChange={(event) => setDays(event.target.value)}
              className="ommm-input [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </label>
          <OmmButton
            type="button"
            variant="secondary"
            disabled={submitting}
            onClick={() => void run("freeze")}
          >
            {t("freezeAction")}
          </OmmButton>
        </div>
      ) : null}
      {freeze.canUnfreeze ? (
        <OmmButton
          type="button"
          variant="primary"
          disabled={submitting}
          onClick={() => void run("unfreeze")}
        >
          {t("unfreezeAction")}
        </OmmButton>
      ) : null}
      {error !== null ? (
        <p className="text-xs text-rose-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
