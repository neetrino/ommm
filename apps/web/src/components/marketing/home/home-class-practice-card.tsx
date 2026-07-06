import Image from "next/image";
import type { CSSProperties } from "react";
import styles from "@/components/marketing/home/home-class-practice-card.module.css";
import {
  HOME_CLASSES_SECTION_FIGMA,
  type HomeClassCardVisual,
} from "@/components/marketing/home/home-classes-section-tokens";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
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
  const imageZoneClass =
    visual.imageVariant === "wide"
      ? `${styles.imageZone} ${styles.imageZoneWide}`
      : styles.imageZone;
  const imageClass =
    visual.imageVariant === "flipY"
      ? `${styles.image} ${styles.imageFlipY}`
      : styles.image;

  return (
    <article
      className={`${gridClassName} ${styles.card}`}
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
          className={`${styles.title} ${marketingMontserrat.className} font-extrabold tracking-[0.045rem]`}
          style={{ color: HOME_CLASSES_SECTION_FIGMA.cardTitleColor }}
        >
          {titleLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h3>
        <p
          className={`${styles.body} font-sans font-normal`}
          style={{ color: HOME_CLASSES_SECTION_FIGMA.cardBodyColor }}
        >
          {body}
        </p>
      </div>
      <div className={imageZoneClass}>
        <Image
          src={visual.imageSrc}
          alt=""
          width={480}
          height={640}
          sizes="(max-width: 768px) 45vw, (max-width: 1366px) 38vw, 240px"
          className={imageClass}
          {...visibleRowImageProps(imageIndex)}
        />
      </div>
    </article>
  );
}
