import { getTranslations } from "next-intl/server";
import { MarketingPageSectionReveal } from "@/components/marketing/marketing-page-section-reveal";
import styles from "@/components/marketing/privacy/marketing-privacy-page-content.module.css";

type MarketingPrivacyPageContentProps = {
  locale: string;
};

type PrivacySectionConfig = {
  id: string;
  titleKey: string;
  leadKey?: string;
  itemsKey?: string;
  closingKey?: string;
};

const PRIVACY_SECTIONS: PrivacySectionConfig[] = [
  { id: "collected", titleKey: "collectedTitle", leadKey: "collectedLead", itemsKey: "collectedItems" },
  { id: "use", titleKey: "useTitle", leadKey: "useLead", itemsKey: "useItems" },
  { id: "retention", titleKey: "retentionTitle", leadKey: "retentionLead", itemsKey: "retentionItems" },
  { id: "security", titleKey: "securityTitle", leadKey: "securityLead", itemsKey: "securityItems" },
  {
    id: "sharing",
    titleKey: "sharingTitle",
    leadKey: "sharingLead",
    itemsKey: "sharingItems",
    closingKey: "sharingClosing",
  },
  { id: "rights", titleKey: "rightsTitle", leadKey: "rightsLead", itemsKey: "rightsItems" },
  {
    id: "cookies",
    titleKey: "cookiesTitle",
    leadKey: "cookiesLead",
    itemsKey: "cookiesItems",
    closingKey: "cookiesClosing",
  },
  { id: "changes", titleKey: "changesTitle", leadKey: "changesLead" },
];

/** Privacy policy body copy — localized via `marketingPages.privacy`. */
export async function MarketingPrivacyPageContent({
  locale,
}: MarketingPrivacyPageContentProps) {
  const t = await getTranslations({ locale, namespace: "marketingPages.privacy" });

  return (
    <MarketingPageSectionReveal index={1}>
      <article className={styles.article}>
        <p className={styles.intro}>{t("introP1")}</p>
        <p className={styles.intro}>{t("introP2")}</p>
        <p className={styles.intro}>{t("introP3")}</p>

        {PRIVACY_SECTIONS.map((section) => {
          const headingId = `privacy-${section.id}-heading`;
          const items = section.itemsKey
            ? (t.raw(section.itemsKey) as string[])
            : null;

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
                {section.leadKey ? (
                  <p className={styles.lead}>{t(section.leadKey)}</p>
                ) : null}
                {items && items.length > 0 ? (
                  <ul className={styles.list}>
                    {items.map((item) => (
                      <li key={item} className={styles.listItem}>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {section.closingKey ? (
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
