"use client";

import { useEffect, useMemo, useState } from "react";
import {
  reviewFromOpenEventDetail,
  selectAutoPromptReview,
} from "@/components/account/session-review-prompt-gate.helpers";
import { SessionReviewPromptModal } from "@/components/account/session-review-prompt-modal";
import { useSessionReviewsPending } from "@/hooks/use-session-reviews-pending";
import { usePathname } from "@/i18n/navigation";
import { markAutoPromptedEndsAt } from "@/lib/session-review-auto-prompt-storage";
import { SESSION_REVIEW_OPEN_EVENT } from "@/lib/session-reviews-events";
import type { MemberPendingReview } from "@/lib/session-reviews-types";

type SessionReviewPromptGateProps = {
  deferAutoPrompt: boolean;
};

function useOpenedReviewFromEvent(
  items: readonly MemberPendingReview[],
): [
  MemberPendingReview | null,
  (review: MemberPendingReview | null) => void,
] {
  const [openedFromEvent, setOpenedFromEvent] = useState<MemberPendingReview | null>(
    null,
  );

  useEffect(() => {
    function onOpen(event: Event) {
      if (!(event instanceof CustomEvent)) {
        return;
      }
      const found = reviewFromOpenEventDetail(
        event.detail as { reviewId?: string; review?: MemberPendingReview },
        items,
      );
      if (found) {
        setOpenedFromEvent(found);
      }
    }
    window.addEventListener(SESSION_REVIEW_OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener(SESSION_REVIEW_OPEN_EVENT, onOpen);
    };
  }, [items]);

  return [openedFromEvent, setOpenedFromEvent];
}

export function SessionReviewPromptGate({
  deferAutoPrompt,
}: SessionReviewPromptGateProps) {
  const pathname = usePathname() ?? "";
  const { items, refetch } = useSessionReviewsPending(true);
  const [openedFromEvent, setOpenedFromEvent] = useOpenedReviewFromEvent(items);
  const [suppressedIds, setSuppressedIds] = useState<ReadonlySet<string>>(() => new Set());

  const autoPrompt = useMemo(
    () =>
      selectAutoPromptReview({
        deferAutoPrompt,
        openedFromEvent,
        pathname,
        items,
        suppressedIds,
      }),
    [deferAutoPrompt, items, openedFromEvent, pathname, suppressedIds],
  );

  const active = openedFromEvent ?? autoPrompt;
  if (!active) {
    return null;
  }

  const closedWasAutoPrompt = openedFromEvent === null;

  return (
    <SessionReviewPromptModal
      review={active}
      onClosed={() => {
        if (closedWasAutoPrompt) {
          markAutoPromptedEndsAt(active.endsAt);
        }
        setOpenedFromEvent(null);
        setSuppressedIds((previous) => new Set([...previous, active.id]));
        void refetch();
      }}
    />
  );
}
