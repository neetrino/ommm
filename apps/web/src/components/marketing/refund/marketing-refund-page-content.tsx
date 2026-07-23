import { getTranslations } from "next-intl/server";
import { MarketingPageSectionReveal } from "@/components/marketing/marketing-page-section-reveal";
import styles from "@/components/marketing/refund/marketing-refund-page-content.module.css";

type MarketingRefundPageContentProps = {
  locale: string;
};

/** Cancellation and refund policy body copy. */
export async function MarketingRefundPageContent({
  locale,
}: MarketingRefundPageContentProps) {
  const t = await getTranslations({ locale, namespace: "marketingPages.refund" });

  return (
    <MarketingPageSectionReveal index={1}>
      <article className={styles.article}>
        <p className={styles.intro}>{t("intro")}</p>

        <section className={styles.section} aria-labelledby="refund-cancelling-heading">
          <h2 id="refund-cancelling-heading" className={styles.sectionTitle}>
            {t("cancellingTitle")}
          </h2>
          <div className={styles.body}>
            <p className={styles.paragraph}>{t("cancellingP1")}</p>
            <p className={styles.paragraph}>{t("cancellingP2")}</p>
            <p className={styles.paragraph}>{t("cancellingP3")}</p>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="refund-refunds-heading">
          <h2 id="refund-refunds-heading" className={styles.sectionTitle}>
            {t("refundsTitle")}
          </h2>
          <div className={styles.body}>
            <p className={styles.paragraph}>{t("refundsP1")}</p>
            <p className={styles.paragraph}>{t("refundsP2")}</p>
            <p className={styles.paragraph}>{t("refundsP3")}</p>
          </div>
        </section>

        <p className={styles.closing}>{t("closing")}</p>
      </article>
    </MarketingPageSectionReveal>
  );
}
