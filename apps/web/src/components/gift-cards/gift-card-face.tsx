import { DEFAULT_GIFT_CARD_IMAGE_SRC } from "@/components/gift-cards/gift-card-image";

const GIFT_CARD_CODE_CLASS = [
  "whitespace-nowrap font-serif font-medium leading-none tracking-[0.16em] text-[#6f655c]",
  "text-[clamp(0.72rem,4.8cqi,1.3rem)]",
  "[text-shadow:0_1px_0_rgba(255,248,230,0.85)]",
].join(" ");

type GiftCardFaceProps = {
  alt: string;
  /** Printed in the corner where the template left room for the card code. */
  code?: string | null;
  /** Batch inventory may hold several codes. The artwork prints only the first. */
  codes?: readonly string[];
  className?: string;
};

function printedGiftCardCode(
  code: string | null | undefined,
  codes: readonly string[] | undefined,
): string {
  const listed = (codes ?? []).map((value) => value.trim()).find((value) => value.length > 0);
  if (listed !== undefined) {
    return listed;
  }
  return code?.trim() ?? "";
}

/** Shared Ommm gift-card artwork. Codes, when present, are drawn on the face. */
export function GiftCardFace({ alt, code, codes, className }: GiftCardFaceProps) {
  const printed = printedGiftCardCode(code, codes);
  return (
    <span className={`@container relative block overflow-hidden ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static studio artwork, not a remote CMS image */}
      <img
        src={DEFAULT_GIFT_CARD_IMAGE_SRC}
        alt={alt}
        className="block h-full w-full object-cover"
      />
      {printed.length > 0 ? (
        <span className="pointer-events-none absolute bottom-[8%] right-[5%] max-w-[70%]">
          <span className={GIFT_CARD_CODE_CLASS}>{printed}</span>
        </span>
      ) : null}
    </span>
  );
}
