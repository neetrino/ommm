import type { PackagesPageCategoryStartDateCopy } from "@/components/marketing/packages/packages-page-category-data";
import styles from "@/components/marketing/packages/packages-page-category-card-start-date.module.css";

type PackagesPageCategoryCardStartDateProps = {
  startDateCopy: PackagesPageCategoryStartDateCopy | null | undefined;
  variant?: "card" | "collapsed";
};

export function PackagesPageCategoryCardStartDate({
  startDateCopy,
  variant = "card",
}: PackagesPageCategoryCardStartDateProps) {
  if (startDateCopy === null || startDateCopy === undefined) {
    return null;
  }

  const rootClassName =
    variant === "collapsed" ? `${styles.root} ${styles.rootCollapsed}` : styles.root;

  return (
    <div className={rootClassName}>
      <p className={styles.purchaseLine}>{startDateCopy.purchaseLabel}</p>
      <span aria-hidden className={styles.divider} />
      <p className={styles.attendLine}>
        <span className={styles.attendPrefix}>{startDateCopy.attendFromPrefix}</span>
        <span className={styles.attendDate}>{startDateCopy.attendFromDate}</span>
      </p>
    </div>
  );
}
