"use client";

import { useTranslations } from "next-intl";
import cardStyles from "@/components/marketing/packages/packages-page-category-cards.module.css";
import { PackagesPageReveal } from "@/components/marketing/packages/packages-page-reveal";
import { useMarketingAudience } from "@/hooks/use-marketing-audience";

type PackagesPageLoginHintProps = {
  index: number;
};

export function PackagesPageLoginHint({ index }: PackagesPageLoginHintProps) {
  const m = useTranslations("marketing");
  const audience = useMarketingAudience();

  if (audience === "member") {
    return null;
  }

  return (
    <PackagesPageReveal index={index}>
      <p className={`${cardStyles.packagesPageLoginHint} mt-8 text-center text-xs text-sage-500`}>
        {m("packagesLoginHint")}
      </p>
    </PackagesPageReveal>
  );
}
