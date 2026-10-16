"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminCouponsForm } from "@/components/admin/admin-coupons-form";
import type { AdminCouponRow } from "@/components/admin/admin-coupons-types";
import { ApiError, apiFetch } from "@/lib/api";

export function AdminCouponsManagement({ canDelete }: { canDelete: boolean }) {
  const t = useTranslations("adminPages.coupons");
  const [rows, setRows] = useState<AdminCouponRow[]>([]);
  const [editing, setEditing] = useState<AdminCouponRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await apiFetch<AdminCouponRow[]>("/coupons"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function act(path: string, method: "POST" | "DELETE") {
    setError(null);
    try {
      await apiFetch(path, { method });
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("loadFailed"));
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <AdminCouponsForm
        editing={editing}
        onCancel={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          void load();
        }}
      />
      {error ? <p className="text-sm text-red-800" role="alert">{error}</p> : null}
      {loading ? <p className="text-sm text-sage-600">{t("loading")}</p> : null}
      {!loading && rows.length === 0 ? <p className="text-sm text-sage-600">{t("empty")}</p> : null}
      <ul className="flex flex-col gap-3">
        {rows.map((row) => (
          <li key={row.id} className="rounded-2xl border border-black/10 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-serif text-xl">{row.code}</p>
                <p className="text-sm text-sage-700">
                  {row.discountType === "PERCENTAGE" ? `${row.discountValue}%` : row.discountValue} · {t(`status.${row.displayStatus}`)}
                </p>
                <p className="text-xs text-sage-500">
                  {t("createdBy")} {personLabel(row.createdBy)} · {t("used")} {row.usedCount}
                  {row.remainingUses === null ? "" : ` · ${t("remaining")} ${row.remainingUses}`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="text-sm underline" onClick={() => setEditing(row)}>{t("edit")}</button>
                {row.status !== "ACTIVE" ? (
                  <button type="button" className="text-sm underline" onClick={() => void act(`/coupons/${row.id}/activate`, "POST")}>{t("activate")}</button>
                ) : (
                  <button type="button" className="text-sm underline" onClick={() => void act(`/coupons/${row.id}/disable`, "POST")}>{t("disable")}</button>
                )}
                {canDelete && row.status === "DRAFT" && row.usedCount === 0 ? (
                  <button type="button" className="text-sm text-red-800 underline" onClick={() => void act(`/coupons/${row.id}`, "DELETE")}>{t("delete")}</button>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function personLabel(person: { name: string | null; lastName: string | null; email: string }): string {
  const name = [person.name, person.lastName].filter(Boolean).join(" ");
  return name.length > 0 ? name : person.email;
}
