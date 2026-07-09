import styles from "@/components/marketing/home/home-gallery-webp-image.module.css";

type HomeGalleryWebpImageProps = {
  src: string;
  draggable?: boolean;
};

/** Gallery raster — static WebP via `<picture>` (no next/image optimization). */
export function HomeGalleryWebpImage({ src, draggable = true }: HomeGalleryWebpImageProps) {
  return (
    <picture className={styles.picture}>
      <source srcSet={src} type="image/webp" />
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={draggable}
        className={`${styles.image}${draggable ? "" : ` ${styles.imageNoDrag}`}`}
      />
    </picture>
  );
}
