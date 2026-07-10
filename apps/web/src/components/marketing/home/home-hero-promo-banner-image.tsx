import styles from "@/components/marketing/home/home-hero-photo-banner.module.css";

type HomeHeroPromoBannerImageProps = {
  src: string;
  alt: string;
  pictureClassName: string;
  imageClassName: string;
};

/** Static WebP hero promo raster — native `<picture>` for Safari/iOS (no next/image fill). */
export function HomeHeroPromoBannerImage({
  src,
  alt,
  pictureClassName,
  imageClassName,
}: HomeHeroPromoBannerImageProps) {
  return (
    <picture className={pictureClassName}>
      <source srcSet={src} type="image/webp" />
      <img
        src={src}
        alt={alt}
        loading="eager"
        decoding="async"
        draggable={false}
        className={`${styles.homeHeroPromoRaster} ${imageClassName}`}
      />
    </picture>
  );
}
