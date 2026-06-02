import styles from "@/components/marketing/home/marketing-glass-circle-button.module.css";

const HORIZONTAL_ARROW_PATH =
  "M1.25 7.95495C0.559644 7.95495 0 8.5146 0 9.20495C0 9.89531 0.559644 10.455 1.25 10.455V9.20495V7.95495ZM25.3017 10.0888C25.7898 9.60068 25.7898 8.80922 25.3017 8.32107L17.3467 0.366117C16.8586 -0.122039 16.0671 -0.122039 15.5789 0.366117C15.0908 0.854272 15.0908 1.64573 15.5789 2.13388L22.65 9.20495L15.5789 16.276C15.0908 16.7642 15.0908 17.5556 15.5789 18.0438C16.0671 18.5319 16.8586 18.5319 17.3467 18.0438L25.3017 10.0888ZM1.25 9.20495V10.455H24.4178V9.20495V7.95495H1.25V9.20495Z";

export type MarketingGlassCircleArrow = "prev" | "next";

type MarketingGlassCircleShellProps = {
  arrow: MarketingGlassCircleArrow;
};

function MarketingGlassCircleShell({ arrow }: MarketingGlassCircleShellProps) {
  return (
    <>
      <span aria-hidden className={styles.glassBase} />
      <span aria-hidden className={styles.glassRadial} />
      <span aria-hidden className={styles.glassLinear} />
      <span aria-hidden className={styles.glassSweep} />
      <svg
        aria-hidden
        viewBox="0 0 26 19"
        className={`${styles.arrowHorizontal} ${
          arrow === "prev" ? styles.arrowHorizontalPrev : styles.arrowHorizontalNext
        }`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={HORIZONTAL_ARROW_PATH} fill="black" />
      </svg>
    </>
  );
}

export type MarketingGlassCircleButtonProps = {
  arrow: MarketingGlassCircleArrow;
  label: string;
  onPress: () => void;
  size?: "coachNav" | "coachCardInline";
};

/** Glass circle nav control — Featured Coaches `163:898` / `163:899`. */
export function MarketingGlassCircleButton({
  arrow,
  label,
  onPress,
  size = "coachNav",
}: MarketingGlassCircleButtonProps) {
  const sizeClass = size === "coachCardInline" ? styles.sizeCoachCardInline : styles.sizeCoachNav;

  return (
    <button
      type="button"
      className={`${styles.root} ${styles.button} ${sizeClass}`}
      aria-label={label}
      onClick={onPress}
    >
      <MarketingGlassCircleShell arrow={arrow} />
    </button>
  );
}
