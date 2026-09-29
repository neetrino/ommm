import { DEFAULT_GIFT_CARD_IMAGE_SRC } from "@/components/gift-cards/gift-card-image";

const GIFT_CARD_CODE_CLASS = [
  "font-serif leading-none tracking-[0.08em] text-[#8f8478]",
  "text-[clamp(0.7rem,3.1cqi,1.2rem)]",
].join(" ");

type GiftCardFaceProps = {
  alt: string;
  /** Printed in the corner where the template left room for the card code. */
  code?: string | null;
  /** Several codes on one batch face, stacked in that same corner. */
  codes?: readonly string[];
  className?: string;
};

function printedGiftCardCodes(
  code: string | null | undefined,
  codes: readonly string[] | undefined,
): string[] {
  const many = (codes ?? []).map((value) => value.trim()).filter((value) => value.length > 0);
  if (many.length > 0) {
    return many;
  }
  const single = code?.trim() ?? "";
  return single.length > 0 ? [single] : [];
}

/** Shared Ommm gift-card artwork. Codes, when present, are drawn on the face. */
export function GiftCardFace({ alt, code, codes, className }: GiftCardFaceProps) {
  const lines = printedGiftCardCodes(code, codes);
  return (
    <span className={`@container relative block overflow-hidden ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static studio artwork, not a remote CMS image */}
      <img
        src={DEFAULT_GIFT_CARD_IMAGE_SRC}
        alt={alt}
        className="block h-full w-full object-cover"
      />
      {lines.length > 0 ? (
        <span className="pointer-events-none absolute bottom-[7%] right-[4%] flex max-w-[78%] flex-col items-end gap-0.5">
          {lines.map((line) => (
            <span key={line} className={GIFT_CARD_CODE_CLASS}>
              {line}
            </span>
          ))}
        </span>
      ) : null}
    </span>
  );
}
