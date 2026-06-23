import { getTranslations } from "next-intl/server";
import { MarketingPageSectionReveal } from "@/components/marketing/marketing-page-section-reveal";
import styles from "@/components/marketing/privacy/marketing-privacy-page-content.module.css";

type MarketingTermsPageContentProps = {
  locale: string;
};

type TermsSectionConfig = {
  id: string;
  titleKey: string;
  paragraphsKey?: string;
  leadKey?: string;
  itemsKey?: string;
  closingKey?: string;
};

const TERMS_SECTIONS: TermsSectionConfig[] = [
  { id: "general", titleKey: "generalTitle", paragraphsKey: "generalParagraphs" },
  {
    id: "definitions",
    titleKey: "definitionsTitle",
    leadKey: "definitionsLead",
    itemsKey: "definitionsItems",
  },
  {
    id: "obligations",
    titleKey: "obligationsTitle",
    leadKey: "obligationsLead",
    itemsKey: "obligationsItems",
    closingKey: "obligationsClosing",
  },
  {
    id: "liability",
    titleKey: "liabilityTitle",
    paragraphsKey: "liabilityParagraphs",
    leadKey: "liabilityLead",
    itemsKey: "liabilityItems",
    closingKey: "liabilityClosing",
  },
  { id: "ip", titleKey: "ipTitle", paragraphsKey: "ipParagraphs" },
  { id: "payments", titleKey: "paymentsTitle", paragraphsKey: "paymentsParagraphs" },
  { id: "disputes", titleKey: "disputesTitle", paragraphsKey: "disputesParagraphs" },
  {
    id: "forceMajeure",
    titleKey: "forceMajeureTitle",
    leadKey: "forceMajeureLead",
    itemsKey: "forceMajeureItems",
  },
  { id: "privacy", titleKey: "privacyTitle", paragraphsKey: "privacyParagraphs" },
];

function readStringArray(t: Awaited<ReturnType<typeof getTranslations>>, key: string): string[] {
  const value = t.raw(key);
  return Array.isArray(value) ? (value as string[]) : [];
}

/** Terms and conditions body copy — localized via `marketingPages.terms`. */
export async function MarketingTermsPageContent({
  locale,
}: MarketingTermsPageContentProps) {
  const t = await getTranslations({ locale, namespace: "marketingPages.terms" });

  return (
    <MarketingPageSectionReveal index={1}>
      <article className={styles.article}>
        {TERMS_SECTIONS.map((section) => {
          const headingId = `terms-${section.id}-heading`;
          const paragraphs = section.paragraphsKey
            ? readStringArray(t, section.paragraphsKey)
            : [];
          const items = section.itemsKey ? readStringArray(t, section.itemsKey) : [];

          return (
            <section
              key={section.id}
              className={styles.section}
              aria-labelledby={headingId}
            >
              <h2 id={headingId} className={styles.sectionTitle}>
                {t(section.titleKey)}
              </h2>
              <div className={styles.body}>
                {paragraphs.map((paragraph) => (
                  <p key={paragraph} className={styles.paragraph}>
                    {paragraph}
                  </p>
                ))}
                {section.leadKey ? (
                  <p className={styles.lead}>{t(section.leadKey)}</p>
                ) : null}
                {items.length > 0 ? (
                  <ul className={styles.list}>
                    {items.map((item) => (
                      <li key={item} className={styles.listItem}>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {section.closingKey && t(section.closingKey) ? (
                  <p className={styles.paragraph}>{t(section.closingKey)}</p>
                ) : null}
              </div>
            </section>
          );
        })}
      </article>
    </MarketingPageSectionReveal>
  );
}
