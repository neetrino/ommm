"use client";

import type { ReactNode } from "react";
import { MarketingScrollReveal } from "@/components/marketing/marketing-scroll-reveal";
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
        <MarketingScrollReveal index={0} gridColumns={1}>
          {studioCard}
        </MarketingScrollReveal>
        <MarketingScrollReveal index={1} gridColumns={1}>
          {messageForm}
        </MarketingScrollReveal>
      </div>
      {mapEmbed ? (
        <MarketingScrollReveal index={2} gridColumns={1}>
          {mapEmbed}
        </MarketingScrollReveal>
      ) : null}
    </>
  );
}
