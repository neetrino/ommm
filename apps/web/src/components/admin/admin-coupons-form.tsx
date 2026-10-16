"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import {
  AudienceSection,
  CodeSection,
  DiscountSection,
  LimitsSection,
  ScheduleSection,
} from "@/components/admin/admin-coupon-form-sections";
import {
  couponDraftFromRow,
  couponPayloadFromDraft,
  type CouponDraft,
} from "@/components/admin/admin-coupon-form.util";
import type { AdminCouponRow } from "@/components/admin/admin-coupons-types";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";

type AdminCouponsFormProps = {
  editing: AdminCouponRow | null;
  onSaved: () => void;
  onCancel: () => void;
};

export function AdminCouponsForm({ editing, onSaved, onCancel }: AdminCouponsFormProps) {
  const t = useTranslations("adminPages.coupons");
  const [draft, setDraft] = useState<CouponDraft>(() => couponDraftFromRow(editing));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.getElementById("coupon-editor")?.scrollIntoView({ block: "start" });
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await apiFetch(editing ? `/coupons/${editing.id}` : "/coupons", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(couponPayloadFromDraft(draft)),
      });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("loadFailed"));
    } finally {
      setBusy(false);
    }
  }

  function patch(next: Partial<CouponDraft>) {
    setDraft({ ...draft, ...next });
  }

  const title = draft.code.trim().length > 0 ? draft.code.trim().toUpperCase() : t("newCoupon");

  return (
    <form
      id="coupon-editor"
      onSubmit={(event) => void save(event)}
      className="flex flex-col gap-4 rounded-3xl border border-sand-200/80 bg-white/90 p-5 shadow-[0_16px_36px_-24px_rgba(45,40,35,0.28)] sm:p-6"
    >
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sage-500">
          {editing ? t("edit") : t("newCoupon")}
        </p>
        <h2 className="mt-1 font-serif text-3xl tracking-wide text-sage-900">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm text-sage-600">{t("formLead")}</p>
      </header>
      <CodeSection draft={draft} t={t} onChange={(code) => patch({ code })} />
      <DiscountSection draft={draft} t={t} onPatch={patch} />
      <ScheduleSection draft={draft} t={t} onPatch={patch} />
      <LimitsSection draft={draft} t={t} onPatch={patch} />
      <AudienceSection draft={draft} t={t} onPatch={patch} />
      {error ? <p className="text-sm text-red-800" role="alert">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <OmmButton type="submit" disabled={busy}>{editing ? t("save") : t("createDraft")}</OmmButton>
        <OmmButton type="button" variant="secondary" onClick={onCancel}>{t("cancel")}</OmmButton>
      </div>
    </form>
  );
}

