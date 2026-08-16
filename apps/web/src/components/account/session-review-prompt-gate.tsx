"use client";

import { useEffect, useState } from "react";
import { SessionReviewPromptModal } from "@/components/account/session-review-prompt-modal";
import { useSessionReviewsPending } from "@/hooks/use-session-reviews-pending";
import { SESSION_REVIEW_OPEN_EVENT } from "@/lib/session-reviews-events";
import { isSessionReviewLater } from "@/lib/session-review-later-storage";

type SessionReviewPromptGateProps = {
  deferAutoPrompt: boolean;
};

export function SessionReviewPromptGate({
  deferAutoPrompt,
}: SessionReviewPromptGateProps) {
  const { items } = useSessionReviewsPending(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = items.find((row) => row.id === activeId) ?? null;

  useEffect(() => {
    function onOpen(event: Event) {
      if (!(event instanceof CustomEvent)) {
        return;
      }
      const detail = event.detail as { reviewId?: string };
      if (typeof detail.reviewId === "string") {
        setActiveId(detail.reviewId);
      }
    }
    window.addEventListener(SESSION_REVIEW_OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener(SESSION_REVIEW_OPEN_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (deferAutoPrompt || activeId !== null) {
      return;
    }
    const next = items.find((row) => !isSessionReviewLater(row.id));
    if (next) {
      setActiveId(next.id);
    }
  }, [activeId, deferAutoPrompt, items]);

  if (!active) {
    return null;
  }

  return (
    <SessionReviewPromptModal review={active} onClosed={() => setActiveId(null)} />
  );
}
