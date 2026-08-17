"use client";

import { useEffect, useMemo, useState } from "react";
import { SessionReviewPromptModal } from "@/components/account/session-review-prompt-modal";
import { useSessionReviewsPending } from "@/hooks/use-session-reviews-pending";
import { SESSION_REVIEW_OPEN_EVENT } from "@/lib/session-reviews-events";
import { isSessionReviewLater } from "@/lib/session-review-later-storage";
import type { MemberPendingReview } from "@/lib/session-reviews-types";

type SessionReviewPromptGateProps = {
  deferAutoPrompt: boolean;
};

export function SessionReviewPromptGate({
  deferAutoPrompt,
}: SessionReviewPromptGateProps) {
  const { items, refetch } = useSessionReviewsPending(true);
  const [openedFromEvent, setOpenedFromEvent] = useState<MemberPendingReview | null>(null);
  const [suppressedIds, setSuppressedIds] = useState<ReadonlySet<string>>(() => new Set());

  useEffect(() => {
    function onOpen(event: Event) {
      if (!(event instanceof CustomEvent)) {
        return;
      }
      const detail = event.detail as {
        reviewId?: string;
        review?: MemberPendingReview;
      };
      if (detail.review && typeof detail.review.id === "string") {
        setOpenedFromEvent(detail.review);
        return;
      }
      if (typeof detail.reviewId === "string") {
        const found = items.find((row) => row.id === detail.reviewId);
        if (found) {
          setOpenedFromEvent(found);
        }
      }
    }
    window.addEventListener(SESSION_REVIEW_OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener(SESSION_REVIEW_OPEN_EVENT, onOpen);
    };
  }, [items]);

  const autoPrompt = useMemo(() => {
    if (deferAutoPrompt || openedFromEvent !== null) {
      return null;
    }
    return (
      items.find(
        (row) => !suppressedIds.has(row.id) && !isSessionReviewLater(row.id),
      ) ?? null
    );
  }, [deferAutoPrompt, items, openedFromEvent, suppressedIds]);

  const active = openedFromEvent ?? autoPrompt;

  if (!active) {
    return null;
  }

  return (
    <SessionReviewPromptModal
      review={active}
      onClosed={() => {
        const closedId = active.id;
        setOpenedFromEvent(null);
        setSuppressedIds((previous) => new Set([...previous, closedId]));
        void refetch();
      }}
    />
  );
}
