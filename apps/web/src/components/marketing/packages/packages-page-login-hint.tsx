"use client";

import { useTranslations } from "next-intl";
import { PackagesPageReveal } from "@/components/marketing/packages/packages-page-reveal";
import { PackagesGuestHint } from "@/components/marketing/packages/packages-guest-hint";
import { resolvePackagesGuestHintCopy } from "@/components/marketing/packages/packages-guest-hint-copy";
import { useMarketingAudience } from "@/hooks/use-marketing-audience";

type PackagesPageLoginHintProps = {
  index: number;
};

export function PackagesPageLoginHint({ index }: PackagesPageLoginHintProps) {
  const m = useTranslations("marketing");
  const common = useTranslations("common");
  const audience = useMarketingAudience();
  const hintCopy = resolvePackagesGuestHintCopy(common, m);

  if (audience === "member") {
    return null;
  }

  return (
    <PackagesPageReveal index={index}>
      <PackagesGuestHint {...hintCopy} className="mt-8" />
    </PackagesPageReveal>
  );
}
