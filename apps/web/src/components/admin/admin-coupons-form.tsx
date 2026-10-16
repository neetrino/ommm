"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { AdminCouponRow, CouponProductKind } from "@/components/admin/admin-coupons-types";
import { ApiError, apiFetch } from "@/lib/api";

const KINDS: CouponProductKind[] = ["PACKAGE", "DROPIN", "GIFT", "BAR", "OTHER"];

type AdminCouponsFormProps = {
  editing: AdminCouponRow | null;
  onSaved: () => void;
  onCancel: () => void;
};

export function AdminCouponsForm({ editing, onSaved, onCancel }: AdminCouponsFormProps) {
  const t = useTranslations("adminPages.coupons");
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("10");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [totalUsageLimit, setTotalUsageLimit] = useState("");
  const [usageLimitPerUser, setUsageLimitPerUser] = useState("");
  const [eligibleAllUsers, setEligibleAllUsers] = useState(true);
  const [emails, setEmails] = useState("");
  const [eligibleAllProducts, setEligibleAllProducts] = useState(true);
  const [kinds, setKinds] = useState<CouponProductKind[]>([]);
  const [packagePlanId, setPackagePlanId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setCode(editing?.code ?? "");
    setDiscountType(editing?.discountType ?? "PERCENTAGE");
    setDiscountValue(String(editing?.discountValue ?? 10));
    setValidFrom(toLocalInput(editing?.validFrom));
    setValidUntil(toLocalInput(editing?.validUntil));
    setTotalUsageLimit(editing?.totalUsageLimit?.toString() ?? "");
    setUsageLimitPerUser(editing?.usageLimitPerUser?.toString() ?? "");
    setEligibleAllUsers(editing?.eligibleAllUsers ?? true);
    setEmails(editing?.eligibleUsers.map((user) => user.email).join(", ") ?? "");
    setEligibleAllProducts(editing?.eligibleAllProducts ?? true);
    setKinds(editing?.eligibleProducts.map((row) => row.kind) ?? []);
    setPackagePlanId(editing?.eligibleProducts.find((row) => row.packagePlanId)?.packagePlanId ?? "");
    setError(null);
  }, [editing]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await apiFetch(editing ? `/coupons/${editing.id}` : "/coupons", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(payload()),
      });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("loadFailed"));
    } finally {
      setBusy(false);
    }
  }

  function payload() {
    const products = kinds.map((kind) => ({
      kind,
      ...(kind === "PACKAGE" && packagePlanId.trim() ? { packagePlanId: packagePlanId.trim() } : {}),
    }));
    return {
      code,
      discountType,
      discountValue: Number(discountValue),
      ...(validFrom ? { validFrom: new Date(validFrom).toISOString() } : {}),
      ...(validUntil ? { validUntil: new Date(validUntil).toISOString() } : {}),
      ...(totalUsageLimit ? { totalUsageLimit: Number(totalUsageLimit) } : {}),
      ...(usageLimitPerUser ? { usageLimitPerUser: Number(usageLimitPerUser) } : {}),
      eligibleAllUsers,
      eligibleEmails: emails.split(/[,\s]+/).filter(Boolean),
      eligibleAllProducts,
      eligibleProducts: products,
    };
  }

  return (
    <form onSubmit={(event) => void save(event)} className="grid gap-3 rounded-2xl border border-black/10 bg-white p-4 md:grid-cols-2">
      <Field label={t("code")} value={code} onChange={setCode} />
      <label className="flex flex-col gap-1 text-sm">
        {t("type")}
        <select className="rounded-xl border border-black/10 px-3 py-2" value={discountType} onChange={(event) => setDiscountType(event.target.value as "PERCENTAGE" | "FIXED_AMOUNT")}>
          <option value="PERCENTAGE">{t("percentage")}</option>
          <option value="FIXED_AMOUNT">{t("fixed")}</option>
        </select>
      </label>
      <Field label={t("value")} value={discountValue} onChange={setDiscountValue} />
      <Field label={t("validFrom")} value={validFrom} onChange={setValidFrom} type="datetime-local" />
      <Field label={t("validUntil")} value={validUntil} onChange={setValidUntil} type="datetime-local" />
      <Field label={t("totalLimit")} value={totalUsageLimit} onChange={setTotalUsageLimit} />
      <Field label={t("perUserLimit")} value={usageLimitPerUser} onChange={setUsageLimitPerUser} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={eligibleAllUsers} onChange={(event) => setEligibleAllUsers(event.target.checked)} />
        {t("allUsers")}
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={eligibleAllProducts} onChange={(event) => setEligibleAllProducts(event.target.checked)} />
        {t("allProducts")}
      </label>
      {!eligibleAllUsers ? <Field label={t("emails")} value={emails} onChange={setEmails} /> : null}
      {!eligibleAllProducts ? (
        <div className="flex flex-col gap-2 text-sm md:col-span-2">
          <span>{t("products")}</span>
          <div className="flex flex-wrap gap-3">
            {KINDS.map((kind) => (
              <label key={kind} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={kinds.includes(kind)}
                  onChange={(event) => setKinds((current) => event.target.checked ? [...current, kind] : current.filter((item) => item !== kind))}
                />
                {t(`kind.${kind}`)}
              </label>
            ))}
          </div>
          <Field label={t("packagePlan")} value={packagePlanId} onChange={setPackagePlanId} />
        </div>
      ) : null}
      {error ? <p className="text-sm text-red-800 md:col-span-2" role="alert">{error}</p> : null}
      <div className="flex gap-2 md:col-span-2">
        <button type="submit" disabled={busy} className="rounded-xl bg-sage-900 px-4 py-2 text-sm text-white disabled:opacity-50">{editing ? t("save") : t("createDraft")}</button>
        {editing ? <button type="button" className="text-sm underline" onClick={onCancel}>{t("cancel")}</button> : null}
      </div>
    </form>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-black/10 px-3 py-2" />
    </label>
  );
}

function toLocalInput(value: string | null | undefined): string {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
