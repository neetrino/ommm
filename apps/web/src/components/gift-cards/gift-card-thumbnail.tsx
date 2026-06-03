import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";

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
  const resolvedImage = resolveApiAssetUrl(imageUrl);

  if (resolvedImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- supports API and blob/image URLs
      <img
        src={resolvedImage}
        alt={alt}
        className={className ?? "h-full w-full object-cover"}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-sand-100 via-paper to-mint-100 ${className ?? "h-full w-full"}`}
    >
      <span className="text-xs font-medium text-sage-600">{fallbackLabel}</span>
    </div>
  );
}
