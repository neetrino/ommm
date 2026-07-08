import Image from "next/image";
import { HOME_FOOTER_INSTAGRAM } from "@/components/marketing/home/home-footer-section-tokens";
import { renderAtSignText } from "@/lib/render-at-sign-text";

type MarketingPublicHomeFooterInstagramRowProps = {
  rowClassName: string;
  iconClassName: string;
  textClassName: string;
  atSignClassName: string;
  ariaLabel: string;
  as?: "li" | "div";
};

/** Instagram handle row — icon + @ommm.space under address. */
export function MarketingPublicHomeFooterInstagramRow({
  rowClassName,
  iconClassName,
  textClassName,
  atSignClassName,
  ariaLabel,
  as: Tag = "li",
}: MarketingPublicHomeFooterInstagramRowProps) {
  return (
    <Tag className={rowClassName}>
      <Image
        src={HOME_FOOTER_INSTAGRAM.asset}
        alt=""
        width={HOME_FOOTER_INSTAGRAM.iconWidthPx}
        height={HOME_FOOTER_INSTAGRAM.iconHeightPx}
        unoptimized
        className={iconClassName}
        aria-hidden
      />
      <a
        href={HOME_FOOTER_INSTAGRAM.href}
        className={textClassName}
        aria-label={ariaLabel}
        target="_blank"
        rel="noopener noreferrer"
      >
        {renderAtSignText(HOME_FOOTER_INSTAGRAM.handle, atSignClassName)}
      </a>
    </Tag>
  );
}
