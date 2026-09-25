import { resolveGiftCardDisplaySrc } from "@/components/gift-cards/gift-card-image";

type GiftCardThumbnailProps = {
  imageUrl: string | null;
  alt: string;
  fallbackLabel: string;
  className?: string;
};

export function GiftCardThumbnail({
  imageUrl,
  alt,
  className,
}: GiftCardThumbnailProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- supports API and blob/image URLs
    <img
      src={resolveGiftCardDisplaySrc(imageUrl)}
      alt={alt}
      className={className ?? "h-full w-full object-contain"}
    />
  );
}
