"use client";

import type { ReactNode } from "react";
import { MarketingReveal } from "@/components/marketing/marketing-reveal";
import styles from "@/components/marketing/contact/marketing-contact-page-content.module.css";

type MarketingContactAnimatedSectionsProps = {
  studioCard: ReactNode;
  messageForm: ReactNode;
  mapEmbed?: ReactNode;
};

export function MarketingContactAnimatedSections({
  studioCard,
  messageForm,
  mapEmbed,
}: MarketingContactAnimatedSectionsProps) {
  return (
    <>
      <div className={styles.layout}>
        <MarketingReveal index={0}>{studioCard}</MarketingReveal>
        <MarketingReveal index={1}>{messageForm}</MarketingReveal>
      </div>
      {mapEmbed ? <MarketingReveal index={2}>{mapEmbed}</MarketingReveal> : null}
    </>
  );
}
