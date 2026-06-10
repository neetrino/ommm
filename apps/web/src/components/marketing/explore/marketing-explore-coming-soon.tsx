import Image from "next/image";
import { getTranslations } from "next-intl/server";
import styles from "@/components/marketing/explore/marketing-explore-coming-soon.module.css";
import { EXPLORE_PAGE_ASSETS } from "@/components/marketing/explore/explore-page-assets";
import { EXPLORE_PAGE_LAYOUT } from "@/components/marketing/explore/explore-page-tokens";
import { lcpImageProps } from "@/lib/image-loading-props";

type MarketingExploreComingSoonProps = {
  locale: string;
};

/** Full-bleed coming soon visual — Figma `422:1810`. */
export async function MarketingExploreComingSoon({
  locale,
}: MarketingExploreComingSoonProps) {
  const t = await getTranslations({ locale, namespace: "marketingPages.explore" });

  return (
    <div
      className={styles.root}
      style={{
        ["--explore-coming-soon-image-position-y" as string]:
          EXPLORE_PAGE_LAYOUT.comingSoonImagePositionY,
      }}
    >
      <Image
        src={EXPLORE_PAGE_ASSETS.comingSoon}
        alt={t("comingSoonAlt")}
        fill
        sizes="100vw"
        className={styles.image}
        {...lcpImageProps()}
      />
    </div>
  );
}
