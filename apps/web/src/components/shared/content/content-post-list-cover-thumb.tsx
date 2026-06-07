import { ImageGlyph } from "@/components/ui/admin-action-glyphs";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";

type ContentPostListCoverThumbProps = {
  coverImageUrl?: string | null;
  title: string;
};

export function ContentPostListCoverThumb({
  coverImageUrl,
  title,
}: ContentPostListCoverThumbProps) {
  const resolvedImage = resolveApiAssetUrl(coverImageUrl ?? null);

  if (resolvedImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- supports API and blob/image URLs
      <img src={resolvedImage} alt={title} className="h-full w-full object-cover" />
    );
  }

  return (
    <div
      className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sand-50 via-paper to-mint-50"
      aria-hidden
    >
      <ImageGlyph className="h-4 w-4 text-sage-400" />
    </div>
  );
}
