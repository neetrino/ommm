import formStyles from "@/components/account/package-subscribe-payment-form.module.css";
import { GiftCreditsIcon } from "@/components/account/package-subscribe-gift-credits-toggle";

/** How long the gift-card hint stays after a package is chosen. */
export const PACKAGE_GIFT_HINT_MS = 1800;

type PackageGiftCardHintProps = {
  message: string;
};

/** Short overlay shown when a member who has a gift card picks a package. */
export function PackageGiftCardHint({ message }: PackageGiftCardHintProps) {
  return (
    <div className={formStyles.giftHintOverlay} role="status">
      <div className={formStyles.giftHintCard}>
        <span className={formStyles.giftCreditsHeadingIcon} aria-hidden>
          <GiftCreditsIcon />
        </span>
        <p className={formStyles.giftHintText}>{message}</p>
      </div>
    </div>
  );
}
