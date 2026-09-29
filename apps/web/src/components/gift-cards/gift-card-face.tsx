import { DEFAULT_GIFT_CARD_IMAGE_SRC } from "@/components/gift-cards/gift-card-image";

const GIFT_CARD_CODE_CLASS = [
  "pointer-events-none absolute bottom-[8%] right-[5%] max-w-[55%] truncate text-right",
  "font-serif leading-none tracking-[0.08em] text-[#8f8478]",
  "text-[clamp(0.55rem,2.4cqi,1.15rem)]",
].join(" ");

type GiftCardFaceProps = {
  alt: string;
  /** Printed in the corner where the template left room for the card code. */
  code?: string | null;
  className?: string;
};

/** Shared Ommm gift-card artwork. A code, when present, is drawn on the face. */
export function GiftCardFace({ alt, code, className }: GiftCardFaceProps) {
  const printedCode = code?.trim() ?? "";
  return (
    <span className={`@container relative block overflow-hidden ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static studio artwork, not a remote CMS image */}
      <img
        src={DEFAULT_GIFT_CARD_IMAGE_SRC}
        alt={alt}
        className="block h-full w-full object-cover"
      />
      {printedCode.length > 0 ? (
        <span className={GIFT_CARD_CODE_CLASS}>{printedCode}</span>
      ) : null}
    </span>
  );
}
