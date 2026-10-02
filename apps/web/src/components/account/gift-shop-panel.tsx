"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CustomGiftComposerModal } from "@/components/account/custom-gift-composer-modal";
import { GiftPurchaseForm } from "@/components/account/gift-purchase-form";
import { USER_GIFT_CARDS_SECTION_TITLE_CLASS } from "@/components/account/user-gift-card-tile-layout";
import { OmmButton } from "@/components/ui/omm-button";

type GiftShopPanelProps = {
  locale: string;
};

/** Ready-made gift cards, plus a button that opens a custom gift. */
export function GiftShopPanel({ locale }: GiftShopPanelProps) {
  const tPage = useTranslations("userPages.giftCards");
  const tCustom = useTranslations("userPages.giftCards.customGift");
  const [composerOpen, setComposerOpen] = useState(false);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={USER_GIFT_CARDS_SECTION_TITLE_CLASS}>{tPage("marketHeading")}</h2>
        <OmmButton type="button" variant="primary" onClick={() => setComposerOpen(true)}>
          {tCustom("buyNewGift")}
        </OmmButton>
      </div>
      <GiftPurchaseForm locale={locale} />
      <CustomGiftComposerModal
        isOpen={composerOpen}
        locale={locale}
        onClose={() => setComposerOpen(false)}
      />
    </section>
  );
}
