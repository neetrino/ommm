"use client";

import type { useTranslations } from "next-intl";
import {
  CouponBagIcon,
  CouponPeopleIcon,
  CouponPercentIcon,
  CouponTicketIcon,
} from "@/components/admin/admin-coupon-form-icons";
import type { CouponDraft } from "@/components/admin/admin-coupon-form.util";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { AMD_SYMBOL } from "@/lib/price-amd";
import {
  CheckRow,
  FormSection,
  ProductPicker,
  DiscountAmountField,
  TextField,
} from "@/components/admin/admin-coupon-form-controls";

type CouponCopy = ReturnType<typeof useTranslations<"adminPages.coupons">>;

export function CodeSection({ draft, t, onChange }: { draft: CouponDraft; t: CouponCopy; onChange: (code: string) => void }) {
  return (
    <FormSection icon={<CouponTicketIcon />} title={t("sectionCode")} required>
      <TextField ariaLabel={t("code")} value={draft.code} required uppercase placeholder={t("codePlaceholder")} onChange={onChange} />
    </FormSection>
  );
}

export function DiscountSection({
  draft,
  t,
  onPatch,
}: {
  draft: CouponDraft;
  t: CouponCopy;
  onPatch: (next: Partial<CouponDraft>) => void;
}) {
  const fixed = draft.discountType === "FIXED_AMOUNT";
  return (
    <FormSection
      icon={<CouponPercentIcon />}
      title={t("sectionDiscount")}
      required
    >
      <DiscountAmountField
        ariaLabel={t("value")}
        value={draft.discountValue}
        fixed={fixed}
        percentLabel={t("percentage")}
        amountLabel={t("fixed")}
        amountSign={AMD_SYMBOL}
        onValue={(discountValue) => onPatch({ discountValue })}
        onFixed={(next) => onPatch({ discountType: next ? "FIXED_AMOUNT" : "PERCENTAGE" })}
      />
    </FormSection>
  );
}

export function DatesSection({
  draft,
  t,
  onPatch,
}: {
  draft: CouponDraft;
  t: CouponCopy;
  onPatch: (next: Partial<CouponDraft>) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        <DateField label={t("fromShort")} name="validFrom" value={draft.validFrom} onChange={(validFrom) => onPatch({ validFrom })} />
        <DateField label={t("untilShort")} name="validUntil" value={draft.validUntil} onChange={(validUntil) => onPatch({ validUntil })} />
      </div>
      <p className="text-xs text-sage-500">{t("scheduleHint")}</p>
    </div>
  );
}

export function LimitsSection({
  draft,
  t,
  onPatch,
}: {
  draft: CouponDraft;
  t: CouponCopy;
  onPatch: (next: Partial<CouponDraft>) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        <TextField label={t("totalShort")} value={draft.totalUsageLimit} placeholder={t("limitPlaceholder")} onChange={(totalUsageLimit) => onPatch({ totalUsageLimit })} />
        <TextField label={t("eachShort")} value={draft.usageLimitPerUser} placeholder={t("limitPlaceholder")} onChange={(usageLimitPerUser) => onPatch({ usageLimitPerUser })} />
      </div>
      <p className="text-xs text-sage-500">{t("limitsHint")}</p>
    </div>
  );
}

function DateField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="ommm-label text-xs uppercase tracking-wide">{label}</span>
      <DatePickerInput name={name} ariaLabel={label} value={value} onChange={onChange} placeholder="" />
    </label>
  );
}

export function AudienceSection({
  draft,
  t,
  onPatch,
}: {
  draft: CouponDraft;
  t: CouponCopy;
  onPatch: (next: Partial<CouponDraft>) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <FormSection icon={<CouponPeopleIcon />} title={t("sectionPeople")}>
        <CheckRow checked={draft.eligibleAllUsers} label={t("allUsers")} offLabel={t("selectedUsers")} onChange={(eligibleAllUsers) => onPatch({ eligibleAllUsers })} />
        {draft.eligibleAllUsers ? null : (
          <TextField label={t("emails")} value={draft.emails} placeholder="helen@studio.com, satenik@studio.com" onChange={(emails) => onPatch({ emails })} />
        )}
      </FormSection>
      <FormSection icon={<CouponBagIcon />} title={t("sectionProducts")}>
        <CheckRow checked={draft.eligibleAllProducts} label={t("allProducts")} offLabel={t("products")} onChange={(eligibleAllProducts) => onPatch({ eligibleAllProducts })} />
        {draft.eligibleAllProducts ? null : (
          <ProductPicker
            kinds={draft.kinds}
            packagePlanId={draft.packagePlanId}
            planLabel={t("packagePlan")}
            kindLabel={(kind) => t(`kind.${kind}`)}
            onKinds={(kinds) => onPatch({ kinds })}
            onPlan={(packagePlanId) => onPatch({ packagePlanId })}
          />
        )}
      </FormSection>
    </div>
  );
}

