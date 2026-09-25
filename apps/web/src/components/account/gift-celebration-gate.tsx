"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { GiftCelebrationModal } from "@/components/account/gift-celebration-modal";
import type { UserGiftCardRow } from "@/components/account/user-gift-cards-types";
import { usePathname } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api";
import {
  markGiftCelebrationSeen,
  readSeenGiftCelebrationIds,
  selectUnseenGiftCelebration,
} from "@/lib/gift-celebration";

type GiftCelebrationGateProps = {
  deferAutoPrompt: boolean;
};

function isGiftPaymentPath(pathname: string): boolean {
  return (
    pathname.includes("/gift-cards/checkout") ||
    pathname.includes("/gift-cards/fake-payment")
  );
}

export function GiftCelebrationGate({ deferAutoPrompt }: GiftCelebrationGateProps) {
  const locale = useLocale();
  const pathname = usePathname() ?? "";
  const card = useUnseenGiftCelebration(deferAutoPrompt, pathname);
  const [dismissedId, setDismissedId] = useState<string | null>(null);

  if (
    deferAutoPrompt ||
    isGiftPaymentPath(pathname) ||
    card === null ||
    card.id === dismissedId
  ) {
    return null;
  }

  return (
    <GiftCelebrationModal
      card={card}
      locale={locale}
      onClose={() => {
        markGiftCelebrationSeen(card.id);
        setDismissedId(card.id);
      }}
    />
  );
}

function useUnseenGiftCelebration(
  deferred: boolean,
  pathname: string,
): UserGiftCardRow | null {
  const [card, setCard] = useState<UserGiftCardRow | null>(null);

  useEffect(() => {
    if (deferred) {
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        const rows = await apiFetch<UserGiftCardRow[]>("/gift-cards/me/received");
        if (cancelled) {
          return;
        }
        setCard(
          selectUnseenGiftCelebration(rows, readSeenGiftCelebrationIds(), Date.now()),
        );
      } catch {
        if (!cancelled) {
          setCard(null);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [deferred, pathname]);

  return card;
}
