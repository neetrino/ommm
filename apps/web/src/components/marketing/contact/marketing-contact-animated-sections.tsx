"use client";

import type { ReactNode } from "react";
import { CONTACT_PAGE_REVEAL_MOTION } from "@/components/marketing/contact/contact-page-tokens";
import { MarketingScrollReveal } from "@/components/marketing/marketing-scroll-reveal";
import styles from "@/components/marketing/contact/marketing-contact-page-content.module.css";

type MarketingContactAnimatedSectionsProps = {
  studioCard: ReactNode;
  messageForm: ReactNode;
};

const CONTACT_ABOVE_FOLD_REVEAL = {
  entrance: "aboveFold" as const,
  profile: CONTACT_PAGE_REVEAL_MOTION,
};

export function MarketingContactAnimatedSections({
  studioCard,
  messageForm,
}: MarketingContactAnimatedSectionsProps) {
  return (
    <div className={styles.layout}>
      <MarketingScrollReveal index={0} gridColumns={1} {...CONTACT_ABOVE_FOLD_REVEAL}>
        {studioCard}
      </MarketingScrollReveal>
      <MarketingScrollReveal index={1} gridColumns={1} {...CONTACT_ABOVE_FOLD_REVEAL}>
        {messageForm}
      </MarketingScrollReveal>
    </div>
  );
}
