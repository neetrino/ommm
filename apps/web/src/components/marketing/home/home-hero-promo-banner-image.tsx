import styles from "@/components/marketing/home/home-hero-photo-banner.module.css";

type HomeHeroPromoBannerImageProps = {
  src: string;
  alt: string;
  pictureClassName: string;
  imageClassName: string;
  width: number;
  height: number;
};

/** Static WebP promo raster — native `<img>` for Safari/iOS (no next/image fill). */
export function HomeHeroPromoBannerImage({
  src,
  alt,
  pictureClassName,
  imageClassName,
  width,
  height,
}: HomeHeroPromoBannerImageProps) {
  return (
    <picture className={pictureClassName}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="eager"
        decoding="async"
        draggable={false}
        className={`${styles.homeHeroPromoRaster} ${imageClassName}`}
      />
    </picture>
  );
}
