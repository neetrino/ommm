"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  PackageManualPaymentModal,
  type PackageManualPaymentPlan,
} from "@/components/account/package-manual-payment-modal";
import { OmmButton } from "@/components/ui/omm-button";

type Props = {
  plan: PackageManualPaymentPlan;
  locale: string;
  label?: string;
};

export function PackageCheckoutButton({ plan, locale, label }: Props) {
  const t = useTranslations("forms.packageCheckout");
  const [open, setOpen] = useState(false);
  const cta = label ?? t("subscribe");

  return (
    <>
      <OmmButton
        type="button"
        variant="primary"
        onClick={() => setOpen(true)}
      >
        {cta}
      </OmmButton>
      <PackageManualPaymentModal
        isOpen={open}
        onClose={() => setOpen(false)}
        plan={plan}
        locale={locale}
      />
    </>
  );
}
