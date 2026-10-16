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
  TextField,
  TypeChoice,
  UnitField,
} from "@/components/admin/admin-coupon-form-controls";

type CouponCopy = ReturnType<typeof useTranslations<"adminPages.coupons">>;

export function CodeSection({ draft, t, onChange }: { draft: CouponDraft; t: CouponCopy; onChange: (code: string) => void }) {
  return (
    <FormSection icon={<CouponTicketIcon />} title={t("sectionCode")} mark={t("requiredMark")} required hint={t("codeHint")}>
      <TextField label={t("code")} value={draft.code} required uppercase placeholder={t("codePlaceholder")} onChange={onChange} />
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
      hint={fixed ? t("fixedHint") : t("percentHint")}
    >
      <div className="grid gap-2 sm:grid-cols-2">
        <TypeChoice
          selected={!fixed}
          sign="%"
          label={t("percentage")}
          onClick={() => onPatch({ discountType: "PERCENTAGE" })}
        />
        <TypeChoice
          selected={fixed}
          sign={AMD_SYMBOL}
          label={t("fixed")}
          onClick={() => onPatch({ discountType: "FIXED_AMOUNT" })}
        />
      </div>
      <UnitField
        label={t("value")}
        value={draft.discountValue}
        unit={fixed ? AMD_SYMBOL : "%"}
        onChange={(discountValue) => onPatch({ discountValue })}
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
    <FormSection icon={<CouponCalendarIcon />} title={t("sectionSchedule")} mark={t("optionalMark")} hint={t("scheduleHint")}>
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
    <FormSection icon={<CouponLimitIcon />} title={t("sectionLimits")} mark={t("optionalMark")} hint={t("limitsHint")}>
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
    <div className="grid gap-4 lg:grid-cols-2">
      <FormSection icon={<CouponPeopleIcon />} title={t("sectionPeople")} mark={t("optionalMark")} hint={draft.eligibleAllUsers ? undefined : t("emailsHint")}>
        <CheckRow checked={draft.eligibleAllUsers} label={t("allUsers")} offLabel={t("selectedUsers")} onChange={(eligibleAllUsers) => onPatch({ eligibleAllUsers })} />
        {draft.eligibleAllUsers ? null : (
          <TextField label={t("emails")} value={draft.emails} placeholder="helen@studio.com, satenik@studio.com" onChange={(emails) => onPatch({ emails })} />
        )}
      </FormSection>
      <FormSection icon={<CouponBagIcon />} title={t("sectionProducts")} mark={t("optionalMark")} hint={draft.eligibleAllProducts ? undefined : t("productsHint")}>
        <CheckRow checked={draft.eligibleAllProducts} label={t("allProducts")} offLabel={t("products")} onChange={(eligibleAllProducts) => onPatch({ eligibleAllProducts })} />
        {draft.eligibleAllProducts ? null : (
          <ProductPicker
            kinds={draft.kinds}
            packagePlanId={draft.packagePlanId}
            planLabel={t("packagePlan")}
            planHint={t("planHint")}
            kindLabel={(kind) => t(`kind.${kind}`)}
            onKinds={(kinds) => onPatch({ kinds })}
            onPlan={(packagePlanId) => onPatch({ packagePlanId })}
          />
        )}
      </FormSection>
    </div>
  );
}

