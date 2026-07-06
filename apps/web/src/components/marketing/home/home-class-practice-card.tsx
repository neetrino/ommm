import Image from "next/image";
import type { CSSProperties } from "react";
import styles from "@/components/marketing/home/home-class-practice-card.module.css";
import {
  HOME_CLASSES_SECTION_FIGMA,
  type HomeClassCardVisual,
} from "@/components/marketing/home/home-classes-section-tokens";
import { visibleRowImageProps } from "@/lib/image-loading-props";

type HomeClassPracticeCardProps = {
  visual: HomeClassCardVisual;
  titleLines: readonly string[];
  body: string;
  gridClassName: string;
  imageIndex: number;
  style?: CSSProperties;
};

export function HomeClassPracticeCard({
  visual,
  titleLines,
  body,
  gridClassName,
  imageIndex,
  style,
}: HomeClassPracticeCardProps) {
  const titleColor = visual.titleColor ?? HOME_CLASSES_SECTION_FIGMA.cardTitleColor;
  const bodyColor = visual.bodyColor ?? HOME_CLASSES_SECTION_FIGMA.cardBodyColor;
  const isFullBleed = visual.imageVariant === "fullBleed";

  const imageZoneClass = isFullBleed
    ? styles.imageZoneFullBleed
    : visual.imageVariant === "wide"
      ? `${styles.imageZone} ${styles.imageZoneWide}`
      : styles.imageZone;
  const imageClass = isFullBleed
    ? styles.imageFullBleed
    : visual.imageVariant === "flipY"
      ? `${styles.image} ${styles.imageFlipY}`
      : styles.image;

  return (
    <article
      className={`${gridClassName} ${styles.card} ${isFullBleed ? styles.cardFullBleed : ""}`}
      data-card-id={visual.id}
      style={{
        backgroundColor: visual.background,
        borderWidth: visual.bordered ? 1 : 0,
        borderStyle: visual.bordered ? "solid" : undefined,
        borderColor: visual.bordered ? HOME_CLASSES_SECTION_FIGMA.cardBorder : undefined,
        ...style,
      }}
    >
      <div className={styles.copy}>
        <h3
          className={`${styles.title} font-serif font-semibold italic tracking-[0.02em]`}
          style={{ color: titleColor }}
        >
          {titleLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h3>
        <p className={`${styles.body} font-sans font-normal`} style={{ color: bodyColor }}>
          {body}
        </p>
      </div>
      <div className={imageZoneClass}>
        <Image
          src={visual.imageSrc}
          alt=""
          fill={isFullBleed}
          width={isFullBleed ? undefined : 480}
          height={isFullBleed ? undefined : 640}
          sizes="(max-width: 768px) 72vw, (max-width: 1366px) 32vw, 420px"
          className={imageClass}
          {...visibleRowImageProps(imageIndex)}
        />
      </div>
    </article>
  );
}
