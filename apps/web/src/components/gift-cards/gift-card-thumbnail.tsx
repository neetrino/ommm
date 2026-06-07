import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";
import { sanitizeImageSrcUrl } from "@/lib/sanitize-image-src-url";

type GiftCardThumbnailProps = {
  imageUrl: string | null;
  alt: string;
  fallbackLabel: string;
  className?: string;
};

export function GiftCardThumbnail({
  imageUrl,
  alt,
  fallbackLabel,
  className,
}: GiftCardThumbnailProps) {
  const apiImageUrl = resolveApiAssetUrl(imageUrl);
  const resolvedImage =
    apiImageUrl !== undefined ? sanitizeImageSrcUrl(apiImageUrl) : null;
  const imageSrc = resolvedImage !== null ? encodeURI(resolvedImage) : null;

  if (imageSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- supports API and blob/image URLs
      <img
        src={imageSrc}
        alt={alt}
        className={className ?? "h-full w-full object-cover"}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-sand-50 via-paper to-mint-50 ${className ?? "h-full w-full"}`}
    >
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-sage-500">
        {fallbackLabel}
      </span>
    </div>
  );
}
