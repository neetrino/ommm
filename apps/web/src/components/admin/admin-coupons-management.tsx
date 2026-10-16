"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminCouponCard } from "@/components/admin/admin-coupon-card";
import { AdminCouponListRow } from "@/components/admin/admin-coupon-list-row";
import { AdminCouponsForm } from "@/components/admin/admin-coupons-form";
import {
  AdminCouponsViewSwitcher,
  type CouponViewMode,
} from "@/components/admin/admin-coupons-view-switcher";
import type { AdminCouponRow } from "@/components/admin/admin-coupons-types";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";

export function AdminCouponsManagement({ canDelete }: { canDelete: boolean }) {
  const t = useTranslations("adminPages.coupons");
  const [rows, setRows] = useState<AdminCouponRow[]>([]);
  const [editing, setEditing] = useState<AdminCouponRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<CouponViewMode>("board");
  const showForm = creating || editing !== null;

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
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  function openCoupon(row: AdminCouponRow) {
    setCreating(false);
    setEditing(row);
  }

  async function act(path: string, method: "POST" | "DELETE") {
    setError(null);
    try {
      await apiFetch(path, { method });
      setEditing(null);
      setCreating(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("loadFailed"));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <AdminCouponsViewSwitcher value={view} onChange={setView} />
        <OmmButton
          onClick={() => {
            setEditing(null);
            setCreating(true);
          }}
        >
          {t("newCoupon")}
        </OmmButton>
      </div>
      {showForm ? (
        <AdminCouponsForm
          key={editing?.id ?? "create"}
          editing={editing}
          canDelete={canDelete}
          onCancel={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSaved={() => {
            setEditing(null);
            setCreating(false);
            void load();
          }}
          onDelete={() => {
            if (editing === null) {
              return;
            }
            void act(`/coupons/${editing.id}`, "DELETE");
          }}
        />
      ) : null}
      {error ? <p className="text-sm text-red-800" role="alert">{error}</p> : null}
      {loading ? <p className="text-sm text-sage-600">{t("loading")}</p> : null}
      {!loading && rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-sand-300 bg-white/70 px-6 py-10 text-center text-sm text-sage-600">
          {t("empty")}
        </p>
      ) : null}
      {view === "board" ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => (
            <li key={row.id}>
              <AdminCouponCard
                row={row}
                selected={editing?.id === row.id}
                onEdit={() => openCoupon(row)}
                onActivate={() => void act(`/coupons/${row.id}/activate`, "POST")}
                onDisable={() => void act(`/coupons/${row.id}/disable`, "POST")}
              />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((row) => (
            <li key={row.id}>
              <AdminCouponListRow
                row={row}
                selected={editing?.id === row.id}
                onEdit={() => openCoupon(row)}
                onActivate={() => void act(`/coupons/${row.id}/activate`, "POST")}
                onDisable={() => void act(`/coupons/${row.id}/disable`, "POST")}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
