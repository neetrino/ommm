"use client";

import { useEffect, useState } from "react";
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
  const [active, setActive] = useState<MemberPendingReview | null>(null);

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
        setActive(detail.review);
        return;
      }
      if (typeof detail.reviewId === "string") {
        const found = items.find((row) => row.id === detail.reviewId);
        if (found) {
          setActive(found);
        }
      }
    }
    window.addEventListener(SESSION_REVIEW_OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener(SESSION_REVIEW_OPEN_EVENT, onOpen);
    };
  }, [items]);

  useEffect(() => {
    if (deferAutoPrompt || active !== null) {
      return;
    }
    const next = items.find((row) => !isSessionReviewLater(row.id));
    if (next) {
      setActive(next);
    }
  }, [active, deferAutoPrompt, items]);

  if (!active) {
    return null;
  }

  return (
    <SessionReviewPromptModal
      review={active}
      onClosed={() => {
        setActive(null);
        void refetch();
      }}
    />
  );
}
