"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  couponDraftFromRow,
  couponPayloadFromDraft,
  type CouponDraft,
} from "@/components/admin/admin-coupon-form.util";
import type { AdminCouponRow, CouponProductKind } from "@/components/admin/admin-coupons-types";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";

const KINDS: CouponProductKind[] = ["PACKAGE", "DROPIN", "GIFT", "BAR", "OTHER"];

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

  async function save(event: React.FormEvent) {
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

  return (
    <form
      id="coupon-editor"
      onSubmit={(event) => void save(event)}
      className="rounded-3xl border border-sand-200/80 bg-white/90 p-5 shadow-[0_16px_36px_-24px_rgba(45,40,35,0.28)] sm:p-6"
    >
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sage-500">
          {editing ? t("edit") : t("newCoupon")}
        </p>
        <h2 className="mt-1 font-serif text-3xl text-sage-900">{editing?.code || t("code")}</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("code")} value={draft.code} uppercase onChange={(code) => setDraft({ ...draft, code })} />
        <SelectField
          label={t("type")}
          value={draft.discountType}
          onChange={(discountType) => setDraft({ ...draft, discountType })}
          options={[
            { id: "PERCENTAGE", label: t("percentage") },
            { id: "FIXED_AMOUNT", label: t("fixed") },
          ]}
        />
        <Field label={t("value")} value={draft.discountValue} onChange={(discountValue) => setDraft({ ...draft, discountValue })} />
        <Field label={t("validFrom")} value={draft.validFrom} type="datetime-local" onChange={(validFrom) => setDraft({ ...draft, validFrom })} />
        <Field label={t("validUntil")} value={draft.validUntil} type="datetime-local" onChange={(validUntil) => setDraft({ ...draft, validUntil })} />
        <Field label={t("totalLimit")} value={draft.totalUsageLimit} onChange={(totalUsageLimit) => setDraft({ ...draft, totalUsageLimit })} />
        <Field label={t("perUserLimit")} value={draft.usageLimitPerUser} onChange={(usageLimitPerUser) => setDraft({ ...draft, usageLimitPerUser })} />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <CheckRow checked={draft.eligibleAllUsers} label={t("allUsers")} onChange={(eligibleAllUsers) => setDraft({ ...draft, eligibleAllUsers })} />
        <CheckRow checked={draft.eligibleAllProducts} label={t("allProducts")} onChange={(eligibleAllProducts) => setDraft({ ...draft, eligibleAllProducts })} />
      </div>
      {draft.eligibleAllUsers ? null : (
        <div className="mt-4">
          <Field label={t("emails")} value={draft.emails} onChange={(emails) => setDraft({ ...draft, emails })} />
        </div>
      )}
      {draft.eligibleAllProducts ? null : (
        <ProductPicker
          kinds={draft.kinds}
          packagePlanId={draft.packagePlanId}
          productsLabel={t("products")}
          planLabel={t("packagePlan")}
          kindLabel={(kind) => t(`kind.${kind}`)}
          onKinds={(kinds) => setDraft({ ...draft, kinds })}
          onPlan={(packagePlanId) => setDraft({ ...draft, packagePlanId })}
        />
      )}
      {error ? <p className="mt-4 text-sm text-red-800" role="alert">{error}</p> : null}
      <div className="mt-5 flex flex-wrap gap-2">
        <OmmButton type="submit" disabled={busy}>
          {editing ? t("save") : t("createDraft")}
        </OmmButton>
        <OmmButton type="button" variant="secondary" onClick={onCancel}>
          {t("cancel")}
        </OmmButton>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  uppercase = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  uppercase?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="ommm-label text-xs uppercase tracking-wide">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`ommm-input ${uppercase ? "uppercase" : ""}`}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: "PERCENTAGE" | "FIXED_AMOUNT";
  onChange: (value: "PERCENTAGE" | "FIXED_AMOUNT") => void;
  options: { id: "PERCENTAGE" | "FIXED_AMOUNT"; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="ommm-label text-xs uppercase tracking-wide">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as "PERCENTAGE" | "FIXED_AMOUNT")}
        className="ommm-input"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function CheckRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-sand-200/80 bg-sand-50/70 px-4 py-3 text-sm text-sage-800">
      <input
        type="checkbox"
        checked={checked}
        className="size-4 accent-sage-800"
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}

function ProductPicker({
  kinds,
  packagePlanId,
  productsLabel,
  planLabel,
  kindLabel,
  onKinds,
  onPlan,
}: {
  kinds: CouponProductKind[];
  packagePlanId: string;
  productsLabel: string;
  planLabel: string;
  kindLabel: (kind: CouponProductKind) => string;
  onKinds: (kinds: CouponProductKind[]) => void;
  onPlan: (value: string) => void;
}) {
  return (
    <div className="mt-4 flex flex-col gap-3">
      <span className="ommm-label text-xs uppercase tracking-wide">{productsLabel}</span>
      <div className="flex flex-wrap gap-2">
        {KINDS.map((kind) => {
          const selected = kinds.includes(kind);
          return (
            <button
              key={kind}
              type="button"
              className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                selected ? "bg-sage-900 text-white" : "border border-sand-200 bg-white text-sage-700"
              }`}
              onClick={() => onKinds(selected ? kinds.filter((item) => item !== kind) : [...kinds, kind])}
            >
              {kindLabel(kind)}
            </button>
          );
        })}
      </div>
      <Field label={planLabel} value={packagePlanId} onChange={onPlan} />
    </div>
  );
}

