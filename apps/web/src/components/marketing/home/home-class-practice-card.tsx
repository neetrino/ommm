import Image from "next/image";
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
};

export function HomeClassPracticeCard({
  visual,
  titleLines,
  body,
  gridClassName,
  imageIndex,
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
      style={{
        backgroundColor: visual.background,
        borderWidth: visual.bordered ? 1 : 0,
        borderStyle: visual.bordered ? "solid" : undefined,
        borderColor: visual.bordered ? HOME_CLASSES_SECTION_FIGMA.cardBorder : undefined,
        ["--home-class-card-min-h" as string]: `${HOME_CLASSES_SECTION_FIGMA.cardMinHeightPx}px`,
      }}
    >
      <div className={styles.copy}>
        <h3
          className={`${marketingMontserrat.className} text-2xl font-extrabold leading-[1.3] tracking-[0.045rem]`}
          style={{ color: HOME_CLASSES_SECTION_FIGMA.cardTitleColor }}
        >
          {titleLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h3>
        <p
          className={`${marketingMontserrat.className} mt-3 text-base font-normal leading-6`}
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
          sizes="(max-width: 768px) 45vw, 240px"
          className={imageClass}
          {...visibleRowImageProps(imageIndex)}
        />
      </div>
    </article>
  );
}
