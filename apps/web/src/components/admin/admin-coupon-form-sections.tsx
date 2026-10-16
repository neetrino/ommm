"use client";

import type { useTranslations } from "next-intl";
import {
  CouponBagIcon,
  CouponCalendarIcon,
  CouponLimitIcon,
  CouponPeopleIcon,
  CouponPercentIcon,
  CouponTicketIcon,
} from "@/components/admin/admin-coupon-form-icons";
import type { CouponDraft } from "@/components/admin/admin-coupon-form.util";
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
    <FormSection icon={<CouponTicketIcon />} title={t("sectionCode")} mark={t("requiredMark")} required>
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
      mark={t("requiredMark")}
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

export function ScheduleSection({
  draft,
  t,
  onPatch,
}: {
  draft: CouponDraft;
  t: CouponCopy;
  onPatch: (next: Partial<CouponDraft>) => void;
}) {
  return (
    <FormSection icon={<CouponCalendarIcon />} title={t("sectionSchedule")} mark={t("optionalMark")}>
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField label={t("validFrom")} type="datetime-local" value={draft.validFrom} onChange={(validFrom) => onPatch({ validFrom })} />
        <TextField label={t("validUntil")} type="datetime-local" value={draft.validUntil} onChange={(validUntil) => onPatch({ validUntil })} />
      </div>
    </FormSection>
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
    <FormSection icon={<CouponLimitIcon />} title={t("sectionLimits")} mark={t("optionalMark")}>
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField label={t("totalLimit")} value={draft.totalUsageLimit} placeholder={t("limitPlaceholder")} onChange={(totalUsageLimit) => onPatch({ totalUsageLimit })} />
        <TextField label={t("perUserLimit")} value={draft.usageLimitPerUser} placeholder={t("limitPlaceholder")} onChange={(usageLimitPerUser) => onPatch({ usageLimitPerUser })} />
      </div>
    </FormSection>
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
      <FormSection icon={<CouponPeopleIcon />} title={t("sectionPeople")} mark={t("optionalMark")}>
        <CheckRow checked={draft.eligibleAllUsers} label={t("allUsers")} offLabel={t("selectedUsers")} onChange={(eligibleAllUsers) => onPatch({ eligibleAllUsers })} />
        {draft.eligibleAllUsers ? null : (
          <TextField label={t("emails")} value={draft.emails} placeholder="helen@studio.com, satenik@studio.com" onChange={(emails) => onPatch({ emails })} />
        )}
      </FormSection>
      <FormSection icon={<CouponBagIcon />} title={t("sectionProducts")} mark={t("optionalMark")}>
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

